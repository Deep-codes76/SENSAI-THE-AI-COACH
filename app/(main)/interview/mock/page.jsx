import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getUserOnboardingStatus } from "@/actions/user";

import Quiz from "../_components/quiz";

export const metadata = { title: "Mock Interview" };

export default async function MockInterviewPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");

  return (
    <div>
      <Button asChild variant="link" className="mb-2 gap-2 pl-0">
        <Link href="/interview">
          <ArrowLeft className="h-4 w-4" />
          Back to interview prep
        </Link>
      </Button>

      <PageHeader
        eyebrow="Mock interview"
        title="Test your knowledge"
        description="Ten industry-specific questions. Answer at your own pace."
      />

      <Quiz />
    </div>
  );
}
