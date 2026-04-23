"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createQuestion, updateQuestion, deleteQuestion } from "@/app/actions/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

interface QuestionManagerProps {
  lessonId: string;
  questions: Question[];
}

function QuestionForm({
  onSave,
  onCancel,
  initial,
}: {
  onSave: (data: any) => void;
  onCancel: () => void;
  initial?: Question;
}) {
  const [options, setOptions] = useState<string[]>(initial?.options ?? ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(initial?.correctIndex ?? 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const text = (form.elements.namedItem("text") as HTMLTextAreaElement).value;
    const explanation = (form.elements.namedItem("explanation") as HTMLInputElement).value;

    if (options.some((o) => !o.trim())) {
      toast.error("All 4 options must be filled in");
      return;
    }

    onSave({ text, options, correctIndex, explanation });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <div className="space-y-2">
        <Label>Question Text</Label>
        <Textarea
          name="text"
          placeholder="Enter your question..."
          defaultValue={initial?.text}
          required
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Answer Options (select the correct one)</Label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectIndex(i)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  correctIndex === i
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground"
                }`}
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
                placeholder={`Option ${i + 1}`}
                required
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Click the circle to mark the correct answer</p>
      </div>
      <div className="space-y-2">
        <Label>Explanation (optional)</Label>
        <Input
          name="explanation"
          placeholder="Explain why the answer is correct..."
          defaultValue={initial?.explanation || ""}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          <Check className="w-4 h-4" />
          {initial ? "Update" : "Add"} Question
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function QuestionManager({ lessonId, questions }: QuestionManagerProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(data: any) {
    setLoading(true);
    const result = await createQuestion(lessonId, data);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Question added");
      setAdding(false);
      router.refresh();
    }
  }

  async function handleUpdate(id: string, data: any) {
    setLoading(true);
    const result = await updateQuestion(id, lessonId, data);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Question updated");
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this question?")) return;
    const result = await deleteQuestion(id, lessonId);
    if (result.success) {
      toast.success("Question deleted");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Quiz Questions</h2>
          <Badge variant={questions.length >= 3 ? "success" : "warning"}>
            {questions.length} / min 3
          </Badge>
        </div>
        <Button onClick={() => setAdding(true)} disabled={adding}>
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>

      {adding && (
        <QuestionForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      )}

      {questions.length === 0 && !adding ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-2">No questions yet</p>
            <p className="text-sm text-muted-foreground">Add at least 3 questions for the quiz</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={q.id}>
              {editingId === q.id ? (
                <CardContent className="pt-4">
                  <QuestionForm
                    initial={q}
                    onSave={(data) => handleUpdate(q.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                </CardContent>
              ) : (
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Q{i + 1}
                        </span>
                        <p className="font-medium text-sm">{q.text}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pl-8">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`text-xs px-2 py-1 rounded border ${
                              oi === q.correctIndex
                                ? "bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
                                : "bg-muted/50 border-transparent text-muted-foreground"
                            }`}
                          >
                            {oi === q.correctIndex && "✓ "}
                            {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground pl-8">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditingId(q.id)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(q.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
