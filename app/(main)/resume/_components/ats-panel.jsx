"use client";

import { CheckCircle2, Gauge, Lightbulb, TagIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const band = (score) => {
  if (score >= 80) return { label: "Strong", className: "text-success" };
  if (score >= 60) return { label: "Decent", className: "text-warning" };
  return { label: "Needs work", className: "text-destructive" };
};

/**
 * Surfaces the ATS score and feedback. The `atsScore` and `feedback` columns
 * existed in the Prisma schema from the beginning but nothing ever read or
 * wrote them; this is the UI for that data.
 */
export default function AtsPanel({ result, initialScore, loading }) {
  if (loading && !result) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <Gauge className="h-4 w-4 animate-pulse text-primary" />
          Scoring your resume against an applicant tracking system…
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    if (typeof initialScore !== "number") return null;
    const tone = band(initialScore);
    return (
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 py-5">
          <Gauge className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Last ATS score
          </span>
          <span className={`numeric text-lg font-semibold ${tone.className}`}>
            {initialScore}/100
          </span>
          <span className="text-sm text-muted-foreground">
            — run a new check to refresh the feedback.
          </span>
        </CardContent>
      </Card>
    );
  }

  const tone = band(result.score);

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <CardTitle className="text-lg">ATS score</CardTitle>
          <span className={`numeric text-3xl font-semibold ${tone.className}`}>
            {result.score}
            <span className="text-base text-muted-foreground">/100</span>
          </span>
          <Badge variant="outline" className={tone.className}>
            {tone.label}
          </Badge>
        </div>
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={result.score}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700"
            style={{ width: `${result.score}%` }}
          />
        </div>
        {result.summary && (
          <p className="mt-4 text-pretty text-sm text-muted-foreground">
            {result.summary}
          </p>
        )}
      </CardHeader>

      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="section-label mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            Strengths
          </p>
          <ul className="space-y-2">
            {result.strengths?.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="section-label mb-3 flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-warning" />
            Improvements
          </p>
          <ul className="space-y-2">
            {result.improvements?.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="section-label mb-3 flex items-center gap-2">
            <TagIcon className="h-3.5 w-3.5 text-primary" />
            Missing keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.missingKeywords?.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="font-normal">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
