import { describe, expect, it } from "vitest";

import { computeApplicationStats } from "@/app/lib/application-stats";

const make = (...statuses) => statuses.map((status, i) => ({ id: String(i), status }));

describe("computeApplicationStats", () => {
  it("counts each stage", () => {
    const { counts, total } = computeApplicationStats(
      make("saved", "saved", "applied", "interviewing", "offer", "rejected")
    );

    expect(total).toBe(6);
    expect(counts).toEqual({
      saved: 2,
      applied: 1,
      interviewing: 1,
      offer: 1,
      rejected: 1,
    });
  });

  it("excludes saved roles from the response rate", () => {
    // Four saved roles must not dilute a perfect rate on the one real send.
    const stats = computeApplicationStats(
      make("saved", "saved", "saved", "saved", "interviewing")
    );

    expect(stats.submitted).toBe(1);
    expect(stats.advanced).toBe(1);
    expect(stats.responseRate).toBe(100);
  });

  it("counts interviewing and offer as advanced, rejected as not", () => {
    const stats = computeApplicationStats(
      make("applied", "applied", "interviewing", "offer", "rejected")
    );

    expect(stats.submitted).toBe(5);
    expect(stats.advanced).toBe(2);
    expect(stats.responseRate).toBe(40);
  });

  it("returns null rather than 0% when nothing was submitted", () => {
    expect(computeApplicationStats(make("saved")).responseRate).toBeNull();
    expect(computeApplicationStats([]).responseRate).toBeNull();
    expect(computeApplicationStats().responseRate).toBeNull();
  });

  it("ignores unknown statuses instead of throwing", () => {
    const stats = computeApplicationStats([
      { id: "1", status: "ghosted" },
      { id: "2", status: "applied" },
    ]);

    expect(stats.total).toBe(2);
    expect(stats.submitted).toBe(1);
  });
});
