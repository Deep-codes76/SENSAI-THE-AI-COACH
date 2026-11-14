"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import QuizResult from "./quiz-result";

export default function QuizList({ assessments = [] }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Newest first, so the most recent quiz carries the highest number.
  const total = assessments.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Recent quizzes</CardTitle>
              <CardDescription>Review any past attempt</CardDescription>
            </div>
            <Button onClick={() => router.push("/interview/mock")}>
              Start new quiz
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {total === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <GraduationCap
                className="h-8 w-8 text-muted-foreground"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-medium">No quizzes yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your scores and improvement tips will collect here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((assessment, i) => (
                <button
                  key={assessment.id}
                  type="button"
                  onClick={() => setSelectedQuiz(assessment)}
                  className="w-full rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium">
                      Quiz {total - i}
                      {assessment.category && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                          {assessment.category}
                        </span>
                      )}
                    </span>
                    <span className="numeric text-xs text-muted-foreground">
                      {format(new Date(assessment.createdAt), "d MMM yyyy, HH:mm")}
                    </span>
                  </div>
                  <p className="numeric mt-1 text-sm text-muted-foreground">
                    Score: {assessment.quizScore.toFixed(1)}%
                  </p>
                  {assessment.improvementTip && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {assessment.improvementTip}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            {/* Was an empty DialogTitle, which Radix warns about and screen
                readers announce as an unlabelled dialog. */}
            <DialogTitle>
              {selectedQuiz
                ? `Quiz from ${format(
                    new Date(selectedQuiz.createdAt),
                    "d MMM yyyy"
                  )}`
                : "Quiz result"}
            </DialogTitle>
          </DialogHeader>
          <QuizResult result={selectedQuiz} hideStartNew />
        </DialogContent>
      </Dialog>
    </>
  );
}
