import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import { AdminCharts } from "@/components/admin/charts";

export default async function AdminDashboard() {
  const [
    totalStudents,
    publishedCourses,
    totalAttempts,
    recentAttempts,
    topStudents,
    courseStats,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.findMany({
      take: 20,
      orderBy: { attemptedAt: "desc" },
      include: {
        user: { select: { name: true } },
        lesson: { select: { title: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { points: "desc" },
      take: 10,
      select: { id: true, name: true, points: true },
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      include: {
        enrollments: { include: { user: true } },
        modules: { include: { lessons: true } },
      },
      take: 10,
    }),
  ]);

  const avgScore =
    recentAttempts.length > 0
      ? Math.round(
          (recentAttempts.reduce((sum, a) => sum + (a.score / Math.max(a.totalQuestions, 1)) * 100, 0) /
            recentAttempts.length)
        )
      : 0;

  const courseCompletionData = courseStats.map((course) => {
    const totalLessons = course.modules.flatMap((m) => m.lessons).length;
    const completed = course.enrollments.filter((e) => e.completedAt).length;
    const enrolled = course.enrollments.length;
    return {
      name: course.title.slice(0, 20) + (course.title.length > 20 ? "..." : ""),
      rate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
      enrolled,
    };
  });

  const stats = [
    { title: "Active Students", value: totalStudents, icon: Users, color: "text-blue-600" },
    { title: "Published Courses", value: publishedCourses, icon: GraduationCap, color: "text-green-600" },
    { title: "Quiz Attempts", value: totalAttempts, icon: BookOpen, color: "text-purple-600" },
    { title: "Avg Quiz Score", value: `${avgScore}%`, icon: TrendingUp, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AdminCharts
        topStudents={topStudents}
        courseCompletionData={courseCompletionData}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Attempts</CardTitle>
          <CardDescription>Last 20 quiz submissions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAttempts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No quiz attempts yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 font-medium">Student</th>
                    <th className="text-left pb-2 font-medium">Lesson</th>
                    <th className="text-left pb-2 font-medium">Score</th>
                    <th className="text-left pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-muted/50">
                      <td className="py-2">{attempt.user.name}</td>
                      <td className="py-2 text-muted-foreground">{attempt.lesson.title}</td>
                      <td className="py-2">
                        <span
                          className={`font-medium ${
                            attempt.score / attempt.totalQuestions >= 0.7
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {attempt.score}/{attempt.totalQuestions} (
                          {Math.round((attempt.score / Math.max(attempt.totalQuestions, 1)) * 100)}%)
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(attempt.attemptedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
