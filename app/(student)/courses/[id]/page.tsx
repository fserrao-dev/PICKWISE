import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EnrollButton } from "@/components/student/enroll-button";
import { CertificateDownload } from "@/components/student/certificate-download";
import { BookOpen, Lock, CheckCircle2, PlayCircle, GraduationCap, Trophy } from "lucide-react";

interface Props { params: { id: string } }

export default async function CourseOverviewPage({ params }: Props) {
  const session = await auth();
  if (!session) return null;
  const userId = session.user.id;

  const course = await prisma.course.findUnique({
    where: { id: params.id, isPublished: true },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: { where: { userId } },
              _count: { select: { questions: true } },
            },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => l.progress.some((p) => p.completed)).length;
  const totalCount = allLessons.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const firstUnfinished = allLessons.find((l) => !l.progress.some((p) => p.completed));
  const resumeLesson = enrollment ? (firstUnfinished ?? allLessons[0]) : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-3">
        {course.coverImageUrl ? (
          <div className="aspect-video rounded-xl overflow-hidden">
            <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center">
            <GraduationCap className="w-20 h-20 text-primary/40" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-1">{course.description}</p>
        </div>

        {enrollment ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{completedCount}/{totalCount} lecciones completadas</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <Progress value={pct} className="h-3" />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {!enrollment ? (
            <EnrollButton courseId={course.id} />
          ) : (
            <>
              {resumeLesson && (
                <Link href={`/courses/${course.id}/learn/${resumeLesson.id}`}>
                  <Button>
                    <PlayCircle className="w-4 h-4" />
                    {pct === 0 ? "Empezar curso" : pct === 100 ? "Repasar" : "Continuar"}
                  </Button>
                </Link>
              )}
              {pct === 100 && enrollment.completedAt && (
                <>
                  <Badge variant="success" className="flex items-center gap-1 px-3 py-1.5">
                    <Trophy className="w-3.5 h-3.5" /> ¡Curso completado!
                  </Badge>
                  {enrollment.certificateUrl && (
                    <CertificateDownload
                      certificateUrl={enrollment.certificateUrl}
                      courseName={course.title}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contenido del curso</h2>
        {course.modules.map((module) => {
          const mTotal = module.lessons.length;
          const mDone = module.lessons.filter((l) => l.progress.some((p) => p.completed)).length;
          const mPct = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;

          return (
            <Card key={module.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {mDone}/{mTotal}
                  </span>
                </div>
                {enrollment && mTotal > 0 && (
                  <Progress value={mPct} className="h-1.5" />
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {module.lessons.map((lesson, idx) => {
                    const done = lesson.progress.some((p) => p.completed);
                    const prevDone =
                      idx === 0 || module.lessons[idx - 1].progress.some((p) => p.completed);
                    const accessible = enrollment && (done || prevDone || idx === 0);

                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="shrink-0">
                          {done ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : accessible ? (
                            <PlayCircle className="w-5 h-5 text-primary" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {accessible ? (
                            <Link
                              href={`/courses/${course.id}/learn/${lesson.id}`}
                              className="text-sm font-medium hover:text-primary transition-colors"
                            >
                              {lesson.title}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">{lesson.title}</span>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="w-3 h-3" />
                          {lesson._count.questions}P
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
