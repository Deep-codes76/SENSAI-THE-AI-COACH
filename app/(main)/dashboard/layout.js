import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { DashboardSkeleton } from "@/components/skeletons";

export const metadata = { title: "Industry Insights" };

export default function Layout({ children }) {
  return (
    <div>
      <PageHeader
        eyebrow="Market"
        title="Industry Insights"
        description="Salary bands, demand and trends for your field, regenerated weekly."
      />
      <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
    </div>
  );
}
