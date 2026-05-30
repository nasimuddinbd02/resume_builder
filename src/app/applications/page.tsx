"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
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
  Briefcase,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Loader2,
  ExternalLink,
  BarChart3,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-10">
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
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
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

        {/* Applications Grid — same pattern as Dashboard resume cards */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Your Applications</h2>
          </div>

          {applications.length === 0 ? (
            <Card className="glass-card border-dashed border-2 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground mb-4">
                  No applications yet. Start tracking your job search!
                </p>
                <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Application
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {applications.map((app) => (
                <Card
                  key={app.id}
                  className="glass-card border-border/50 card-hover group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {app.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          Applied {formatDate(app.appliedAt)}
                        </CardDescription>
                      </div>
                      <Badge
                        className={`shrink-0 ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-1 truncate">
                      {app.company}
                    </p>
                    {app.notes && (
                      <p className="text-xs text-muted-foreground/70 mb-4 line-clamp-2">
                        {app.notes}
                      </p>
                    )}
                    {!app.notes && <div className="mb-4" />}
                    <div className="flex items-center gap-2">
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
                            className="w-full gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Post
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
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
          )}
        </section>
      </main>
    </div>
  );
}
