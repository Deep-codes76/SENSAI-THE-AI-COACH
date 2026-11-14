"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Gauge,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { PrintSurface } from "@/components/print-surface";
import { EditorSkeleton } from "@/components/skeletons";
import { analyzeResume, saveResume } from "@/actions/resume";
import { entriesToMarkdown, parseMarkdownToForm } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import { exportElementToPdf } from "@/lib/pdf";
import useFetch from "@/hooks/use-fetch";

import { EntryForm } from "./entry-form";
import AtsPanel from "./ats-panel";

// The markdown editor is ~500 kB and is never needed for first paint.
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((m) => m.default.Markdown),
  { ssr: false }
);

export default function ResumeBuilder({ initialContent, userName, initialAtsScore }) {
  const [activeTab, setActiveTab] = useState(initialContent ? "markdown" : "form");
  const [markdown, setMarkdown] = useState(initialContent ?? "");
  const [editorMode, setEditorMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  // True once the user has hand-edited the markdown, so regenerating from the
  // form can warn before discarding their edits.
  const markdownDirty = useRef(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: { email: "", mobile: "", linkedin: "", twitter: "" },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const { loading: isSaving, fn: saveResumeFn } = useFetch(saveResume);
  const { loading: isAnalyzing, fn: analyzeResumeFn } = useFetch(analyzeResume);

  useEffect(() => {
    if (!initialContent) return;
    const parsed = parseMarkdownToForm(initialContent);
    if (parsed) reset(parsed);
  }, [initialContent, reset]);

  const formValues = watch();

  const buildMarkdown = useCallback(() => {
    const { contactInfo, summary, skills, experience, education, projects } =
      formValues;

    const contactParts = [];
    if (contactInfo?.email) contactParts.push(`📧 ${contactInfo.email}`);
    if (contactInfo?.mobile) contactParts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo?.linkedin)
      contactParts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo?.twitter)
      contactParts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    const header = contactParts.length
      ? `## <div align="center">${userName || "Your Name"}</div>\n\n<div align="center">\n\n${contactParts.join(
          " | "
        )}\n\n</div>`
      : "";

    return [
      header,
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [formValues, userName]);

  const generatedMarkdown = useMemo(() => buildMarkdown(), [buildMarkdown]);

  const syncFromForm = () => {
    if (markdownDirty.current && markdown.trim() && markdown !== generatedMarkdown) {
      const ok = window.confirm(
        "Regenerating from the form will replace your hand-edited markdown. Continue?"
      );
      if (!ok) return;
    }
    setMarkdown(generatedMarkdown);
    markdownDirty.current = false;
    setActiveTab("markdown");
    toast.success("Markdown regenerated from the form.");
  };

  /*
   * Save used to be wrapped in `handleSubmit`, so whenever the form was
   * incomplete validation failed silently and the button simply did nothing.
   * Saving the markdown does not need the form to be valid, so it no longer
   * goes through the resolver; the form tab reports its own errors.
   */
  const handleSave = async () => {
    const content = (markdown || generatedMarkdown).trim();

    if (!content) {
      toast.error("Add some content before saving.");
      return;
    }

    const saved = await saveResumeFn(content);
    if (saved) toast.success("Resume saved.");
  };

  const handleAnalyze = async () => {
    const content = (markdown || generatedMarkdown).trim();

    if (content.length < 50) {
      toast.error("Add more content before running an ATS check.");
      return;
    }

    const result = await analyzeResumeFn(content);
    if (result) {
      setAtsResult(result);
      toast.success(`ATS score: ${result.score}/100`);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      await exportElementToPdf(document.getElementById("resume-pdf"), {
        filename: "resume.pdf",
      });
      toast.success("PDF downloaded.");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(error.message || "Failed to generate the PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const previewSource = markdown || generatedMarkdown;

  const onInvalid = () =>
    toast.error("Some fields still need attention — check the form tab.");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Resume Builder"
        description="Fill in the form or write markdown directly. Both stay in sync, and either can be exported."
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scoring…
                </>
              ) : (
                <>
                  <Gauge className="mr-2 h-4 w-4" />
                  ATS check
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button onClick={generatePDF} disabled={isGenerating}>
              {isGenerating ? (
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
          </>
        }
      />

      <AtsPanel
        result={atsResult}
        initialScore={initialAtsScore}
        loading={isAnalyzing}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>

          {activeTab === "form" ? (
            <Button variant="link" size="sm" onClick={syncFromForm}>
              Generate markdown →
            </Button>
          ) : (
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                setEditorMode(editorMode === "preview" ? "edit" : "preview")
              }
            >
              {editorMode === "preview" ? (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit markdown
                </>
              ) : (
                <>
                  <Monitor className="mr-2 h-4 w-4" />
                  Show preview
                </>
              )}
            </Button>
          )}
        </div>

        <TabsContent value="form" className="mt-6">
          <form
            onSubmit={handleSubmit(syncFromForm, onInvalid)}
            className="space-y-10"
          >
            <section className="space-y-4">
              <h2 className="text-lg font-medium">Contact information</h2>
              <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("contactInfo.email")}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-destructive">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+91 98765 43210"
                    {...register("contactInfo.mobile")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/you"
                    {...register("contactInfo.linkedin")}
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-destructive">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    type="url"
                    placeholder="https://x.com/you"
                    {...register("contactInfo.twitter")}
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-destructive">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium">Professional summary</h2>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-28"
                    placeholder="Two or three sentences on what you build and the impact you have had."
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-destructive">
                  {errors.summary.message}
                </p>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium">Skills</h2>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-24"
                    placeholder="TypeScript, React, PostgreSQL, AWS…"
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-destructive">
                  {errors.skills.message}
                </p>
              )}
            </section>

            {[
              { name: "experience", label: "Work Experience", type: "Experience" },
              { name: "education", label: "Education", type: "Education" },
              { name: "projects", label: "Projects", type: "Project" },
            ].map((section) => (
              <section key={section.name} className="space-y-3">
                <h2 className="text-lg font-medium">{section.label}</h2>
                <Controller
                  name={section.name}
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type={section.type}
                      entries={field.value ?? []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </section>
            ))}
          </form>
        </TabsContent>

        <TabsContent value="markdown" className="mt-6">
          {editorMode === "edit" && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3 text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-sm">
                Edits here are replaced if you regenerate from the form.
              </span>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-border" data-color-mode="light">
            <MDEditor
              value={previewSource}
              onChange={(value) => {
                markdownDirty.current = true;
                setMarkdown(value ?? "");
              }}
              height={760}
              preview={editorMode}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/*
        Rendered off-screen rather than inside a `.hidden` wrapper, and kept
        outside the Tabs so it exists no matter which tab is active — the old
        version produced a blank PDF, or none at all from the form tab.
      */}
      <PrintSurface id="resume-pdf">
        <MDPreview
          source={previewSource}
          style={{ background: "#ffffff", color: "#111111" }}
        />
      </PrintSurface>
    </div>
  );
}
