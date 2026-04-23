import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NotificationsList } from "@/components/student/notifications-list";
import { BookOpen, Trophy, Star, Award, GraduationCap, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;
  const userId = session.user.id;

  const [user, enrollments, notifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { badges: { include: { badge: true } } },
    }),
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: { progress: { where: { userId } } },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const leaderboardRank = await prisma.user.count({
    where: { role: "STUDENT", points: { gt: user?.points ?? 0 } },
  });

  const enriched = enrollments.map((e) => {
    const allLessons = e.course.modules.flatMap((m) => m.lessons);
    const completed = allLessons.filter((l) => l.progress.some((p) => p.completed)).length;
    const total = allLessons.length;
    return { ...e, completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Points", value: user?.points ?? 0, icon: Star, color: "text-yellow-500" },
          { label: "Courses", value: enriched.length, icon: BookOpen, color: "text-blue-500" },
          { label: "Completed", value: enriched.filter((e) => e.completedAt).length, icon: CheckCircle2, color: "text-green-500" },
          { label: "Rank", value: `#${leaderboardRank + 1}`, icon: Trophy, color: "text-purple-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6 pb-4 text-center">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Courses</h2>
            <Link href="/courses">
              <Button variant="outline" size="sm">Browse More</Button>
            </Link>
          </div>
          {enriched.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="font-medium mb-1">No courses yet</p>
                <p className="text-sm text-muted-foreground mb-4">Explore our catalog and start learning</p>
                <Link href="/courses"><Button>Browse Courses</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {enriched.map((e) => (
                <Card key={e.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{e.course.title}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {e.completed}/{e.total} lessons completed
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {e.completedAt && (
                          <Badge variant="success" className="text-xs">Completed</Badge>
                        )}
                        <Link href={`/courses/${e.courseId}`}>
                          <Button size="sm" variant={e.completedAt ? "outline" : "default"}>
                            {e.completedAt ? "Review" : "Continue"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <Progress value={e.pct} className="h-2 flex-1" />
                      <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                        {e.pct}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: badges + notifications */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                My Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.badges.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Complete lessons to earn badges!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.badges.map((ub) => (
                    <div
                      key={ub.id}
                      className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1"
                      title={ub.badge.description}
                    >
                      <span className="text-sm">{ub.badge.iconUrl}</span>
                      <span className="text-xs font-medium">{ub.badge.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <NotificationsList notifications={notifications} />
        </div>
      </div>
    </div>
  );
}
