import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { ListSkeleton } from "@/components/skeletons";
import { getCoverLetters } from "@/actions/cover-letter";

import CoverLetterList from "./_components/cover-letter-list";

export const metadata = { title: "Cover Letters" };

async function Letters() {
  const coverLetters = await getCoverLetters();
  return <CoverLetterList coverLetters={coverLetters} />;
}

export default function CoverLetterPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Documents"
        title="Cover Letters"
        description="One letter per posting, generated from your profile and the job description."
        actions={
          <Button asChild>
            <Link href="/ai-cover-letter/new">
              <Plus className="mr-2 h-4 w-4" />
              New letter
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<ListSkeleton />}>
        <Letters />
      </Suspense>
    </div>
  );
}
