"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteModule, deleteLesson, reorderModule, reorderLesson } from "@/app/actions/courses";
import { CreateModuleDialog } from "@/components/admin/create-module-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileQuestion,
  ArrowUp,
  ArrowDown,
  Paperclip,
  Video,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  order: number;
  youtubeUrl: string;
  description: string | null;
  materials: { name: string; url: string }[] | null;
  _count: { questions: number };
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
}

export function ModuleManager({ courseId, modules }: ModuleManagerProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("¿Eliminar este módulo y todo su contenido?")) return;
    const result = await deleteModule(moduleId, courseId);
    if (result.success) {
      toast.success("Módulo eliminado");
      router.refresh();
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("¿Eliminar esta lección?")) return;
    const result = await deleteLesson(lessonId);
    if (result.success) {
      toast.success("Lección eliminada");
      router.refresh();
    }
  }

  async function handleReorderModule(moduleId: string, direction: "up" | "down") {
    const result = await reorderModule(moduleId, courseId, direction);
    if (result.error) toast.error(result.error);
    else router.refresh();
  }

  async function handleReorderLesson(lessonId: string, moduleId: string, direction: "up" | "down") {
    const result = await reorderLesson(lessonId, moduleId, courseId, direction);
    if (result.error) toast.error(result.error);
    else router.refresh();
  }

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Módulos</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          Agregar módulo
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Aún no hay módulos. Hacé clic en "Agregar módulo" para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((module, mi) => {
            const expanded = expandedModules.has(module.id);
            const isFirst = mi === 0;
            const isLast = mi === modules.length - 1;

            return (
              <Card key={module.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      className="flex items-center gap-2 flex-1 text-left min-w-0"
                      onClick={() => toggleModule(module.id)}
                    >
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-medium truncate">{module.title}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {module.lessons.length}{" "}
                        {module.lessons.length === 1 ? "lección" : "lecciones"}
                      </Badge>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={isFirst}
                        onClick={() => handleReorderModule(module.id, "up")}
                        title="Mover arriba"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={isLast}
                        onClick={() => handleReorderModule(module.id, "down")}
                        title="Mover abajo"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive ml-1"
                        onClick={() => handleDeleteModule(module.id)}
                        title="Eliminar módulo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expanded && (
                  <CardContent className="pt-0">
                    {module.lessons.length === 0 ? (
                      <p className="text-sm text-muted-foreground pl-6 py-2">
                        Este módulo no tiene lecciones aún.
                      </p>
                    ) : (
                      <div className="space-y-3 pl-6 border-l-2 border-muted ml-2">
                        {module.lessons.map((lesson, li) => {
                          const lessonFirst = li === 0;
                          const lessonLast = li === module.lessons.length - 1;
                          const matCount = lesson.materials?.length ?? 0;

                          return (
                            <div key={lesson.id} className="pt-2">
                              {/* Lesson header row */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="text-sm font-medium truncate">
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {/* stats */}
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Video className="h-3 w-3" />
                                    Video
                                  </span>
                                  {matCount > 0 && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
                                      <Paperclip className="h-3 w-3" />
                                      {matCount}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
                                    <FileQuestion className="h-3 w-3" />
                                    {lesson._count.questions}P
                                  </span>
                                  {/* reorder */}
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 ml-1"
                                    disabled={lessonFirst}
                                    onClick={() =>
                                      handleReorderLesson(lesson.id, module.id, "up")
                                    }
                                    title="Mover arriba"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    disabled={lessonLast}
                                    onClick={() =>
                                      handleReorderLesson(lesson.id, module.id, "down")
                                    }
                                    title="Mover abajo"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                  <Link href={`/admin/lessons/${lesson.id}`}>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                                      Editar
                                    </Button>
                                  </Link>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    title="Eliminar lección"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Materials preview */}
                              {matCount > 0 && (
                                <div className="mt-1.5 pl-6 flex flex-wrap gap-1.5">
                                  {lesson.materials!.map((mat, mi) => (
                                    <a
                                      key={mi}
                                      href={mat.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20"
                                    >
                                      <Paperclip className="h-2.5 w-2.5" />
                                      {mat.name}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <CreateModuleDialog
        courseId={courseId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
