"use client";

import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Download, Edit, Save, Copy, Check, Loader2, Monitor } from "lucide-react";
import { toast } from "sonner";
import { updateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";

const CoverLetterPreview = ({ id, content: initialContent }) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    loading: isSaving,
    fn: saveCoverLetterFn,
    data: saveResult,
    error: saveError,
  } = useFetch(updateCoverLetter);

  // Sync content if initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Cover letter saved successfully!");
      setIsEditing(false);
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save cover letter");
    }
  }, [saveResult, saveError, isSaving]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  const handleSave = async () => {
    if (!content || !content.trim()) {
      toast.error("Cover letter content cannot be empty");
      return;
    }
    await saveCoverLetterFn(id, content);
  };

  const generatePDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById("cover-letter-pdf");
      const opt = {
        margin: [20, 20],
        filename: `cover-letter-${id.substring(0, 8)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      {/* Control Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-2 p-2 border rounded-lg bg-muted/40">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
          >
            {isEditing ? (
              <>
                <Monitor className="h-4 w-4 mr-2" />
                Show Preview
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Markdown
              </>
            )}
          </Button>

          {isEditing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={generatePDF} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor & Preview */}
      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
        <MDEditor
          value={content}
          onChange={setContent}
          height={700}
          preview={isEditing ? "edit" : "preview"}
        />
      </div>

      {/* Hidden container for PDF rendering */}
      <div className="hidden">
        <div id="cover-letter-pdf" className="p-8">
          <MDEditor.Markdown
            source={content}
            style={{
              background: "white",
              color: "black",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
