import { db } from "@/lib/prisma";
import { generateAIInsights } from "@/actions/dashboard";

import { inngest } from "./client";

export const generateIndustryInsights = inngest.createFunction(
  // Inngest v3 requires a stable `id`; with only `name` the function never
  // registered, so the weekly refresh silently never ran.
  { id: "generate-industry-insights", name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Sundays at midnight UTC
  async ({ step }) => {
    const industries = await step.run("fetch-industries", () =>
      db.industryInsight.findMany({ select: { industry: true } })
    );

    const results = { updated: 0, failed: 0 };

    for (const { industry } of industries) {
      try {
        // One step per industry, so a single malformed AI response is retried
        // in isolation instead of aborting the entire weekly run.
        await step.run(`refresh-${industry}`, async () => {
          const insights = await generateAIInsights(industry);

          await db.industryInsight.update({
            where: { industry },
            data: {
              ...insights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        });
        results.updated += 1;
      } catch (error) {
        console.error(`Failed to refresh insights for ${industry}:`, error);
        results.failed += 1;
      }
    }

    return results;
  }
);
