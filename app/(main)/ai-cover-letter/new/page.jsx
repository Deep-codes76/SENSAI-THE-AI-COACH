import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

import CoverLetterGenerator from "../_components/cover-letter-generator";

export const metadata = { title: "New Cover Letter" };

export default function NewCoverLetterPage() {
  return (
    <div>
      <Button asChild variant="link" className="mb-2 gap-2 pl-0">
        <Link href="/ai-cover-letter">
          <ArrowLeft className="h-4 w-4" />
          Back to cover letters
        </Link>
      </Button>

      <PageHeader
        eyebrow="New"
        title="Create a cover letter"
        description="Paste the posting. Sensai writes a draft from your profile that you can edit and export."
      />

      <CoverLetterGenerator />
    </div>
  );
}
