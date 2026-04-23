import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { EnrollStudentDialog } from "@/components/admin/enroll-student-dialog";

export default async function StudentsPage() {
  const [students, courses] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      include: {
        enrollments: {
          include: {
            course: { select: { title: true } },
          },
        },
        badges: { include: { badge: true } },
        _count: { select: { quizAttempts: true } },
      },
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">{students.length} registered students</p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No students yet</h3>
          <p className="text-muted-foreground">Students will appear here once they register</p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatarUrl || ""} />
                      <AvatarFallback>
                        {student.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{student.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {student.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <EnrollStudentDialog
                    studentId={student.id}
                    studentName={student.name}
                    enrolledCourseIds={student.enrollments.map((e) => e.courseId)}
                    courses={courses}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {student.badges.map((ub) => (
                      <Badge key={ub.id} variant="secondary" className="text-xs">
                        {ub.badge.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>{student.enrollments.length} courses enrolled</span>
                    <span className="mx-2">·</span>
                    <span>{student._count.quizAttempts} quiz attempts</span>
                    <span className="mx-2">·</span>
                    <span>
                      {student.enrollments.filter((e) => e.completedAt).length} completed
                    </span>
                  </div>
                  {student.enrollments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.enrollments.map((e) => (
                        <Badge key={e.id} variant={e.completedAt ? "success" : "outline"} className="text-xs">
                          {e.course.title}
                          {e.completedAt && " ✓"}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
