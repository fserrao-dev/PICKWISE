"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createModule, deleteModule, createLesson } from "@/app/actions/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, ChevronDown, ChevronUp, BookOpen, FileQuestion } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Lesson {
  id: string;
  title: string;
  order: number;
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
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map((m) => m.id)));
  const [loading, setLoading] = useState(false);

  async function handleAddModule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createModule(courseId, formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Module added");
      setAddModuleOpen(false);
      router.refresh();
    }
  }

  async function handleAddLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!addLessonModuleId) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createLesson(addLessonModuleId, formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lesson added");
      setAddLessonModuleId(null);
      router.refresh();
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("Delete this module and all its lessons?")) return;
    const result = await deleteModule(moduleId, courseId);
    if (result.success) {
      toast.success("Module deleted");
      router.refresh();
    }
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
        <h2 className="text-xl font-semibold">Modules & Lessons</h2>
        <Button onClick={() => setAddModuleOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No modules yet. Add your first module to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((module) => {
            const expanded = expandedModules.has(module.id);
            return (
              <Card key={module.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      className="flex items-center gap-2 flex-1 text-left"
                      onClick={() => toggleModule(module.id)}
                    >
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-medium">{module.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {module.lessons.length} lessons
                      </Badge>
                    </button>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddLessonModuleId(module.id)}
                      >
                        <Plus className="w-3 h-3" />
                        Lesson
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expanded && module.lessons.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2 pl-6 border-l-2 border-muted ml-2">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between gap-2 py-1"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <FileQuestion className="h-3 w-3" />
                              {lesson._count.questions} Q
                            </span>
                            <Link href={`/admin/lessons/${lesson.id}`}>
                              <Button size="sm" variant="ghost" className="h-7 text-xs">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={addModuleOpen} onOpenChange={setAddModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Module</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddModule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Module Title</Label>
              <Input id="title" name="title" placeholder="e.g. Getting Started" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddModuleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Module"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!addLessonModuleId} onOpenChange={() => setAddLessonModuleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lessonTitle">Lesson Title</Label>
              <Input id="lessonTitle" name="title" placeholder="e.g. Introduction to Variables" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                name="youtubeUrl"
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonDesc">Description (optional)</Label>
              <Textarea id="lessonDesc" name="description" placeholder="Brief description..." rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddLessonModuleId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
