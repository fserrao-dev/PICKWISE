import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { LessonPlayer } from "@/components/student/lesson-player";
import { extractYoutubeId } from "@/lib/utils";

interface Props { params: { id: string; lessonId: string } }

export default async function LearnPage({ params }: Props) {
  const session = await auth();
  if (!session) return null;
  const userId = session.user.id;

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: params.id } },
  });
  if (!enrollment) redirect(`/courses/${params.id}`);

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { progress: { where: { userId } } },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      questions: true,
      module: true,
    },
  });
  if (!lesson) notFound();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === params.lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const completedCount = allLessons.filter((l) => l.progress.some((p) => p.completed)).length;
  const pct = Math.round((completedCount / allLessons.length) * 100);

  const isCompleted = allLessons[currentIndex]?.progress.some((p) => p.completed) ?? false;
  const videoId = extractYoutubeId(lesson.youtubeUrl);

  const prevAttempt = await prisma.quizAttempt.findFirst({
    where: { userId, lessonId: params.lessonId },
    orderBy: { attemptedAt: "desc" },
  });

  return (
    <div className="max-w-4xl space-y-4">
      {/* Breadcrumb + nav */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <Link href={`/courses/${course.id}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            {course.title}
          </Link>
          <span className="text-muted-foreground">›</span>
          <span className="font-medium truncate">{lesson.title}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{completedCount}/{allLessons.length} completed</span>
          <div className="w-24">
            <Progress value={pct} className="h-2" />
          </div>
        </div>
      </div>

      {/* Title + status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{lesson.module.title}</p>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
        </div>
        {isCompleted && (
          <Badge variant="success" className="flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </Badge>
        )}
      </div>

      {/* Video */}
      {videoId ? (
        <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            className="w-full h-full"
            allowFullScreen
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Video not available</p>
        </div>
      )}

      {/* Description */}
      {lesson.description && (
        <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/40 rounded-lg p-4">
          {lesson.description}
        </div>
      )}

      {/* Quiz */}
      <LessonPlayer
        lessonId={lesson.id}
        courseId={course.id}
        questions={lesson.questions as any}
        isCompleted={isCompleted}
        prevAttempt={prevAttempt as any}
      />

      {/* Lesson navigation */}
      <div className="flex items-center justify-between pt-2">
        {prevLesson ? (
          <Link href={`/courses/${course.id}/learn/${prevLesson.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
          </Link>
        ) : <div />}

        {nextLesson ? (
          isCompleted ? (
            <Link href={`/courses/${course.id}/learn/${nextLesson.id}`}>
              <Button size="sm">
                Next Lesson
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button size="sm" disabled title="Complete this lesson to unlock the next">
              <Lock className="w-4 h-4" />
              Next Lesson
            </Button>
          )
        ) : isCompleted ? (
          <Link href={`/courses/${course.id}`}>
            <Button size="sm" variant="outline">
              Back to Course
            </Button>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
