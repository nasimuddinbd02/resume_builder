"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Loader2,
  ExternalLink,
  BarChart3,
  X,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface JobApplication {
  id: string;
  title: string;
  company: string;
  link?: string | null;
  status: string;
  notes?: string | null;
  appliedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  Applied: "bg-blue-500/15 text-blue-400",
  Interview: "bg-amber-500/15 text-amber-400",
  Offer: "bg-emerald-500/15 text-emerald-400",
  Rejected: "bg-destructive/15 text-destructive",
  Withdrawn: "bg-muted text-muted-foreground",
};

function getStatusColor(status: string) {
  return STATUS_COLORS[status] || "bg-primary/15 text-primary";
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE_GRID = 6;
  const ITEMS_PER_PAGE_TABLE = 10;

  // Reset pagination when search or tab changes
  useEffect(() => setCurrentPage(1), [searchQuery, activeTab]);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formStatus, setFormStatus] = useState("Applied");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("Failed to load applications");
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
      fetchApplications();
    }
  }, [status, router, fetchApplications]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
        toast.success("Application deleted");
      } else {
        toast.error("Failed to delete application");
      }
    } catch {
      toast.error("Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreateApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formCompany.trim()) {
      toast.error("Job title and company are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          company: formCompany,
          link: formLink || null,
          status: formStatus,
          notes: formNotes || null,
        }),
      });
      if (res.ok) {
        toast.success("Application created!");
        setFormTitle("");
        setFormCompany("");
        setFormLink("");
        setFormStatus("Applied");
        setFormNotes("");
        setShowForm(false);
        fetchApplications();
      } else {
        toast.error("Failed to create application");
      }
    } catch {
      toast.error("Failed to create application");
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Stats
  const totalApps = applications.length;
  const statusCounts: Record<string, number> = {};
  applications.forEach((app) => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
          <Skeleton className="h-10 w-48 mb-6" />
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
        {/* Header — same pattern as Dashboard */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">
            Job Applications{" "}
            <span className="gradient-text">
              {session?.user?.name ? `— ${session.user.name}` : ""}
            </span>
          </h1>
          <p className="text-muted-foreground">
            {totalApps} application{totalApps !== 1 ? "s" : ""} tracked
          </p>
        </div>

        {/* Quick actions — same pattern as Dashboard */}
        <div className="flex flex-wrap gap-3 mb-10">
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Application
            </Button>
          )}
        </div>

        {/* Inline New Application Form */}
        {showForm && (
          <Card className="glass-card border-border/50 mb-10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add New Application
              </CardTitle>
              <CardDescription>
                Track a new job application you&apos;ve submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateApplication} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app-title">Job Title</Label>
                  <Input
                    id="app-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Software Engineer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-company">Company</Label>
                  <Input
                    id="app-company"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Google"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-link">Job Link (optional)</Label>
                  <Input
                    id="app-link"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-status">Status</Label>
                  <select
                    id="app-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm border border-border"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="app-notes">Notes (optional)</Label>
                  <Input
                    id="app-notes"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Any notes about this application..."
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Application
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        {totalApps > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Overview</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-children">
              <Card className="glass-card border-border/50">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold gradient-text">{totalApps}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total</p>
                </CardContent>
              </Card>
              {Object.entries(statusCounts).map(([statusName, count]) => (
                <Card key={statusName} className="glass-card border-border/50">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold">{count}</p>
                    <Badge className={`mt-2 ${getStatusColor(statusName)}`}>
                      {statusName}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Separator className="mb-8" />

        {/* Applications Tabs & View Toggle */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Your Applications</h2>
              </div>
              
              <div className="relative w-full md:w-64 md:ml-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search applications..."
                  className="w-full pl-9 bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg shrink-0">
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"} 
                size="sm" 
                className={`px-3 py-1.5 h-auto ${viewMode === "grid" ? "shadow-sm" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4 mr-1.5" />
                Grid
              </Button>
              <Button 
                variant={viewMode === "table" ? "secondary" : "ghost"} 
                size="sm" 
                className={`px-3 py-1.5 h-auto ${viewMode === "table" ? "shadow-sm" : ""}`}
                onClick={() => setViewMode("table")}
              >
                <List className="w-4 h-4 mr-1.5" />
                List
              </Button>
            </div>
          </div>

          <Tabs defaultValue="All" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto rounded-none border-b border-border/50 bg-transparent h-auto p-0 space-x-6 custom-scrollbar pb-1">
              {["All", "Applied", "Interview", "Offer", "Rejected", "Withdrawn"].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-1 py-3 text-sm font-medium transition-all"
                >
                  {tab}
                  <Badge variant="secondary" className="ml-2 bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {tab === "All" ? applications.length : applications.filter(a => a.status === tab).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {["All", "Applied", "Interview", "Offer", "Rejected", "Withdrawn"].map(tab => {
              const baseApps = tab === "All" ? applications : applications.filter(a => a.status === tab);
              const filteredApps = baseApps.filter(a => 
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                a.company.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              const itemsPerPage = viewMode === "grid" ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_TABLE;
              const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
              const paginatedApps = filteredApps.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              );
              
              return (
                <TabsContent key={tab} value={tab} className="m-0 focus-visible:outline-none focus-visible:ring-0 fade-in-up">
                  {filteredApps.length === 0 ? (
                    <Card className="glass-card border-dashed border-2 border-border/50">
                      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground mb-4">
                          {searchQuery 
                            ? `No ${tab.toLowerCase()} applications found matching "${searchQuery}"`
                            : `No ${tab.toLowerCase()} applications yet.`}
                        </p>
                        {tab === "All" && !searchQuery && (
                          <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Your First Application
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                        {paginatedApps.map((app) => (
                          <Card
                            key={app.id}
                            className="glass-card border-border/50 card-hover group"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base truncate" title={app.title}>
                                    {app.title}
                                  </CardTitle>
                                  <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(app.appliedAt)}
                                  </CardDescription>
                                </div>
                                <Badge className={`px-2 py-0.5 ${getStatusColor(app.status)} border-none shadow-none text-xs shrink-0`}>
                                  {app.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <p className="text-sm font-medium truncate">
                                  {app.company}
                                </p>
                              </div>
                              
                              {app.notes && (
                                <p className="text-xs text-muted-foreground/70 mb-4 line-clamp-2 bg-muted/30 p-2 rounded-md">
                                  {app.notes}
                                </p>
                              )}
                              {!app.notes && <div className="mb-4" />}
                              
                              <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-auto">
                                {app.link && (
                                  <a
                                    href={app.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full gap-1 h-8 text-xs"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Post
                                    </Button>
                                  </a>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0 ml-auto"
                                  onClick={() => handleDelete(app.id)}
                                  disabled={deletingId === app.id}
                                >
                                  {deletingId === app.id ? (
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
                      <div className="glass-card border border-border/50 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/50 text-secondary-foreground border-b border-border/50">
                              <tr>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Job Title & Company</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Applied Date</th>
                                <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {paginatedApps.map((app) => (
                                <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-foreground">{app.title}</div>
                                    <div className="text-muted-foreground mt-0.5 text-xs">{app.company}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={`${getStatusColor(app.status)} border-none shadow-none`}>
                                      {app.status}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                    {formatDate(app.appliedAt)}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {app.link && (
                                        <a href={app.link} target="_blank" rel="noopener noreferrer">
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                            <ExternalLink className="w-4 h-4" />
                                          </Button>
                                        </a>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(app.id)}
                                        disabled={deletingId === app.id}
                                      >
                                        {deletingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  )}
                  
                  {filteredApps.length > 0 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredApps.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
}
