"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PerformanceChart({ assessments = [] }) {
  /*
   * Derived with useMemo rather than copied into state by an effect: the
   * original version rendered an empty chart on first paint and only filled in
   * after a second render.
   *
   * Assessments arrive newest-first, so they are reversed here — otherwise the
   * "trend" line ran backwards through time.
   */
  const chartData = useMemo(
    () =>
      [...assessments].reverse().map((assessment) => ({
        date: format(new Date(assessment.createdAt), "d MMM"),
        score: assessment.quizScore,
      })),
    [assessments]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Performance trend</CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Take your first mock interview and your scores will appear here.
          </p>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--border))" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                        <p className="numeric text-sm font-medium">
                          {payload[0].value}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payload[0].payload.date}
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
