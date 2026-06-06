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
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Search,
  MapPin,
  Building,
  DollarSign,
  Clock,
  Target,
  ExternalLink,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";

interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  source: string;
  applyUrl: string;
  postedAt: string;
  matchScore: number;
  description: string;
}

export default function JobsPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE_GRID = 6;
  const ITEMS_PER_PAGE_TABLE = 10;

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setDebouncedLocation(locationQuery);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, locationQuery]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append("q", debouncedQuery);
      if (debouncedLocation) params.append("location", debouncedLocation);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, debouncedLocation]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchJobs();
    }
  }, [status, router, fetchJobs]);

  const itemsPerPage = viewMode === "grid" ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_TABLE;
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Search Section */}
      <div className="bg-secondary/30 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 fade-in-up">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 gradient-text tracking-tight">
              Find your next role.
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Discover opportunities from top job portals and instantly generate a tailored resume specifically for them.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 glass-card p-2 rounded-xl border border-border/50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  className="w-full pl-10 h-12 bg-transparent border-none focus-visible:ring-0 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hidden sm:block w-px bg-border/50 my-2"></div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="City, state, or remote"
                  className="w-full pl-10 h-12 bg-transparent border-none focus-visible:ring-0 text-base"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center fade-in-up">
            <Search className="w-16 h-16 text-muted-foreground/30 mb-6" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any positions matching your search criteria. Try adjusting your keywords or location.
            </p>
          </div>
        ) : (
          <div className="fade-in-up">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">
                {jobs.length} open positions
              </h2>
              
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
            
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
                {paginatedJobs.map((job) => (
                  <Card key={job.id} className="glass-card border-border/50 card-hover flex flex-col group">
                    <CardHeader className="pb-4 border-b border-border/50 bg-secondary/10">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-xl font-bold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                            {job.title}
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full no-underline">
                              via {job.source}
                            </span>
                          </a>
                          <div className="flex items-center gap-2 text-muted-foreground mt-2">
                            <Building className="w-4 h-4" />
                            <span className="font-medium">{job.company}</span>
                            <span>&middot;</span>
                            <span className="text-sm">{job.location}</span>
                          </div>
                        </div>
                      {job.matchScore && (
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                            job.matchScore >= 85 ? 'border-success text-success' : 
                            job.matchScore >= 70 ? 'border-warning text-warning' : 
                            'border-muted text-muted-foreground'
                          }`}>
                            <span className="font-bold">{job.matchScore}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Match</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                        {job.salary}
                      </Badge>
                      <Badge variant="outline" className="text-muted-foreground">
                        {job.type}
                      </Badge>
                      <Badge variant="outline" className="text-muted-foreground ml-auto border-none">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {job.postedAt}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/50 flex gap-3">
                    <Link href="/dashboard" className="flex-1">
                      <Button className="w-full gap-2 shadow-sm">
                        <Target className="w-4 h-4" />
                        Tailor Resume
                      </Button>
                    </Link>
                    <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="gap-2 shrink-0">
                        Apply
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
            ) : (
              <div className="glass-card border border-border/50 rounded-xl overflow-hidden fade-in-up">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-secondary-foreground border-b border-border/50">
                      <tr>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Job Title & Source</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Company & Location</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Details</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Match</th>
                        <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {paginatedJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline hover:text-primary flex items-center gap-1">
                              {job.title}
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </a>
                            <div className="text-muted-foreground mt-1 text-xs">
                              via <span className="font-medium text-foreground">{job.source}</span> &middot; {job.postedAt}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{job.company}</div>
                            <div className="text-muted-foreground mt-0.5 text-xs">{job.location}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs px-1.5 py-0.5">
                                {job.salary}
                              </Badge>
                              <Badge variant="outline" className="text-muted-foreground text-xs px-1.5 py-0.5">
                                {job.type}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {job.matchScore ? (
                              <Badge
                                className={`border-none shadow-none text-xs px-1.5 py-0.5 ${
                                  job.matchScore >= 85 ? 'bg-success/15 text-success' : 
                                  job.matchScore >= 70 ? 'bg-warning/15 text-warning' : 
                                  'bg-muted text-muted-foreground'
                                }`}
                              >
                                {job.matchScore}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="h-8 text-xs">
                                  <Target className="w-3.5 h-3.5 mr-1" />
                                  Tailor
                                </Button>
                              </Link>
                              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="h-8 px-2">
                                  Apply
                                </Button>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={jobs.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
