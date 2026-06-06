"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Upload,
  FileText,
  Star,
  Target,
  Trash2,
  Edit,
  Calendar,
  Loader2,
  LineChart,
  Briefcase,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import ResumeUploader from "@/components/upload/ResumeUploader";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ResumeData } from "@/types/resume";

interface ResumeRecord {
  id: string;
  title: string;
  isBase: boolean;
  template: string;
  fullName: string;
  email: string;
  updatedAt: string;
  tailoring?: {
    atsScore?: number;
    companyName?: string;
    jobTitle?: string;
  } | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [tailoredViewMode, setTailoredViewMode] = useState<"grid" | "table">("grid");

  const [baseSearchQuery, setBaseSearchQuery] = useState("");
  const [tailoredSearchQuery, setTailoredSearchQuery] = useState("");
  const [baseCurrentPage, setBaseCurrentPage] = useState(1);
  const [tailoredCurrentPage, setTailoredCurrentPage] = useState(1);

  // Reset pagination when search changes
  useEffect(() => setBaseCurrentPage(1), [baseSearchQuery]);
  useEffect(() => setTailoredCurrentPage(1), [tailoredSearchQuery]);

  const ITEMS_PER_PAGE_GRID = 6;
  const ITEMS_PER_PAGE_TABLE = 10;

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resume");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes);
      }
    } catch {
      toast.error("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchResumes();
    }
  }, [status, router, fetchResumes]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
        toast.success("Resume deleted");
      } else {
        toast.error("Failed to delete resume");
      }
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreateBlank() {
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Resume",
          fullName: session?.user?.name || "Your Name",
          email: session?.user?.email || "your@email.com",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/builder/${data.resume.id}`);
      } else {
        toast.error("Failed to create resume");
      }
    } catch {
      toast.error("Failed to create resume");
    }
  }

  async function handleParsedResume(parsedData: ResumeData) {
    setShowUploadDialog(false);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsedData,
          title: "Uploaded Resume",
          isBase: true,
          template: parsedData.template || JSON.stringify({
            name: "custom",
            accentColor: "#1f2937",
            fontFamily: "Inter",
            fontSize: "0.8rem",
            padding: "0.5in 0.6in"
          }),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Resume parsed and saved!");
        router.push(`/builder/${data.resume.id}`);
      } else {
        toast.error("Failed to save parsed resume");
      }
    } catch {
      toast.error("Failed to save parsed resume");
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const baseResumes = resumes.filter((r) => r.isBase);
  const tailoredResumes = resumes.filter((r) => !r.isBase);
  const atsScores = tailoredResumes.filter(r => r.tailoring?.atsScore != null).map(r => r.tailoring!.atsScore!);
  const avgAtsScore = atsScores.length > 0 ? Math.round(atsScores.reduce((a,b) => a+b, 0) / atsScores.length) : 0;

  // Filtering Base Resumes
  const filteredBaseResumes = baseResumes.filter(r => 
    r.title.toLowerCase().includes(baseSearchQuery.toLowerCase()) || 
    r.fullName.toLowerCase().includes(baseSearchQuery.toLowerCase())
  );
  
  // Filtering Tailored Resumes
  const filteredTailoredResumes = tailoredResumes.filter(r => 
    r.title.toLowerCase().includes(tailoredSearchQuery.toLowerCase()) || 
    (r.tailoring?.companyName || "").toLowerCase().includes(tailoredSearchQuery.toLowerCase()) ||
    (r.tailoring?.jobTitle || "").toLowerCase().includes(tailoredSearchQuery.toLowerCase())
  );

  // Pagination for Base Resumes (Always Grid)
  const baseTotalPages = Math.ceil(filteredBaseResumes.length / ITEMS_PER_PAGE_GRID);
  const paginatedBaseResumes = filteredBaseResumes.slice(
    (baseCurrentPage - 1) * ITEMS_PER_PAGE_GRID, 
    baseCurrentPage * ITEMS_PER_PAGE_GRID
  );

  // Pagination for Tailored Resumes
  const tailoredItemsPerPage = tailoredViewMode === "grid" ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_TABLE;
  const tailoredTotalPages = Math.ceil(filteredTailoredResumes.length / tailoredItemsPerPage);
  const paginatedTailoredResumes = filteredTailoredResumes.slice(
    (tailoredCurrentPage - 1) * tailoredItemsPerPage,
    tailoredCurrentPage * tailoredItemsPerPage
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48 mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back,{" "}
              <span className="gradient-text">
                {session?.user?.name || "there"}
              </span>
            </h1>
            <p className="text-muted-foreground">
              Here is what's happening with your job search today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCreateBlank} className="gap-2">
              <Plus className="w-4 h-4" />
              New Resume
            </Button>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger
                render={
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload Your Resume</DialogTitle>
                  <DialogDescription>
                    Upload a PDF or Word document. Our AI will extract all your
                    information automatically.
                  </DialogDescription>
                </DialogHeader>
                <ResumeUploader
                  onParsed={handleParsedResume}
                  onError={(err: string) => toast.error(err)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Analytics Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 stagger-children">
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resumes</p>
                <h3 className="text-2xl font-bold">{resumes.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tailored Resumes</p>
                <h3 className="text-2xl font-bold">{tailoredResumes.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <LineChart className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg ATS Score</p>
                <h3 className="text-2xl font-bold">{avgAtsScore > 0 ? `${avgAtsScore}%` : 'N/A'}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Base Resumes */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Base Resumes</h2>
            </div>
            {baseResumes.length > 0 && (
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search base resumes..."
                  className="w-full pl-9 bg-background/50"
                  value={baseSearchQuery}
                  onChange={(e) => setBaseSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {baseResumes.length === 0 ? (
            <Card className="glass-card border-dashed border-2 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground mb-4">
                  No base resumes yet. Create one to get started!
                </p>
                <Button onClick={handleCreateBlank} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Resume
                </Button>
              </CardContent>
            </Card>
          ) : filteredBaseResumes.length === 0 ? (
            <Card className="glass-card border-dashed border-2 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">
                  No base resumes found matching "{baseSearchQuery}"
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {paginatedBaseResumes.map((resume) => (
                <Card
                  key={resume.id}
                  className="glass-card border-border/50 card-hover group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {resume.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          Updated {formatDate(resume.updatedAt)}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-primary/15 text-primary shrink-0"
                      >
                        Base
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 truncate">
                      {resume.fullName} &middot; {resume.email}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link href={`/builder/${resume.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </Link>
                      <Link
                        href={`/builder/${resume.id}/tailor`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full gap-1">
                          <Target className="w-3.5 h-3.5" />
                          Tailor
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(resume.id)}
                        disabled={deletingId === resume.id}
                      >
                        {deletingId === resume.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <PaginationControls
                currentPage={baseCurrentPage}
                totalPages={baseTotalPages}
                totalItems={filteredBaseResumes.length}
                itemsPerPage={ITEMS_PER_PAGE_GRID}
                onPageChange={setBaseCurrentPage}
              />
            </>
          )}
        </section>

        {/* Tailored Resumes */}
        {tailoredResumes.length > 0 && (
          <section>
            <Separator className="mb-8" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                <div className="flex items-center gap-2 shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Tailored Resumes</h2>
                </div>
                
                <div className="relative w-full md:w-64 md:ml-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tailored resumes..."
                    className="w-full pl-9 bg-background/50"
                    value={tailoredSearchQuery}
                    onChange={(e) => setTailoredSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg shrink-0">
                <Button 
                  variant={tailoredViewMode === "grid" ? "secondary" : "ghost"} 
                  size="sm" 
                  className={`px-3 py-1.5 h-auto ${tailoredViewMode === "grid" ? "shadow-sm" : ""}`}
                  onClick={() => setTailoredViewMode("grid")}
                >
                  <LayoutGrid className="w-4 h-4 mr-1.5" />
                  Grid
                </Button>
                <Button 
                  variant={tailoredViewMode === "table" ? "secondary" : "ghost"} 
                  size="sm" 
                  className={`px-3 py-1.5 h-auto ${tailoredViewMode === "table" ? "shadow-sm" : ""}`}
                  onClick={() => setTailoredViewMode("table")}
                >
                  <List className="w-4 h-4 mr-1.5" />
                  List
                </Button>
              </div>
            </div>

            {filteredTailoredResumes.length === 0 ? (
              <Card className="glass-card border-dashed border-2 border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">
                    No tailored resumes found matching "{tailoredSearchQuery}"
                  </p>
                </CardContent>
              </Card>
            ) : tailoredViewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {paginatedTailoredResumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className="glass-card border-border/50 card-hover group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {resume.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(resume.updatedAt)}
                          </CardDescription>
                        </div>
                        {resume.tailoring?.atsScore != null && (
                          <Badge
                            className={`shrink-0 ${
                              resume.tailoring.atsScore >= 70
                                ? "bg-success/15 text-success"
                                : resume.tailoring.atsScore >= 40
                                ? "bg-warning/15 text-warning"
                                : "bg-destructive/15 text-destructive"
                            }`}
                          >
                            ATS: {resume.tailoring.atsScore}%
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 truncate">
                        {resume.tailoring?.companyName} &middot;{" "}
                        {resume.tailoring?.jobTitle}
                      </p>
                      <div className="flex items-center gap-2">
                        <Link href={`/builder/${resume.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(resume.id)}
                          disabled={deletingId === resume.id}
                        >
                          {deletingId === resume.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="glass-card border border-border/50 rounded-xl overflow-hidden fade-in-up">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-secondary-foreground border-b border-border/50">
                      <tr>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Resume Title</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Job Target</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">ATS Score</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Last Updated</th>
                        <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {paginatedTailoredResumes.map((resume) => (
                        <tr key={resume.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-foreground">{resume.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium">{resume.tailoring?.companyName}</div>
                            <div className="text-muted-foreground mt-0.5 text-xs">{resume.tailoring?.jobTitle}</div>
                          </td>
                          <td className="px-6 py-4">
                            {resume.tailoring?.atsScore != null ? (
                              <Badge
                                className={`border-none shadow-none ${
                                  resume.tailoring.atsScore >= 70
                                    ? "bg-success/15 text-success"
                                    : resume.tailoring.atsScore >= 40
                                    ? "bg-warning/15 text-warning"
                                    : "bg-destructive/15 text-destructive"
                                }`}
                              >
                                {resume.tailoring.atsScore}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                            {formatDate(resume.updatedAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/builder/${resume.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(resume.id)}
                                disabled={deletingId === resume.id}
                              >
                                {deletingId === resume.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {filteredTailoredResumes.length > 0 && (
              <PaginationControls
                currentPage={tailoredCurrentPage}
                totalPages={tailoredTotalPages}
                totalItems={filteredTailoredResumes.length}
                itemsPerPage={tailoredItemsPerPage}
                onPageChange={setTailoredCurrentPage}
              />
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
