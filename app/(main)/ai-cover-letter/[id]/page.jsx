import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getCoverLetter } from "@/actions/cover-letter";

import CoverLetterPreview from "../_components/cover-letter-preview";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const letter = await getCoverLetter(id);
  return {
    title: letter ? `${letter.jobTitle} at ${letter.companyName}` : "Cover Letter",
  };
}

export default async function CoverLetterDetailPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  // Previously rendered "undefined at undefined" for a missing or
  // someone-else's letter instead of a 404.
  if (!coverLetter) notFound();

  return (
    <div>
      <Button asChild variant="link" className="mb-2 gap-2 pl-0">
        <Link href="/ai-cover-letter">
          <ArrowLeft className="h-4 w-4" />
          Back to cover letters
        </Link>
      </Button>

      <PageHeader
        eyebrow="Cover letter"
        title={`${coverLetter.jobTitle} at ${coverLetter.companyName}`}
      />

      <CoverLetterPreview
        id={id}
        content={coverLetter.content}
        jobTitle={coverLetter.jobTitle}
        companyName={coverLetter.companyName}
      />
    </div>
  );
}
