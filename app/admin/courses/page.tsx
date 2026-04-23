import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, Eye } from "lucide-react";
import { CourseActions } from "@/components/admin/course-actions";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      modules: { include: { lessons: true } },
      _count: { select: { enrollments: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">Administrá el catálogo de cursos</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nuevo curso
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aún no hay cursos</h3>
          <p className="text-muted-foreground mb-4">Creá tu primer curso para comenzar</p>
          <Link href="/admin/courses/new">
            <Button>
              <Plus className="w-4 h-4" />
              Crear curso
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => {
            const totalLessons = course.modules.flatMap((m) => m.lessons).length;
            return (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg truncate">{course.title}</CardTitle>
                        <Badge variant={course.isPublished ? "success" : "secondary"}>
                          {course.isPublished ? "Publicado" : "Borrador"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                          Gestionar
                        </Button>
                      </Link>
                      <CourseActions
                        courseId={course.id}
                        isPublished={course.isPublished}
                        courseTitle={course.title}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.modules.length} módulos · {totalLessons} lecciones
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course._count.enrollments} inscriptos
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
