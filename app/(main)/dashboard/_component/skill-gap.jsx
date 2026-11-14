import { CheckCircle2, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { computeSkillGap } from "@/app/lib/skills";

/**
 * Compares the user's own skills against what the market is asking for.
 *
 * The insight record already listed `topSkills` and `recommendedSkills`, and
 * the user record already listed `skills`, but nothing ever put the two side
 * by side — which is the question someone actually opens this page to answer.
 */
export default function SkillGap({ insights, userSkills = [] }) {
  const { total, have, missing, coverage } = computeSkillGap({
    marketSkills: [
      ...(insights?.topSkills ?? []),
      ...(insights?.recommendedSkills ?? []),
    ],
    userSkills,
  });

  if (total === 0) return null;

  const tone =
    coverage >= 70
      ? "text-success"
      : coverage >= 40
        ? "text-warning"
        : "text-destructive";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <CardTitle>Your skill coverage</CardTitle>
            <CardDescription>
              How your profile lines up with what this market is hiring for
            </CardDescription>
          </div>
          <span className={`numeric text-3xl font-semibold ${tone}`}>
            {coverage}%
          </span>
        </div>
        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Skill coverage"
          aria-valuenow={coverage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700"
            style={{ width: `${coverage}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="section-label mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            You already have ({have.length})
          </p>
          {have.length ? (
            <div className="flex flex-wrap gap-1.5">
              {have.map((skill) => (
                <Badge key={skill} variant="secondary" className="font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              None of the listed skills are on your profile yet.
            </p>
          )}
        </div>

        <div>
          <p className="section-label mb-3 flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-primary" />
            Worth adding ({missing.length})
          </p>
          {missing.length ? (
            <div className="flex flex-wrap gap-1.5">
              {missing.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-primary/40 font-normal"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You cover everything this market is asking for.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
