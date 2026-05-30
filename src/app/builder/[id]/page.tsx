"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Sun, Moon } from 'lucide-react';
import { Link as LinkedInIcon } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Save,
  ArrowLeft,
  Target,
  Download,
  Loader2,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";

import { PersonalInfoForm } from "@/components/resume/PersonalInfoForm";
import { ExperienceForm } from "@/components/resume/ExperienceForm";
import { EducationForm } from "@/components/resume/EducationForm";
import { SkillsForm } from "@/components/resume/SkillsForm";
import { ProjectsForm } from "@/components/resume/ProjectsForm";
import ResumePreview from "@/components/resume/ResumePreview";

import {
  ResumeData,
  ExperienceData,
  EducationData,
  SkillData,
  ProjectData,
} from "@/types/resume";

export default function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();


  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("modern");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

      setTitle(r.title);
      setTemplate(r.template || "modern");
      setResumeData({
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

  async function handleSave() {
    if (!resumeData) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...resumeData,
          title,
          template,
        }),
      });

      if (res.ok) {
        toast.success("Resume saved successfully!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to save resume");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An unexpected error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExportPDF() {
    const { exportToPDF } = await import("@/lib/pdf-export");
    try {
      await exportToPDF("resume-preview", `${title || "resume"}.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export PDF");
    }
  }

  async function handleExportDOCX() {
    const { exportToDOCX } = await import("@/lib/pdf-export");
    try {
      exportToDOCX("resume-preview", `${title || "resume"}.doc`);
      toast.success("Word document downloaded!");
    } catch (err) {
      console.error("Word export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export Word document");
    }
  }
  
  async function handleExportLinkedIn() {
    const { exportToLinkedInDOCX } = await import("@/lib/linkedin-export");
    try {
      await exportToLinkedInDOCX("resume-preview", `${title || "resume"}.docx`);
      toast.success("LinkedIn DOCX downloaded!");
    } catch (err) {
      console.error("LinkedIn export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export LinkedIn DOCX");
    }
  }

  function updateField(field: string, value: string) {
    setResumeData((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
  }

  if (status === "loading" || isLoading || !resumeData) {
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
    <TooltipProvider>
      <div className="min-h-screen">
        <Navbar />
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="glow-focus rounded-md">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold bg-transparent border-transparent hover:border-border focus:border-border w-64"
                placeholder="Resume title..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm border border-border"
            >
              <option value="modern">Modern Template</option>
              <option value="executive">Executive Template</option>
              <option value="minimal">Minimal Template</option>
            </select>
            
            <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleExportPDF}
                    />
                  }
                >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                </TooltipTrigger>
                <TooltipContent>Download as Print-ready PDF</TooltipContent>
              </Tooltip>

            <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleExportDOCX}
                    />
                  }
                >
                    <Download className="w-3.5 h-3.5" />
                    Word
                </TooltipTrigger>
                <TooltipContent>Download as Word Document</TooltipContent>
              </Tooltip>

<Tooltip>
   <TooltipTrigger
     render={
       <Button
         variant="outline"
         size="sm"
         className="gap-1"
         onClick={handleExportLinkedIn}
       />
     }
   >
       <LinkedInIcon className="w-3.5 h-3.5" />
       LinkedIn
   </TooltipTrigger>
   <TooltipContent>Export for LinkedIn upload</TooltipContent>
 </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Link href={`/builder/${id}/tailor`} className="inline-flex" />
                }
              >
                  <Target className="w-3.5 h-3.5" />
                  Tailor
              </TooltipTrigger>
              <TooltipContent>Tailor resume with AI for a specific job</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={handleSave}
                      disabled={isSaving}
                    />
                  }
                >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save
                </TooltipTrigger>
              <TooltipContent>Save all changes to the cloud</TooltipContent>
            </Tooltip>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>
        </div>
        </div>

        {/* Split pane */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor panel */}
          <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
            <Tabs defaultValue="personal" className="h-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent px-4 pt-2">
                <TabsTrigger value="personal" className="gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="experience" className="gap-1.5 text-xs">
                  <Briefcase className="w-3.5 h-3.5" />
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education" className="gap-1.5 text-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="skills" className="gap-1.5 text-xs">
                  <Wrench className="w-3.5 h-3.5" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-1.5 text-xs">
                  <FolderKanban className="w-3.5 h-3.5" />
                  Projects
                </TabsTrigger>
              </TabsList>

              <div className="p-6 max-h-[calc(100vh-220px)] overflow-y-auto">
                <TabsContent value="personal" className="mt-0">
                  <PersonalInfoForm
                    data={{
                      fullName: resumeData.fullName,
                      email: resumeData.email,
                      phone: resumeData.phone,
                      location: resumeData.location,
                      website: resumeData.website,
                      linkedin: resumeData.linkedin,
                      github: resumeData.github,
                      summary: resumeData.summary,
                    }}
                    onChange={updateField}
                  />
                </TabsContent>

                <TabsContent value="experience" className="mt-0">
                  <ExperienceForm
                    experiences={resumeData.experiences}
                    onChange={(experiences: ExperienceData[]) =>
                      setResumeData((prev) =>
                        prev ? { ...prev, experiences } : prev
                      )
                    }
                  />
                </TabsContent>

                <TabsContent value="education" className="mt-0">
                  <EducationForm
                    education={resumeData.education}
                    onChange={(education: EducationData[]) =>
                      setResumeData((prev) =>
                        prev ? { ...prev, education } : prev
                      )
                    }
                  />
                </TabsContent>

                <TabsContent value="skills" className="mt-0">
                  <SkillsForm
                    skills={resumeData.skills}
                    onChange={(skills: SkillData[]) =>
                      setResumeData((prev) =>
                        prev ? { ...prev, skills } : prev
                      )
                    }
                  />
                </TabsContent>

                <TabsContent value="projects" className="mt-0">
                  <ProjectsForm
                    projects={resumeData.projects}
                    onChange={(projects: ProjectData[]) =>
                      setResumeData((prev) =>
                        prev ? { ...prev, projects } : prev
                      )
                    }
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Preview panel */}
          <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Live Preview
              </span>
            </div>
            <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto flex justify-center">
              <div className="preview-wrapper">
                <ResumePreview
                  data={resumeData}
                  template={template}
                  id="resume-preview"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </TooltipProvider>
  );
}
