import { redirect } from "next/navigation";

import { industries } from "@/data/industries";
import { getUserOnboardingStatus } from "@/actions/user";

import OnboardingForm from "./_components/onboarding-form";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (isOnboarded) redirect("/dashboard");

  return <OnboardingForm industries={industries} />;
}
