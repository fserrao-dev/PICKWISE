"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEnrollmentEmail, sendCompletionEmail } from "@/lib/email";
import { awardPoints, checkAndAwardBadges, createNotification } from "@/lib/points";
import { generateCertificate } from "@/lib/certificate";

export async function enrollInCourse(courseId: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const userId = session.user.id;

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return { error: "Ya estás inscripto en este curso" };

  const [enrollment, course, user] = await Promise.all([
    prisma.enrollment.create({ data: { userId, courseId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (course && user) {
    sendEnrollmentEmail(user.name, user.email, course.title).catch(console.error);
    createNotification(userId, `Te inscribiste en "${course.title}"`).catch(console.error);
  }

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  return { success: true };
}

export async function adminEnrollStudent(userId: string, courseId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return { error: "El estudiante ya está inscripto" };

  const [enrollment, course, user] = await Promise.all([
    prisma.enrollment.create({ data: { userId, courseId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (course && user) {
    sendEnrollmentEmail(user.name, user.email, course.title).catch(console.error);
    createNotification(userId, `Un administrador te inscribió en "${course.title}"`).catch(console.error);
  }

  revalidatePath("/admin/students");
  return { success: true };
}

export async function submitQuiz(
  lessonId: string,
  answers: number[],
  courseId: string
) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const userId = session.user.id;

  const questions = await prisma.question.findMany({ where: { lessonId } });

  if (questions.length === 0) return { error: "No se encontraron preguntas" };

  let score = 0;
  const results = questions.map((q, i) => {
    const correct = answers[i] === q.correctIndex;
    if (correct) score++;
    return {
      questionId: q.id,
      selected: answers[i],
      correct,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    };
  });

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      lessonId,
      score,
      totalQuestions: questions.length,
      answers: results,
    },
  });

  const pointsEarned = score * 10;
  if (pointsEarned > 0) await awardPoints(userId, pointsEarned);

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: { userId, lessonId, completed: true, completedAt: new Date() },
  });

  await checkAndAwardBadges(userId, {
    lessonCompleted: true,
    perfectScore: score === questions.length,
  });

  await checkCourseCompletion(userId, courseId);

  revalidatePath(`/courses/${courseId}/learn/${lessonId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    score,
    total: questions.length,
    pointsEarned,
    results,
  };
}

async function checkCourseCompletion(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              progress: { where: { userId } },
            },
          },
        },
      },
    },
  });

  if (!course) return;

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const completedLessons = allLessons.filter((l) => l.progress.some((p) => p.completed));

  if (allLessons.length > 0 && completedLessons.length === allLessons.length) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (enrollment && !enrollment.completedAt) {
      const completionDate = new Date();

      let certUrl: string | undefined;
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          const certBuffer = await generateCertificate({
            studentName: user.name,
            courseName: course.title,
            completionDate,
            certificateId: enrollment.id,
          });
          certUrl = `data:application/pdf;base64,${certBuffer.toString("base64")}`;
        }
      } catch {
        console.error("Error al generar el certificado");
      }

      await prisma.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: { completedAt: completionDate, certificateUrl: certUrl },
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        sendCompletionEmail(user.name, user.email, course.title).catch(console.error);
        createNotification(
          userId,
          `🎉 ¡Felicitaciones! Completaste "${course.title}" y obtuviste tu certificado!`
        ).catch(console.error);
      }

      await checkAndAwardBadges(userId, { courseCompleted: true });
    }
  }
}

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { read: true },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
