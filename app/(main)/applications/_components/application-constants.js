export const STATUS_META = {
  saved: {
    label: "Saved",
    hint: "Interesting, not applied yet",
    dot: "bg-muted-foreground",
    ring: "border-muted-foreground/30",
    chip: "bg-muted text-muted-foreground",
  },
  applied: {
    label: "Applied",
    hint: "Submitted, waiting to hear back",
    dot: "bg-chart-4",
    ring: "border-chart-4/40",
    chip: "bg-chart-4/15 text-chart-4",
  },
  interviewing: {
    label: "Interviewing",
    hint: "In the process",
    dot: "bg-primary",
    ring: "border-primary/40",
    chip: "bg-primary/15 text-primary",
  },
  offer: {
    label: "Offer",
    hint: "They said yes",
    dot: "bg-success",
    ring: "border-success/40",
    chip: "bg-success/15 text-success",
  },
  rejected: {
    label: "Rejected",
    hint: "Closed out",
    dot: "bg-destructive",
    ring: "border-destructive/40",
    chip: "bg-destructive/15 text-destructive",
  },
};

import { APPLICATION_STATUSES } from "@/app/lib/application-status";

export const STATUS_ORDER = APPLICATION_STATUSES;

const VALID = new Set(APPLICATION_STATUSES);

/**
 * Own-key lookup with a fallback. Indexing the map directly would resolve
 * inherited keys such as "constructor" to a truthy non-status.
 */
export const statusMeta = (status) =>
  VALID.has(status) ? STATUS_META[status] : STATUS_META.saved;
