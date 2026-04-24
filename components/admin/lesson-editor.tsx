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
import { Save, Loader2, Plus, Trash2, ExternalLink } from "lucide-react";

interface Material {
  name: string;
  url: string;
}

interface LessonEditorProps {
  lesson: {
    id: string;
    title: string;
    youtubeUrl: string;
    description: string | null;
    materials?: Material[] | null;
  };
  courseId: string;
}

export function LessonEditor({ lesson }: LessonEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [materials, setMaterials] = useState<Material[]>(
    (lesson.materials as Material[]) ?? []
  );

  function addMaterial() {
    setMaterials((prev) => [...prev, { name: "", url: "" }]);
  }

  function updateMaterial(i: number, field: keyof Material, value: string) {
    setMaterials((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function removeMaterial(i: number) {
    setMaterials((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const cleanMaterials = materials.filter((m) => m.name.trim() && m.url.trim());
    const result = await updateLesson(lesson.id, formData, cleanMaterials);
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
        <CardContent className="space-y-3">
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
          {materials.length > 0 && (
            <div>
              <span className="text-sm font-medium block mb-1">Material adjunto:</span>
              <div className="flex flex-wrap gap-2">
                {materials.map((mat, i) => (
                  <a
                    key={i}
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-full border border-primary/20"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    {mat.name}
                  </a>
                ))}
              </div>
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

          {/* Materials */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Material adjunto</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                <Plus className="w-3 h-3" />
                Agregar
              </Button>
            </div>
            {materials.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                PDFs, links o recursos extra (opcional)
              </p>
            ) : (
              <div className="space-y-2">
                {materials.map((mat, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={mat.name}
                        onChange={(e) => updateMaterial(i, "name", e.target.value)}
                        placeholder="Nombre del recurso"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={mat.url}
                        onChange={(e) => updateMaterial(i, "url", e.target.value)}
                        placeholder="URL (https://...)"
                        className="h-9 text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeMaterial(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
