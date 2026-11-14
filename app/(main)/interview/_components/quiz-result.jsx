"use client";

import { CheckCircle2, Lightbulb, Trophy, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function QuizResult({ result, hideStartNew = false, onStartNew }) {
  if (!result) return null;

  const score = Number(result.quizScore ?? 0);
  const questions = result.questions ?? [];
  const correct = questions.filter((q) => q.isCorrect).length;

  const tone =
    score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive";

  return (
    // CardContent / CardFooter were previously used without a Card wrapper,
    // so none of the card padding or borders applied.
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-xl">Quiz results</h2>
        </div>

        <div className="flex items-baseline gap-3">
          <span className={`numeric text-5xl font-semibold ${tone}`}>
            {score.toFixed(0)}%
          </span>
          {questions.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {correct} of {questions.length} correct
            </span>
          )}
        </div>

        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(score)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {result.improvementTip && (
          <div className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">What to work on</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {result.improvementTip}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="section-label">Question review</p>
          {questions.map((q, index) => (
            <div key={index} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium leading-snug">{q.question}</p>
                {q.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                )}
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Your answer:{" "}
                  <span className={q.isCorrect ? "text-success" : "text-destructive"}>
                    {q.userAnswer ?? "Not answered"}
                  </span>
                </p>
                {!q.isCorrect && (
                  <p className="text-muted-foreground">
                    Correct answer:{" "}
                    <span className="text-success">{q.answer}</span>
                  </p>
                )}
              </div>

              {q.explanation && (
                <div className="mt-3 rounded-md bg-muted/60 p-3 text-sm">
                  <p className="font-medium">Explanation</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {!hideStartNew && (
        <CardFooter>
          <Button onClick={onStartNew} className="w-full">
            Start a new quiz
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
