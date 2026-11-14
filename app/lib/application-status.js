/**
 * Application pipeline stages.
 *
 * Lives outside actions/applications.js because every export from a
 * "use server" module must be an async function.
 */
export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
];

/** A status that has actually been submitted, as opposed to merely bookmarked. */
export const isSubmitted = (status) => status !== "saved";
