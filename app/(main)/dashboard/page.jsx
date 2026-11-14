import { redirect } from "next/navigation";

import { getIndustryInsights } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { requireUser } from "@/lib/auth";

import DashboardView from "./_component/dashboard-view";
import SkillGap from "./_component/skill-gap";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  const [insights, user] = await Promise.all([
    getIndustryInsights(),
    requireUser({ skills: true }),
  ]);

  return (
    <div className="space-y-6">
      <DashboardView insights={insights} />
      <SkillGap insights={insights} userSkills={user.skills ?? []} />
    </div>
  );
}
