"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import {
  CATEGORY_KEYS,
  QUIZ_CATEGORIES,
} from "@/app/lib/interview-categories";
import useFetch from "@/hooks/use-fetch";

import QuizResult from "./quiz-result";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [category, setCategory] = useState("technical");

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
    setData: setQuizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) setAnswers(new Array(quizData.length).fill(null));
  }, [quizData]);

  const handleAnswer = (answer) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = answer;
      return next;
    });
  };

  const calculateScore = () => {
    const correct = answers.reduce(
      (count, answer, index) =>
        answer === quizData[index]?.correctAnswer ? count + 1 : count,
      0
    );
    return (correct / quizData.length) * 100;
  };

  const handleNext = async () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion((i) => i + 1);
      setShowExplanation(false);
      return;
    }

    /*
     * `useFetch` already catches and toasts, so the old try/catch here was
     * dead code that made failures look handled. Instead the result is
     * checked: when the save fails the user stays on the quiz with their
     * answers intact rather than landing on a blank screen.
     */
    const saved = await saveQuizResultFn(
      quizData,
      answers,
      calculateScore(),
      category
    );
    if (saved) toast.success("Quiz complete.");
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setResultData(null);
    setQuizData(undefined);
    generateQuizFn(category);
  };

  if (resultData) {
    return <QuizResult result={resultData} onStartNew={startNewQuiz} />;
  }

  if (generatingQuiz) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <div>
            <p className="font-medium">Writing your questions…</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ten questions tailored to your industry and skills.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quizData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-muted-foreground">
            Ten multiple-choice questions specific to your industry and skills.
            You can reveal an explanation for each one after answering, and your
            score is saved to your performance history.
          </p>

          <div className="space-y-3">
            <p className="section-label">Pick a round</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {CATEGORY_KEYS.map((key) => {
                const option = QUIZ_CATEGORIES[key];
                const selected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(key)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/60"
                    }`}
                  >
                    <span className="block font-medium">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => generateQuizFn(category)} className="w-full">
            Start {QUIZ_CATEGORIES[category].label.toLowerCase()} quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];
  const answered = Boolean(answers[currentQuestion]);
  const progress = ((currentQuestion + 1) / quizData.length) * 100;
  const isLast = currentQuestion === quizData.length - 1;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground">
            {QUIZ_CATEGORIES[category].label} · question {currentQuestion + 1} of{" "}
            {quizData.length}
          </CardTitle>
          <span className="numeric text-xs text-muted-foreground">
            {answers.filter(Boolean).length} answered
          </span>
        </div>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-primary transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-lg font-medium leading-snug">{question.question}</p>

        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion] ?? ""}
          className="space-y-2"
        >
          {question.options.map((option, index) => (
            <Label
              key={index}
              htmlFor={`q${currentQuestion}-option-${index}`}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3.5 font-normal transition-colors hover:bg-muted/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem
                value={option}
                id={`q${currentQuestion}-option-${index}`}
              />
              <span>{option}</span>
            </Label>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="animate-fade-up rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-1 text-sm font-medium">Explanation</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          {/* There was previously no way back to review an earlier answer. */}
          <Button
            variant="ghost"
            onClick={() => {
              setCurrentQuestion((i) => Math.max(0, i - 1));
              setShowExplanation(false);
            }}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          {!showExplanation && (
            <Button
              variant="outline"
              onClick={() => setShowExplanation(true)}
              disabled={!answered}
            >
              Show explanation
            </Button>
          )}
        </div>

        <Button onClick={handleNext} disabled={!answered || savingResult}>
          {savingResult ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : isLast ? (
            "Finish quiz"
          ) : (
            "Next question"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
