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
  Copy,
  Check,
  FileText,
  Palette,
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
  const [accentColor, setAccentColor] = useState("#1f2937");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState("0.8rem");
  const [pagePadding, setPagePadding] = useState("0.5in 0.6in");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("resume");

  const cleanCoverLetter = (text: string): string => {
    if (!text) return "";
    const signOffRegex = /(?:\r?\n)+(?:Sincerely|Warm(?:est)?\s+regards|Best\s+regards|Regards|Yours\s+truly|Yours\s+sincerely|Respectfully|Kind\s+regards|With\s+best\s+regards|Best\s+wishes|Warmly|Best\s*,|Best\s*[\r\n]),?[\s\S]*$/i;
    return text.replace(signOffRegex, "").trim();
  };

  const signatureText = resumeData ? `\n\nBest regards,\n\n${resumeData.fullName || "Nasim Uddin"}\nPhone: ${resumeData.phone || "+1 (408) 489-8765"}\nEmail: ${resumeData.email || "nasim.uddinbd02@gmail.com"}\nLinkedIn: ${resumeData.linkedin || "https://www.linkedin.com/in/nasim-uddin/"}` : "";
  const cleanedCoverLetterText = resumeData?.tailoring?.coverLetterText 
    ? cleanCoverLetter(resumeData.tailoring.coverLetterText)
    : "";
  const fullCoverLetterText = cleanedCoverLetterText 
    ? `${cleanedCoverLetterText}${signatureText}`
    : "";

  const handleCopyCoverLetter = () => {
    if (fullCoverLetterText) {
      navigator.clipboard.writeText(fullCoverLetterText);
      setIsCopied(true);
      toast.success("Cover letter copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

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
      if (r.template && r.template.startsWith('{')) {
        try {
          const parsed = JSON.parse(r.template);
          setAccentColor(parsed.accentColor || "#1f2937");
          setFontFamily(parsed.fontFamily || "Inter");
          setFontSize(parsed.fontSize || "0.8rem");
          setPagePadding(parsed.padding || "0.5in 0.6in");
        } catch (e) {
          console.error("Failed to parse custom template styles:", e);
        }
      }
      setResumeData({
        id: r.id,
        title: r.title,
        isBase: r.isBase,
        template: r.template,
        fullName: r.fullName || "Nasim Uddin",
        email: r.email || "nasim.uddinbd02@gmail.com",
        phone: r.phone || "+1 (408) 489-8765",
        location: r.location,
        website: r.website,
        linkedin: r.linkedin || "https://www.linkedin.com/in/nasim-uddin/",
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
        tailoring: r.tailoring,
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

  async function handleTemplateChange(newTemplate: string) {
    setTemplate(newTemplate);
    if (!resumeData) return;

    try {
      setResumeData((prev) => (prev ? { ...prev, template: newTemplate } : null));

      const res = await fetch(`/api/resume/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...resumeData,
          title,
          template: newTemplate,
        }),
      });

      if (res.ok) {
        toast.success(`Style template updated to ${newTemplate.charAt(0).toUpperCase() + newTemplate.slice(1)}!`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to auto-save template change");
      }
    } catch (err) {
      console.error("Template save error:", err);
      toast.error("Failed to auto-save template choice");
    }
  }

  async function handleStyleChange(key: string, value: string) {
    const newStyles = {
      name: "custom",
      accentColor: key === "accentColor" ? value : accentColor,
      fontFamily: key === "fontFamily" ? value : fontFamily,
      fontSize: key === "fontSize" ? value : fontSize,
      padding: key === "padding" ? value : pagePadding,
    };

    if (key === "accentColor") setAccentColor(value);
    if (key === "fontFamily") setFontFamily(value);
    if (key === "fontSize") setFontSize(value);
    if (key === "padding") setPagePadding(value);

    const serialized = JSON.stringify(newStyles);
    setTemplate(serialized);
    
    if (!resumeData) return;
    try {
      setResumeData(prev => prev ? { ...prev, template: serialized } : null);
      
      const res = await fetch(`/api/resume/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...resumeData,
          title,
          template: serialized,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to auto-save style change");
      }
    } catch (err) {
      console.error("Style save error:", err);
      toast.error("Failed to auto-save style choice");
    }
  }

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

  async function handleExportCoverLetterPDF() {
    const { exportToPDF } = await import("@/lib/pdf-export");
    try {
      await exportToPDF("cover-letter-preview", `${title || "cover-letter"}.pdf`);
      toast.success("Cover Letter PDF downloaded!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export PDF");
    }
  }

  async function handleExportCoverLetterDOCX() {
    const { exportToDOCX } = await import("@/lib/pdf-export");
    try {
      exportToDOCX("cover-letter-preview", `${title || "cover-letter"}.doc`);
      toast.success("Cover Letter Word document downloaded!");
    } catch (err) {
      console.error("Word export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export Word document");
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
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm border border-border"
            >
              <option value="modern">Modern Template</option>
              <option value="executive">Executive Template</option>
              <option value="minimal">Minimal Template</option>
              <option value="custom">Custom Template</option>
            </select>
            
            <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={activeTab === "resume" ? handleExportPDF : handleExportCoverLetterPDF}
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
                      onClick={activeTab === "resume" ? handleExportDOCX : handleExportCoverLetterDOCX}
                    />
                  }
                >
                    <Download className="w-3.5 h-3.5" />
                    Word
                </TooltipTrigger>
                <TooltipContent>Download as Word Document</TooltipContent>
              </Tooltip>

              {activeTab === "cover-letter" && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-primary border-primary/20 hover:bg-primary/10"
                        onClick={handleCopyCoverLetter}
                      />
                    }
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? "Copied!" : "Copy"}
                  </TooltipTrigger>
                  <TooltipContent>Copy Cover Letter text</TooltipContent>
                </Tooltip>
              )}

              {activeTab === "resume" && (
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
              )}

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
                <TabsTrigger 
                  value="styling" 
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    if (!template.startsWith('{')) {
                      handleTemplateChange(JSON.stringify({
                        name: "custom",
                        accentColor,
                        fontFamily,
                        fontSize,
                        padding: pagePadding
                      }));
                    }
                  }}
                >
                  <Palette className="w-3.5 h-3.5" />
                  Styling
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

                <TabsContent value="styling" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Custom Styling</h3>
                      <p className="text-xs text-muted-foreground">
                        Customize the visual appearance of the "Custom Template" to match your uploaded resume.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Font Family Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Font Family</label>
                        <select
                          value={fontFamily}
                          onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
                          className="w-full bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm border border-border"
                        >
                          <option value="Inter">Sans-serif (Inter)</option>
                          <option value="Georgia, serif">Serif (Georgia)</option>
                          <option value="Arial, sans-serif">Standard (Arial)</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Monospace (Courier)</option>
                        </select>
                      </div>

                      {/* Font Size Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Base Font Size</label>
                        <select
                          value={fontSize}
                          onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                          className="w-full bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm border border-border"
                        >
                          <option value="0.75rem">Small (10pt)</option>
                          <option value="0.8rem">Medium (11pt)</option>
                          <option value="0.85rem">Large (12pt)</option>
                          <option value="0.9rem">Extra Large (13pt)</option>
                        </select>
                      </div>

                      {/* Page Padding Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Page Margins</label>
                        <select
                          value={pagePadding}
                          onChange={(e) => handleStyleChange("padding", e.target.value)}
                          className="w-full bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm border border-border"
                        >
                          <option value="0.3in 0.4in">Narrow (0.3in / 0.4in)</option>
                          <option value="0.5in 0.6in">Default (0.5in / 0.6in)</option>
                          <option value="0.7in 0.8in">Wide (0.7in / 0.8in)</option>
                        </select>
                      </div>

                      {/* Accent Color Picker */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => handleStyleChange("accentColor", e.target.value)}
                            className="w-10 h-10 border border-border rounded cursor-pointer p-0 bg-transparent"
                          />
                          <Input
                            value={accentColor}
                            onChange={(e) => handleStyleChange("accentColor", e.target.value)}
                            className="font-mono text-xs max-w-[100px] h-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Preview panel */}
          <div className="glass-card rounded-xl border border-border/50 overflow-hidden flex flex-col">
            {!resumeData.isBase && resumeData.tailoring?.coverLetterText ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <div className="px-4 border-b border-border/50 flex items-center justify-between bg-secondary/20">
                  <TabsList className="bg-transparent h-12 p-0 space-x-4">
                    <TabsTrigger 
                      value="resume" 
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Resume Preview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="cover-letter" 
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Cover Letter
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="resume" className="m-0 p-4 max-h-[calc(100vh-220px)] overflow-y-auto flex justify-center flex-1">
                  <div className="preview-wrapper">
                    <ResumePreview
                      data={resumeData}
                      template={template}
                      id="resume-preview"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="cover-letter" className="m-0 p-4 max-h-[calc(100vh-220px)] overflow-y-auto flex justify-center flex-1">
                  <div className="preview-wrapper">
                    <div
                      className="relative overflow-hidden rounded-xl border border-border bg-muted/30 shadow-lg"
                      style={{ width: '100%' }}
                    >
                      <div
                        style={{
                          transform: 'scale(0.6)',
                          transformOrigin: 'top center',
                          marginBottom: '-40%',
                        }}
                      >
                        <div
                          id="cover-letter-preview"
                          className="resume-preview"
                          style={{
                            width: '8.5in',
                            minHeight: '11in',
                            padding: '1in',
                            boxSizing: 'border-box',
                            fontFamily: "'Inter', sans-serif",
                            backgroundColor: '#ffffff',
                            color: '#1a1a1a',
                          }}
                        >
                          <div className="text-[11pt] leading-relaxed whitespace-pre-wrap">
                            {fullCoverLetterText}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </main>
      </div>
    </TooltipProvider>
  );
}
