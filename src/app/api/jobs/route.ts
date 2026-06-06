import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const location = searchParams.get("location")?.toLowerCase() || "";

  // Realistic mock job data
  let jobs = [
    {
      id: "job_1",
      title: "Senior Frontend Engineer",
      company: "Google",
      location: "Mountain View, CA (Hybrid)",
      salary: "$160k - $210k",
      type: "Full-time",
      source: "LinkedIn",
      postedAt: "2 hours ago",
      matchScore: 94,
      description: "We are looking for a highly skilled Frontend Engineer to join our Core UI team. You will be building responsive, performant, and accessible web applications using React and Next.js.",
    },
    {
      id: "job_2",
      title: "Full Stack Developer",
      company: "Stripe",
      location: "Remote",
      salary: "$150k - $190k",
      type: "Full-time",
      source: "Indeed",
      postedAt: "5 hours ago",
      matchScore: 88,
      description: "Join Stripe to help build the economic infrastructure of the internet. You'll work across the stack using Node.js, React, and PostgreSQL.",
    },
    {
      id: "job_3",
      title: "React Developer",
      company: "Netflix",
      location: "Los Gatos, CA",
      salary: "$140k - $180k",
      type: "Contract",
      source: "Wellfound",
      postedAt: "1 day ago",
      matchScore: 82,
      description: "We're looking for a React developer to help revamp our internal tooling dashboard. Strong experience with hooks and state management is required.",
    },
    {
      id: "job_4",
      title: "Software Engineer, UI",
      company: "Airbnb",
      location: "San Francisco, CA (Remote)",
      salary: "$155k - $195k",
      type: "Full-time",
      source: "LinkedIn",
      postedAt: "2 days ago",
      matchScore: 91,
      description: "Help us build the next generation of travel experiences. You'll work closely with design to implement pixel-perfect user interfaces.",
    },
    {
      id: "job_5",
      title: "Frontend Architect",
      company: "Vercel",
      location: "Remote",
      salary: "$180k - $220k",
      type: "Full-time",
      source: "Twitter/X",
      postedAt: "3 days ago",
      matchScore: 76,
      description: "Lead the frontend architecture for our core platform. Deep knowledge of Next.js, React Server Components, and Edge computing is essential.",
    },
    {
      id: "job_6",
      title: "Web Developer",
      company: "Shopify",
      location: "Toronto, ON (Hybrid)",
      salary: "$110k - $140k",
      type: "Full-time",
      source: "Indeed",
      postedAt: "1 week ago",
      matchScore: 65,
      description: "We need a versatile web developer to help build modern e-commerce experiences. Experience with HTML, CSS, JavaScript, and React.",
    },
    {
      id: "job_7",
      title: "Software Engineer Intern",
      company: "Meta",
      location: "Menlo Park, CA",
      salary: "$8k - $10k / mo",
      type: "Internship",
      source: "LinkedIn",
      postedAt: "Just now",
      matchScore: 45,
      description: "Join Meta for a 12-week summer internship. Work on impactful projects and learn from industry leaders.",
    },
    {
      id: "job_8",
      title: "Backend Engineer",
      company: "Discord",
      location: "Remote",
      salary: "$140k - $175k",
      type: "Full-time",
      source: "Wellfound",
      postedAt: "4 days ago",
      matchScore: 72,
      description: "Help us scale our real-time messaging infrastructure. Deep knowledge of Rust, Go, or Elixir is highly desired.",
    }
  ];

  if (q) {
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q)
    );
  }

  if (location) {
    jobs = jobs.filter((job) => job.location.toLowerCase().includes(location));
  }

  return NextResponse.json({ jobs, total: jobs.length });
}
