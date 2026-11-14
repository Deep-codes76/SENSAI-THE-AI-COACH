import { APPLICATION_STATUSES } from "./application-status";

/**
 * Funnel figures for the tracker.
 *
 * `responseRate` deliberately excludes "saved": a role you bookmarked but
 * never applied to should not drag the rate down.
 */
export function computeApplicationStats(applications = []) {
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));

  for (const app of applications) {
    if (counts[app?.status] !== undefined) counts[app.status] += 1;
  }

  const submitted =
    counts.applied + counts.interviewing + counts.offer + counts.rejected;
  const advanced = counts.interviewing + counts.offer;

  return {
    counts,
    total: applications.length,
    submitted,
    advanced,
    responseRate: submitted ? Math.round((advanced / submitted) * 100) : null,
  };
}
