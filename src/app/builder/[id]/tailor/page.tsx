"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  FileText,
  Mail,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import JobDescriptionForm from "@/components/tailoring/JobDescriptionForm";
import AtsScoreGauge from "@/components/tailoring/AtsScoreGauge";
import KeywordBadges from "@/components/tailoring/KeywordBadges";
import { getTailorResumePrompt, getCoverLetterPrompt, getRoleTailorPrompt } from '@/lib/prompts';
import CoverLetterView from "@/components/tailoring/CoverLetterView";
import ResumePreview from "@/components/resume/ResumePreview";
import { ResumeData, ExperienceData, ProjectData } from "@/types/resume";

export default function TailorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { status } = useSession();
  const router = useRouter();

  const [baseResume, setBaseResume] = useState<ResumeData | null>(null);
  const [tailoredResume, setTailoredResume] = useState<ResumeData | null>(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [keywordsMatched, setKeywordsMatched] = useState<string[]>([]);
  const [keywordsMissing, setKeywordsMissing] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTailoring, setIsTailoring] = useState(false);

  const fetchResume = useCallback(async () => {
    try {
      const res = await fetch(`/api/resume/${id}`);
      if (!res.ok) {
        toast.error("Resume not found");
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      const r = data.resume;

      setBaseResume({
        id: r.id,
        title: r.title,
        isBase: r.isBase,
        template: r.template,
        fullName: r.fullName,
        email: r.email,
        phone: r.phone,
        location: r.location,
        website: r.website,
        linkedin: r.linkedin,
        github: r.github,
        summary: r.summary,
        experiences: r.experiences.map(
          (exp: ExperienceData & { achievements: string | string[] }) => ({
            ...exp,
            achievements:
              typeof exp.achievements === "string"
                ? JSON.parse(exp.achievements)
                : exp.achievements,
          })
        ),
        education: r.education,
        skills: r.skills,
        projects: r.projects.map(
          (proj: ProjectData & { technologies: string | string[] }) => ({
            ...proj,
            technologies:
              typeof proj.technologies === "string"
                ? JSON.parse(proj.technologies)
                : proj.technologies,
          })
        ),
      });
    } catch {
      toast.error("Failed to load resume");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchResume();
    }
  }, [status, router, fetchResume]);

  async function handleTailor(data: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  }) {
    setIsTailoring(true);
    setJobTitle(data.jobTitle);
    setCompanyName(data.companyName);
    const prompt = getRoleTailorPrompt(baseResume!, data.jobDescription, data.jobTitle, data.companyName, role);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const savedProvider = localStorage.getItem('ai_provider');
      const savedApiKey = localStorage.getItem('ai_api_key');
      if (savedProvider) headers['x-ai-provider'] = savedProvider;
      if (savedApiKey) headers['x-ai-api-key'] = savedApiKey;

      const res = await fetch("/api/tailor", {
        method: "POST",
        headers,
        body: JSON.stringify({
          resumeId: id,
          ...data,
          prompt,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Tailoring failed");
      }

      const result = await res.json();
      const r = result.resume;

      setTailoredResume({
        id: r.id,
        title: r.title,
        isBase: false,
        template: r.template,
        fullName: r.fullName,
        email: r.email,
        phone: r.phone,
        location: r.location,
        website: r.website,
        linkedin: r.linkedin,
        github: r.github,
        summary: r.summary,
        experiences: r.experiences.map(
          (exp: ExperienceData & { achievements: string | string[] }) => ({
            ...exp,
            achievements:
              typeof exp.achievements === "string"
                ? JSON.parse(exp.achievements)
                : exp.achievements,
          })
        ),
        education: r.education,
        skills: r.skills,
        projects: r.projects.map(
          (proj: ProjectData & { technologies: string | string[] }) => ({
            ...proj,
            technologies:
              typeof proj.technologies === "string"
                ? JSON.parse(proj.technologies)
                : proj.technologies,
          })
        ),
      });

      setAtsScore(result.atsScore);
      setKeywordsMatched(result.keywordsMatched || []);
      setKeywordsMissing(result.keywordsMissing || []);
      setCoverLetterText(result.coverLetterText || "");

      toast.success("Resume tailored successfully!");
      toast("Application auto-tracked", {
        description: `${data.jobTitle} at ${data.companyName} added to your Applications.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tailoring failed";
      toast.error(message);
    } finally {
      setIsTailoring(false);
    }
  }

  async function handleExportPDF() {
    const { exportToPDF } = await import("@/lib/pdf-export");
    try {
      await exportToPDF(
        "resume-preview",
        `${baseResume?.fullName || "resume"}-tailored.pdf`
      );
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export PDF");
    }
  }

  async function handleExportDOCX() {
    const { exportToDOCX } = await import("@/lib/pdf-export");
    try {
      exportToDOCX(
        "resume-preview",
        `${baseResume?.fullName || "resume"}-tailored.doc`
      );
      toast.success("Word document downloaded!");
    } catch (err) {
      console.error("Word export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export Word document");
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-[1800px] mx-auto px-6 py-6">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[600px] rounded-xl" />
            <Skeleton className="h-[600px] rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/builder/${id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">
            Tailor Resume{" "}
            {baseResume?.title && (
              <span className="text-muted-foreground font-normal">
                — {baseResume.title}
              </span>
            )}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Job input & ATS results */}
          <div className="space-y-6">
            <JobDescriptionForm
              onSubmit={handleTailor}
              isLoading={isTailoring}
            />

            {/* ATS Results */}
            {atsScore !== null && (
              <div className="glass-card rounded-xl border border-border/50 p-6 fade-in-up space-y-6">
                <AtsScoreGauge score={atsScore} />
                <KeywordBadges
                  matched={keywordsMatched}
                  missing={keywordsMissing}
                />
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
            {tailoredResume ? (
              <Tabs defaultValue="resume">
                <div className="px-4 pt-3 border-b border-border/50 flex items-center justify-between">
                  <TabsList className="bg-transparent">
                    <TabsTrigger value="resume" className="gap-1.5 text-xs">
                      <FileText className="w-3.5 h-3.5" />
                      Tailored Resume
                    </TabsTrigger>
                    <TabsTrigger value="cover" className="gap-1.5 text-xs">
                      <Mail className="w-3.5 h-3.5" />
                      Cover Letter
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleExportPDF}
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleExportDOCX}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Word
                    </Button>
                  </div>
                </div>

                <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                  <TabsContent value="resume" className="mt-0">
                    <div className="flex justify-center">
                      <div className="transform scale-[0.55] origin-top">
                        <ResumePreview
                          data={tailoredResume}
                          template={baseResume?.template || "modern"}
                          id="resume-preview"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cover" className="mt-0">
                    <CoverLetterView
                      text={coverLetterText}
                      jobTitle={jobTitle}
                      companyName={companyName}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center px-8">
                {isTailoring ? (
                  <div className="space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <div>
                      <p className="font-medium mb-1">
                        AI is tailoring your resume...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Analyzing job description, optimizing keywords, and
                        generating your cover letter. This may take up to 30
                        seconds.
                      </p>
                    </div>
                    <div className="w-64 h-2 rounded-full bg-secondary overflow-hidden mx-auto">
                      <div className="h-full bg-primary shimmer rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <Target className="w-12 h-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground mb-1">
                      <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm border border-border mr-2">
                        <option value="">Select Role (optional)</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Designer">Designer</option>
                        <option value="Data Scientist">Data Scientist</option>
                      </select>
                      No tailored resume yet
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      Enter a job description on the left and click &quot;Tailor My
                      Resume&quot; to get started.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
