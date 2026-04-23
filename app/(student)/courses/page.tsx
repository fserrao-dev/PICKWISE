import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, GraduationCap } from "lucide-react";
import { EnrollButton } from "@/components/student/enroll-button";

export default async function CoursesPage() {
  const session = await auth();
  if (!session) return null;
  const userId = session.user.id;

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      include: {
        modules: { include: { lessons: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: { include: { progress: { where: { userId } } } },
              },
            },
          },
        },
      },
    }),
  ]);

  const enrolledMap = new Map(
    enrollments.map((e) => {
      const allLessons = e.course.modules.flatMap((m) => m.lessons);
      const completed = allLessons.filter((l) => l.progress.some((p) => p.completed)).length;
      const total = allLessons.length;
      return [e.courseId, { pct: total > 0 ? Math.round((completed / total) * 100) : 0, completed, total }];
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-muted-foreground">Browse and enroll in available courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses available yet</h3>
          <p className="text-muted-foreground">Check back soon for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const totalLessons = course.modules.flatMap((m) => m.lessons).length;
            const progress = enrolledMap.get(course.id);
            const isEnrolled = !!progress;

            return (
              <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                {course.coverImageUrl ? (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={course.coverImageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-purple-400/20 rounded-t-lg flex items-center justify-center">
                    <GraduationCap className="w-12 h-12 text-primary/60" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{course.title}</CardTitle>
                    {isEnrolled && <Badge variant="success" className="text-xs shrink-0">Enrolled</Badge>}
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.modules.length} modules · {totalLessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course._count.enrollments}
                    </span>
                  </div>
                  {isEnrolled && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.pct}%</span>
                      </div>
                      <Progress value={progress.pct} className="h-1.5" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 gap-2">
                  {isEnrolled ? (
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        {progress!.pct === 100 ? "Review Course" : "Continue"}
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href={`/courses/${course.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">Preview</Button>
                      </Link>
                      <EnrollButton courseId={course.id} />
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
