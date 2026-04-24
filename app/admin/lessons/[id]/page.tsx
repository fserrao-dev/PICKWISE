import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { LessonEditor } from "@/components/admin/lesson-editor";
import { QuestionManager } from "@/components/admin/question-manager";
import { extractYoutubeId } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export default async function LessonPage({ params }: Props) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      questions: true,
      module: { include: { course: true } },
    },
  });

  if (!lesson) notFound();

  const videoId = extractYoutubeId(lesson.youtubeUrl);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/admin/courses/${lesson.module.courseId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="text-sm text-muted-foreground">
            {lesson.module.course.title} → {lesson.module.title}
          </div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
        </div>
      </div>

      {lesson.questions.length < 3 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Esta lección necesita al menos 3 preguntas antes de que los estudiantes puedan realizar el quiz.
          ({lesson.questions.length}/3 agregadas)
        </div>
      )}

      <LessonEditor lesson={lesson as any} courseId={lesson.module.courseId} />

      {videoId && (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      )}

      <QuestionManager lessonId={lesson.id} questions={lesson.questions as any} />
    </div>
  );
}
