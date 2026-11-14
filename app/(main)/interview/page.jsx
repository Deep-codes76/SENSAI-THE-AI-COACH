import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getAssessments } from "@/actions/interview";
import { getUserOnboardingStatus } from "@/actions/user";
import { PageHeader } from "@/components/page-header";
import { InterviewSkeleton } from "@/components/skeletons";

import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";

export const metadata = { title: "Interview Prep" };

async function InterviewContent() {
  const assessments = await getAssessments();

  return (
    <div className="space-y-6">
      <StatsCards assessments={assessments} />
      <PerformanceChart assessments={assessments} />
      <QuizList assessments={assessments} />
    </div>
  );
}

export default async function InterviewPrepPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  return (
    <div>
      <PageHeader
        eyebrow="Practice"
        title="Interview Preparation"
        description="Mock interviews tailored to your field, with every score and explanation kept."
      />
      <Suspense fallback={<InterviewSkeleton />}>
        <InterviewContent />
      </Suspense>
    </div>
  );
}
