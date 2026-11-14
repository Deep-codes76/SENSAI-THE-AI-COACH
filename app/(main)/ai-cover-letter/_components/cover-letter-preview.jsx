"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Check, Copy, Download, Edit, Loader2, Monitor, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PrintSurface } from "@/components/print-surface";
import { EditorSkeleton } from "@/components/skeletons";
import { updateCoverLetter } from "@/actions/cover-letter";
import { exportElementToPdf, toSafeFilename } from "@/lib/pdf";
import useFetch from "@/hooks/use-fetch";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((m) => m.default.Markdown),
  { ssr: false }
);

export default function CoverLetterPreview({
  id,
  content: initialContent,
  jobTitle,
  companyName,
}) {
  const [content, setContent] = useState(initialContent ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { loading: isSaving, fn: saveCoverLetterFn } =
    useFetch(updateCoverLetter);

  useEffect(() => {
    setContent(initialContent ?? "");
  }, [initialContent]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    // Without this the timer fires after unmount and warns in the console.
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Your browser blocked clipboard access.");
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("The cover letter cannot be empty.");
      return;
    }

    const result = await saveCoverLetterFn(id, content);
    if (result?.success) {
      toast.success("Cover letter saved.");
      setIsEditing(false);
    }
  };

  const generatePDF = async () => {
    setIsDownloading(true);
    try {
      await exportElementToPdf(document.getElementById("cover-letter-pdf"), {
        filename: `${toSafeFilename(
          `${jobTitle}-${companyName}`,
          "cover-letter"
        )}.pdf`,
        margin: [20, 20],
      });
      toast.success("PDF downloaded.");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(error.message || "Failed to generate the PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
          >
            {isEditing ? (
              <>
                <Monitor className="mr-2 h-4 w-4" />
                Preview
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>

          {isEditing && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={generatePDF}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-lg border border-border"
        data-color-mode="light"
      >
        <MDEditor
          value={content}
          onChange={(value) => setContent(value ?? "")}
          height={700}
          preview={isEditing ? "edit" : "preview"}
        />
      </div>

      <PrintSurface id="cover-letter-pdf">
        <MDPreview
          source={content}
          style={{
            background: "#ffffff",
            color: "#111111",
            fontSize: "14px",
            lineHeight: 1.65,
          }}
        />
      </PrintSurface>
    </div>
  );
}
