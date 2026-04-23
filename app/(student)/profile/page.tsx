import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateDownload } from "@/components/student/certificate-download";
import { Star, Award, BookOpen, ClipboardList, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return null;
  const userId = session.user.id;

  const [user, enrollments, attempts, leaderboardRank] = await Promise.all([
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
              include: { lessons: { include: { progress: { where: { userId } } } } },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { attemptedAt: "desc" },
      take: 30,
      include: { lesson: { select: { title: true } } },
    }),
    prisma.user.count({ where: { role: "STUDENT", points: { gt: 0 } } }),
  ]);

  const myRankCount = await prisma.user.count({
    where: { role: "STUDENT", points: { gt: user?.points ?? 0 } },
  });
  const rank = myRankCount + 1;

  const enrichedEnrollments = enrollments.map((e) => {
    const allLessons = e.course.modules.flatMap((m) => m.lessons);
    const completed = allLessons.filter((l) => l.progress.some((p) => p.completed)).length;
    const total = allLessons.length;
    return { ...e, completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((s, a) => s + (a.score / Math.max(a.totalQuestions, 1)) * 100, 0) /
            attempts.length
        )
      : 0;

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="w-20 h-20 text-2xl">
              <AvatarImage src={user?.avatarUrl || ""} />
              <AvatarFallback>
                {user?.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Miembro desde {user?.createdAt ? formatDate(user.createdAt) : ""}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: "Puntos", value: user?.points ?? 0, icon: "⭐" },
                { label: "Ranking", value: `#${rank}`, icon: "🏆" },
                { label: "Cursos", value: enrollments.length, icon: "📚" },
                { label: "Promedio", value: `${avgScore}%`, icon: "📊" },
              ].map((s) => (
                <div key={s.label} className="space-y-0.5">
                  <div className="text-xl">{s.icon}</div>
                  <div className="font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="courses">
        <TabsList className="w-full">
          <TabsTrigger value="courses" className="flex-1">
            <BookOpen className="w-4 h-4 mr-1" /> Cursos
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex-1">
            <Award className="w-4 h-4 mr-1" /> Insignias
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            <ClipboardList className="w-4 h-4 mr-1" /> Historial de quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-3 mt-4">
          {enrichedEnrollments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Aún no estás inscripto en ningún curso.</p>
          ) : (
            enrichedEnrollments.map((e) => (
              <Card key={e.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">{e.course.title}</CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                      {e.completedAt && (
                        <Badge variant="success" className="text-xs">✓ Completado</Badge>
                      )}
                      {e.certificateUrl && (
                        <CertificateDownload
                          certificateUrl={e.certificateUrl}
                          courseName={e.course.title}
                        />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Progress value={e.pct} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {e.completed}/{e.total}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inscripto el {formatDate(e.enrolledAt)}
                    {e.completedAt && ` · Completado el ${formatDate(e.completedAt)}`}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="badges" className="mt-4">
          {user?.badges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Aún no tenés insignias. ¡Completá lecciones y quizzes para ganarlas!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {user?.badges.map((ub) => (
                <Card key={ub.id} className="text-center">
                  <CardContent className="pt-6 pb-4">
                    <div className="text-4xl mb-2">{ub.badge.iconUrl}</div>
                    <p className="font-semibold text-sm">{ub.badge.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ub.badge.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(ub.awardedAt)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {attempts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Aún no realizaste ningún quiz.</p>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {attempts.map((a) => {
                    const pct = Math.round((a.score / Math.max(a.totalQuestions, 1)) * 100);
                    return (
                      <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{a.lesson.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(a.attemptedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-sm font-bold ${pct >= 70 ? "text-green-600" : "text-red-500"}`}>
                            {a.score}/{a.totalQuestions}
                          </span>
                          <Badge variant={pct >= 70 ? "success" : "destructive"} className="text-xs">
                            {pct}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
