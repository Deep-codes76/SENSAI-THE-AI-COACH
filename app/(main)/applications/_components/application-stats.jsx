import { Card, CardContent } from "@/components/ui/card";
import { computeApplicationStats } from "@/app/lib/application-stats";

import { STATUS_META, STATUS_ORDER } from "./application-constants";

/**
 * Funnel figures. Response rate deliberately excludes "saved", because a role
 * you never applied to should not drag the rate down.
 */
export default function ApplicationStats({ applications }) {
  const { counts, submitted, advanced, responseRate } =
    computeApplicationStats(applications);

  const tiles = [
    { label: "Tracked", value: applications.length, hint: "Total roles" },
    { label: "Applied", value: submitted, hint: "Submitted applications" },
    { label: "Active", value: advanced, hint: "Interviewing or offered" },
    {
      label: "Response rate",
      value: responseRate === null ? "—" : `${responseRate}%`,
      hint: submitted ? `${advanced} of ${submitted} advanced` : "Apply to see this",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{tile.label}</p>
              <p className="numeric mt-2 text-2xl font-semibold">{tile.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tile.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length > 0 && (
        <div>
          {/* A single stacked bar reads the pipeline faster than five numbers. */}
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            {STATUS_ORDER.map((status) =>
              counts[status] ? (
                <div
                  key={status}
                  className={STATUS_META[status].dot}
                  style={{
                    width: `${(counts[status] / applications.length) * 100}%`,
                  }}
                  title={`${STATUS_META[status].label}: ${counts[status]}`}
                />
              ) : null
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {STATUS_ORDER.map((status) => (
              <span
                key={status}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${STATUS_META[status].dot}`}
                />
                {STATUS_META[status].label}
                <span className="numeric text-foreground">{counts[status]}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
