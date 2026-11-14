"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BriefcaseIcon,
  Brain,
  LineChart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const demandStyles = {
  high: { bar: "bg-success", text: "text-success" },
  medium: { bar: "bg-warning", text: "text-warning" },
  low: { bar: "bg-destructive", text: "text-destructive" },
};

const outlookStyles = {
  positive: { Icon: TrendingUp, color: "text-success" },
  neutral: { Icon: LineChart, color: "text-warning" },
  negative: { Icon: TrendingDown, color: "text-destructive" },
};

export default function DashboardView({ insights }) {
  // Every field below came from a language model, so each read is defensive:
  // the original component called .toLowerCase() and .toFixed() directly and
  // threw a blank page whenever a value was missing.
  const salaryRanges = Array.isArray(insights?.salaryRanges)
    ? insights.salaryRanges
    : [];

  const salaryData = salaryRanges.map((range) => ({
    name: range.role,
    min: Math.round((range.min ?? 0) / 1000),
    median: Math.round((range.median ?? 0) / 1000),
    max: Math.round((range.max ?? 0) / 1000),
  }));

  const demand =
    demandStyles[String(insights?.demandLevel).toLowerCase()] ?? {
      bar: "bg-muted-foreground",
      text: "text-muted-foreground",
    };

  const outlook =
    outlookStyles[String(insights?.marketOutlook).toLowerCase()] ?? {
      Icon: LineChart,
      color: "text-muted-foreground",
    };

  const growthRate = Number(insights?.growthRate ?? 0);

  const lastUpdated = insights?.lastUpdated
    ? format(new Date(insights.lastUpdated), "d MMM yyyy")
    : "—";
  const nextUpdate = insights?.nextUpdate
    ? formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true })
    : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="font-mono text-xs">
          Updated {lastUpdated}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Next refresh {nextUpdate}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market outlook
            </CardTitle>
            <outlook.Icon className={`h-4 w-4 ${outlook.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {insights?.marketOutlook ?? "Unknown"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Based on this week&apos;s analysis
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Industry growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numeric text-2xl font-semibold">
              {growthRate.toFixed(1)}%
            </div>
            <Progress
              value={Math.max(0, Math.min(100, growthRate))}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Demand level
            </CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${demand.text}`}>
              {insights?.demandLevel ?? "Unknown"}
            </div>
            <div className={`mt-3 h-1.5 w-full rounded-full ${demand.bar}`} />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top skills
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {(insights?.topSkills ?? []).map((skill) => (
                <Badge key={skill} variant="secondary" className="font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary ranges by role</CardTitle>
          <CardDescription>
            Annual compensation in thousands of USD.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salaryData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No salary data available for this industry yet.
            </p>
          ) : (
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salaryData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 56 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    stroke="hsl(var(--border))"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={72}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    stroke="hsl(var(--border))"
                    tickFormatter={(v) => `$${v}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                          <p className="mb-2 text-sm font-medium">{label}</p>
                          {payload.map((item) => (
                            <p
                              key={item.name}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span
                                className="h-2 w-2 rounded-sm"
                                style={{ background: item.fill }}
                              />
                              <span className="text-muted-foreground">
                                {item.name}
                              </span>
                              <span className="numeric ml-auto">
                                {currency.format(item.value * 1000)}
                              </span>
                            </p>
                          ))}
                        </div>
                      ) : null
                    }
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="square"
                  />
                  <Bar dataKey="min" name="Minimum" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="median" name="Median" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="max" name="Maximum" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key industry trends</CardTitle>
            <CardDescription>What is shaping the market now</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {(insights?.keyTrends ?? []).map((trend, index) => (
                <li key={index} className="flex gap-3">
                  <span className="numeric mt-0.5 text-xs text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended skills</CardTitle>
            <CardDescription>Worth investing time in next</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(insights?.recommendedSkills ?? []).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-primary/30 font-normal"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
