"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitQuiz } from "@/app/actions/enrollment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Trophy, RefreshCcw, Star, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

interface QuizResult {
  questionId: string;
  selected: number;
  correct: boolean;
  correctIndex: number;
  explanation: string | null;
}

interface PrevAttempt {
  score: number;
  totalQuestions: number;
  answers: QuizResult[];
  attemptedAt: string;
}

interface Props {
  lessonId: string;
  courseId: string;
  questions: Question[];
  isCompleted: boolean;
  prevAttempt: PrevAttempt | null;
  hasVideo?: boolean;
}

export function LessonPlayer({ lessonId, courseId, questions, isCompleted, prevAttempt, hasVideo }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"video-gate" | "idle" | "quiz" | "result">(
    isCompleted && prevAttempt ? "result" : (hasVideo && !isCompleted ? "video-gate" : "idle")
  );
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [results, setResults] = useState<QuizResult[] | null>(
    isCompleted && prevAttempt ? (prevAttempt.answers as QuizResult[]) : null
  );
  const [score, setScore] = useState<{ score: number; total: number; pts: number } | null>(
    isCompleted && prevAttempt
      ? { score: prevAttempt.score, total: prevAttempt.totalQuestions, pts: prevAttempt.score * 10 }
      : null
  );
  const [loading, setLoading] = useState(false);

  if (questions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          Aún no hay preguntas de quiz para esta lección.
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit() {
    if (answers.some((a) => a === null)) {
      toast.error("Respondé todas las preguntas antes de enviar");
      return;
    }
    setLoading(true);
    const result = await submitQuiz(lessonId, answers as number[], courseId);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      setResults(result.results as QuizResult[]);
      setScore({ score: result.score!, total: result.total!, pts: result.pointsEarned! });
      setPhase("result");
      if (result.pointsEarned! > 0) {
        toast.success(`+${result.pointsEarned} puntos obtenidos!`);
      }
      router.refresh();
    }
  }

  function retake() {
    setAnswers(new Array(questions.length).fill(null));
    setResults(null);
    setScore(null);
    setPhase("quiz");
  }

  if (phase === "video-gate") {
    return (
      <Card className="bg-muted/40 border-border">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <PlayCircle className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Mirá el video antes de tomar el quiz</h3>
            <p className="text-sm text-muted-foreground">
              Una vez que hayas visto el video, hacé clic en el botón para desbloquear el quiz.
            </p>
          </div>
          <Button onClick={() => setPhase("idle")} size="lg" variant="outline">
            <CheckCircle2 className="w-4 h-4" />
            Ya vi el video, tomar quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "idle") {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">¿Listo para el quiz?</h3>
            <p className="text-sm text-muted-foreground">
              {questions.length} preguntas · 10 puntos por respuesta correcta
            </p>
          </div>
          <Button onClick={() => setPhase("quiz")} size="lg">
            Tomar quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "quiz") {
    const answered = answers.filter((a) => a !== null).length;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Quiz</h2>
          <span className="text-sm text-muted-foreground">
            {answered}/{questions.length} respondidas
          </span>
        </div>
        <Progress value={(answered / questions.length) * 100} className="h-2" />

        {questions.map((q, qi) => (
          <Card key={q.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                <span className="text-muted-foreground mr-2">P{qi + 1}.</span>
                {q.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => {
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                    className={cn(
                      "text-left px-4 py-3 rounded-lg border text-sm transition-all",
                      answers[qi] === oi
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-muted-foreground mr-2 font-medium">
                      {["A", "B", "C", "D"][oi]}.
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={handleSubmit}
          disabled={loading || answers.some((a) => a === null)}
          size="lg"
          className="w-full"
        >
          {loading ? "Enviando..." : "Enviar quiz"}
        </Button>
      </div>
    );
  }

  const pct = score ? Math.round((score.score / score.total) * 100) : 0;
  return (
    <div className="space-y-4">
      <Card className={cn(
        "text-center",
        pct === 100 ? "border-green-400 bg-green-50 dark:bg-green-900/20" :
        pct >= 70 ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" :
        "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
      )}>
        <CardContent className="py-8 space-y-3">
          <div className="text-5xl font-bold">{pct}%</div>
          <div className="text-sm text-muted-foreground">
            {score?.score}/{score?.total} correctas
          </div>
          {score && score.pts > 0 && (
            <div className="flex items-center justify-center gap-1 text-yellow-600 font-medium">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              +{score.pts} puntos obtenidos
            </div>
          )}
          <Button variant="outline" size="sm" onClick={retake}>
            <RefreshCcw className="w-4 h-4" />
            Volver a intentar
          </Button>
        </CardContent>
      </Card>

      <h3 className="font-semibold">Revisar respuestas</h3>
      {questions.map((q, qi) => {
        const r = results?.[qi];
        const correct = r?.correct ?? false;
        return (
          <Card key={q.id} className={cn(
            "border-l-4",
            correct ? "border-l-green-500" : "border-l-red-500"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                {correct
                  ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                <CardTitle className="text-sm font-medium">{q.text}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm",
                      oi === q.correctIndex && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-medium",
                      oi === r?.selected && !correct && oi !== q.correctIndex && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    )}
                  >
                    {oi === q.correctIndex ? "✓ " : oi === r?.selected && !correct ? "✗ " : "  "}
                    {opt}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded p-2">
                  💡 {q.explanation}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
