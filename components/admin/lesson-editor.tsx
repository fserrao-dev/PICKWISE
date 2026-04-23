"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLesson } from "@/app/actions/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";

interface LessonEditorProps {
  lesson: {
    id: string;
    title: string;
    youtubeUrl: string;
    description: string | null;
  };
  courseId: string;
}

export function LessonEditor({ lesson }: LessonEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateLesson(lesson.id, formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lección actualizada");
      setEditing(false);
      router.refresh();
    }
  }

  if (!editing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Datos de la lección</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm font-medium">URL de YouTube: </span>
            <span className="text-sm text-muted-foreground">{lesson.youtubeUrl}</span>
          </div>
          {lesson.description && (
            <div>
              <span className="text-sm font-medium">Descripción: </span>
              <span className="text-sm text-muted-foreground">{lesson.description}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar lección</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={lesson.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">URL de YouTube</Label>
            <Input
              id="youtubeUrl"
              name="youtubeUrl"
              defaultValue={lesson.youtubeUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={lesson.description || ""}
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
