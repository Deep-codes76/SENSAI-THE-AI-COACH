import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { getApplications } from "@/actions/applications";
import { getUserOnboardingStatus } from "@/actions/user";
import { PageHeader } from "@/components/page-header";
import { ListSkeleton } from "@/components/skeletons";

import ApplicationBoard from "./_components/application-board";
import ApplicationStats from "./_components/application-stats";

export const metadata = { title: "Applications" };

async function Applications() {
  const { applications, migrationPending } = await getApplications();

  return (
    <div className="space-y-8">
      {migrationPending && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4 text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">The tracker table has not been created yet.</p>
            <p className="mt-1 opacity-90">
              Run <code className="font-mono">npx prisma migrate deploy</code>{" "}
              against this environment&apos;s database to enable it.
            </p>
          </div>
        </div>
      )}
      <ApplicationStats applications={applications} />
      <ApplicationBoard applications={applications} />
    </div>
  );
}

export default async function ApplicationsPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Applications"
        description="Every role you are chasing, what stage it is at, and what you said you would do next."
      />
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <Applications />
      </Suspense>
    </div>
  );
}
