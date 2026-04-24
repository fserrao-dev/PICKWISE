"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createModuleWithContent } from "@/app/actions/courses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check, X, Video, FileText, HelpCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material {
  name: string;
  url: string;
}

interface QuestionDraft {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Props {
  courseId: string;
  open: boolean;
  onClose: () => void;
}

export function CreateModuleDialog({ courseId, open, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [addingQuestion, setAddingQuestion] = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setMaterials([]);
    setQuestions([]);
    setAddingQuestion(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

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

  function addQuestion(q: QuestionDraft) {
    setQuestions((prev) => [...prev, q]);
    setAddingQuestion(false);
  }

  function removeQuestion(i: number) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("El título es obligatorio"); return; }
    if (!youtubeUrl.trim()) { toast.error("El video de YouTube es obligatorio"); return; }

    setLoading(true);
    const result = await createModuleWithContent(courseId, {
      title: title.trim(),
      description: description.trim() || undefined,
      youtubeUrl: youtubeUrl.trim(),
      materials: materials.filter((m) => m.name.trim() && m.url.trim()),
      questions,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Módulo creado");
      handleClose();
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear módulo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <section className="space-y-4">
            <SectionTitle icon={<BookOpen className="w-4 h-4" />} label="Información básica" />
            <div className="space-y-3 pl-6">
              <div className="space-y-1.5">
                <Label htmlFor="mod-title">Título del módulo *</Label>
                <Input
                  id="mod-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Introducción a HTML"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mod-desc">Descripción</Label>
                <Textarea
                  id="mod-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describí de qué trata este módulo..."
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Video */}
          <section className="space-y-4">
            <SectionTitle icon={<Video className="w-4 h-4" />} label="Video de YouTube *" />
            <div className="pl-6">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... o youtu.be/..."
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pegá el link del video de YouTube para este módulo
              </p>
            </div>
          </section>

          {/* Material adjunto */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle
                icon={<FileText className="w-4 h-4" />}
                label="Material adjunto"
                badge={materials.length > 0 ? `${materials.length}` : undefined}
              />
              <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                <Plus className="w-3 h-3" />
                Agregar
              </Button>
            </div>
            {materials.length === 0 ? (
              <p className="text-xs text-muted-foreground pl-6">
                PDFs, links o recursos extra para los estudiantes (opcional)
              </p>
            ) : (
              <div className="pl-6 space-y-2">
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
          </section>

          {/* Evaluación */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle
                icon={<HelpCircle className="w-4 h-4" />}
                label="Evaluación (múltiple choice)"
                badge={
                  questions.length > 0
                    ? `${questions.length} pregunta${questions.length !== 1 ? "s" : ""}`
                    : undefined
                }
                badgeVariant={questions.length >= 3 ? "success" : questions.length > 0 ? "warning" : undefined}
              />
              {!addingQuestion && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingQuestion(true)}
                >
                  <Plus className="w-3 h-3" />
                  Agregar pregunta
                </Button>
              )}
            </div>

            {questions.length === 0 && !addingQuestion && (
              <p className="text-xs text-muted-foreground pl-6">
                Mínimo 3 preguntas para activar el quiz (podés agregarlas después)
              </p>
            )}

            {questions.length > 0 && (
              <div className="pl-6 space-y-2">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 border rounded-lg p-3 bg-muted/30"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                          P{i + 1}
                        </span>
                        <p className="text-sm font-medium leading-snug">{q.text}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pl-7">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={cn(
                              "text-xs px-2 py-1 rounded border",
                              oi === q.correctIndex
                                ? "bg-green-50 border-green-200 text-green-800"
                                : "border-transparent text-muted-foreground"
                            )}
                          >
                            {oi === q.correctIndex ? "✓ " : ""}
                            {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground pl-7">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeQuestion(i)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {addingQuestion && (
              <div className="pl-6">
                <InlineQuestionForm
                  onSave={addQuestion}
                  onCancel={() => setAddingQuestion(false)}
                />
              </div>
            )}
          </section>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({
  icon,
  label,
  badge,
  badgeVariant,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeVariant?: "success" | "warning" | "secondary";
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {label}
      {badge && (
        <Badge variant={badgeVariant ?? "secondary"} className="text-xs font-normal">
          {badge}
        </Badge>
      )}
    </div>
  );
}

function InlineQuestionForm({
  onSave,
  onCancel,
}: {
  onSave: (q: QuestionDraft) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState("");

  function handleSave() {
    if (!text.trim()) { toast.error("Ingresá el texto de la pregunta"); return; }
    if (options.some((o) => !o.trim())) { toast.error("Completá las 4 opciones"); return; }
    onSave({ text: text.trim(), options, correctIndex, explanation: explanation.trim() });
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Pregunta *</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí la pregunta..."
          rows={2}
          className="text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Opciones — hacé clic en el círculo para marcar la correcta
        </Label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectIndex(i)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  correctIndex === i
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40 hover:border-primary/60"
                )}
              >
                {correctIndex === i && <Check className="w-3 h-3" />}
              </button>
              <Input
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                placeholder={`Opción ${["A", "B", "C", "D"][i]}`}
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Explicación de la respuesta correcta (opcional)
        </Label>
        <Input
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="¿Por qué esta es la respuesta correcta?"
          className="h-8 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={handleSave}>
          <Check className="w-3.5 h-3.5" />
          Agregar pregunta
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3.5 h-3.5" />
          Cancelar
        </Button>
      </div>
    </div>
  );
}
