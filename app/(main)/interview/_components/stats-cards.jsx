import { Brain, Target, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCards({ assessments = [] }) {
  const count = assessments.length;

  const averageScore = count
    ? (
        assessments.reduce((sum, a) => sum + (a.quizScore ?? 0), 0) / count
      ).toFixed(1)
    : "0.0";

  // `getAssessments` now returns newest-first, so index 0 really is the most
  // recent quiz. It used to be ordered ascending, which meant this card
  // showed the user's oldest score and labelled it "Latest".
  const latest = count ? assessments[0] : null;

  const totalQuestions = assessments.reduce(
    (sum, a) => sum + (a.questions?.length ?? 0),
    0
  );

  const stats = [
    {
      label: "Average score",
      value: `${averageScore}%`,
      hint: count ? `Across ${count} assessment${count === 1 ? "" : "s"}` : "No quizzes yet",
      Icon: Trophy,
    },
    {
      label: "Questions practised",
      value: totalQuestions,
      hint: "Total answered",
      Icon: Brain,
    },
    {
      label: "Latest score",
      value: latest ? `${latest.quizScore.toFixed(1)}%` : "—",
      hint: "Most recent quiz",
      Icon: Target,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numeric text-2xl font-semibold">{stat.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
