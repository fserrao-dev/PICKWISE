"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { extractYoutubeId } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

const courseSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
});

export async function createCourse(formData: FormData) {
  await requireAdmin();

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    coverImageUrl: formData.get("coverImageUrl") as string,
  };

  const result = courseSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  const course = await prisma.course.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      coverImageUrl: result.data.coverImageUrl || null,
    },
  });

  revalidatePath("/admin/courses");
  return { success: true, id: course.id };
}

export async function updateCourse(id: string, formData: FormData) {
  await requireAdmin();

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    coverImageUrl: formData.get("coverImageUrl") as string,
  };

  const result = courseSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  await prisma.course.update({
    where: { id },
    data: {
      title: result.data.title,
      description: result.data.description,
      coverImageUrl: result.data.coverImageUrl || null,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  return { success: true };
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  await prisma.course.delete({ where: { id } });
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function toggleCoursePublish(id: string, isPublished: boolean) {
  await requireAdmin();
  await prisma.course.update({ where: { id }, data: { isPublished } });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  return { success: true };
}

export async function createModule(courseId: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  if (!title || title.length < 2) return { error: "El título del módulo es obligatorio" };

  const lastModule = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });

  await prisma.module.create({
    data: { courseId, title, order: (lastModule?.order ?? 0) + 1 },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function updateModule(id: string, courseId: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  if (!title || title.length < 2) return { error: "El título del módulo es obligatorio" };

  await prisma.module.update({ where: { id }, data: { title } });

  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function deleteModule(id: string, courseId: string) {
  await requireAdmin();
  await prisma.module.delete({ where: { id } });
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

const lessonSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  youtubeUrl: z.string().min(1, "La URL de YouTube es obligatoria"),
  description: z.string().optional(),
});

export async function createLesson(moduleId: string, formData: FormData) {
  await requireAdmin();

  const raw = {
    title: formData.get("title") as string,
    youtubeUrl: formData.get("youtubeUrl") as string,
    description: formData.get("description") as string,
  };

  const result = lessonSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  const videoId = extractYoutubeId(result.data.youtubeUrl);
  if (!videoId) return { error: "URL de YouTube inválida" };

  const module_ = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module_) return { error: "Módulo no encontrado" };

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
  });

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: result.data.title,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      description: result.data.description || null,
      order: (lastLesson?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/admin/courses/${module_.courseId}`);
  return { success: true, id: lesson.id };
}

export async function updateLesson(id: string, formData: FormData) {
  await requireAdmin();

  const raw = {
    title: formData.get("title") as string,
    youtubeUrl: formData.get("youtubeUrl") as string,
    description: formData.get("description") as string,
  };

  const result = lessonSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  const videoId = extractYoutubeId(result.data.youtubeUrl);
  if (!videoId) return { error: "URL de YouTube inválida" };

  await prisma.lesson.update({
    where: { id },
    data: {
      title: result.data.title,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      description: result.data.description || null,
    },
  });

  revalidatePath(`/admin/lessons/${id}`);
  return { success: true };
}

export async function deleteLesson(id: string) {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { module: true },
  });

  await prisma.lesson.delete({ where: { id } });

  if (lesson) {
    revalidatePath(`/admin/courses/${lesson.module.courseId}`);
  }

  return { success: true };
}

const questionSchema = z.object({
  text: z.string().min(5, "El texto de la pregunta es obligatorio"),
  options: z.array(z.string().min(1)).length(4, "Se requieren exactamente 4 opciones"),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().optional(),
});

export async function createQuestion(lessonId: string, data: {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}) {
  await requireAdmin();

  const result = questionSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  await prisma.question.create({
    data: {
      lessonId,
      text: result.data.text,
      options: result.data.options,
      correctIndex: result.data.correctIndex,
      explanation: result.data.explanation || null,
    },
  });

  revalidatePath(`/admin/lessons/${lessonId}`);
  return { success: true };
}

export async function updateQuestion(id: string, lessonId: string, data: {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}) {
  await requireAdmin();

  const result = questionSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  await prisma.question.update({
    where: { id },
    data: {
      text: result.data.text,
      options: result.data.options,
      correctIndex: result.data.correctIndex,
      explanation: result.data.explanation || null,
    },
  });

  revalidatePath(`/admin/lessons/${lessonId}`);
  return { success: true };
}

export async function deleteQuestion(id: string, lessonId: string) {
  await requireAdmin();
  await prisma.question.delete({ where: { id } });
  revalidatePath(`/admin/lessons/${lessonId}`);
  return { success: true };
}
