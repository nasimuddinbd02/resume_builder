"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Sparkles,
  Download,
  Target,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Resume Parsing",
    description:
      "Upload your existing PDF or Word resume and let our AI automatically extract and structure all your information.",
  },
  {
    icon: Target,
    title: "AI-Powered Tailoring",
    description:
      "Paste a job description and our AI rewrites your resume to maximize ATS compatibility and keyword matching.",
  },
  {
    icon: Sparkles,
    title: "Cover Letter Generation",
    description:
      "Get a professionally crafted cover letter that perfectly complements your tailored resume.",
  },
  {
    icon: Download,
    title: "Instant PDF Export",
    description:
      "Download your polished resume and cover letter as beautiful, print-ready PDF documents.",
  },
];

const benefits = [
  "AI-powered ATS score analysis",
  "3 professional resume templates",
  "Keyword matching & gap analysis",
  "Unlimited resume versions",
  "Secure & private — your data stays yours",
  "Works with any industry or role",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xl font-bold gradient-text">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-chart-2/10 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8 fade-in-up">
              <Zap className="w-3.5 h-3.5" />
              Powered by Google Gemini AI
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 fade-in-up">
              Build the{" "}
              <span className="gradient-text">Perfect Resume</span>
              <br />
              for Every Job
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 fade-in-up">
              Upload your resume, paste a job description, and let AI craft a
              tailored resume and cover letter that gets you noticed. Maximize
              your ATS score in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in-up">
              <Link href="/register">
                <Button size="lg" className="text-base px-8 gap-2 pulse-glow">
                  <Sparkles className="w-4 h-4" />
                  Start Building for Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base px-8">
                  I Have an Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Land the Job</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From parsing your existing resume to generating tailored cover
              letters, we handle the hard work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-8 card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Why Choose{" "}
                  <span className="gradient-text">ResumeAI</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Our AI doesn&apos;t just reformat — it strategically rewrites your
                  experience to match what recruiters and ATS systems look for.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium">How It Works</span>
                </div>
                {[
                  {
                    step: "1",
                    title: "Upload or Build",
                    desc: "Upload your existing resume or use our interactive builder.",
                  },
                  {
                    step: "2",
                    title: "Enter Job Details",
                    desc: "Paste the job description you want to apply for.",
                  },
                  {
                    step: "3",
                    title: "AI Tailors & Generates",
                    desc: "Our AI rewrites your resume and creates a matching cover letter.",
                  },
                  {
                    step: "4",
                    title: "Download & Apply",
                    desc: "Export as PDF and submit your perfectly tailored application.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium mb-0.5">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Your{" "}
            <span className="gradient-text">Dream Job</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Join thousands of professionals who use ResumeAI to land interviews
            faster.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base px-10 gap-2">
              <Sparkles className="w-4 h-4" />
              Create Your Resume Now
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-semibold gradient-text">ResumeAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ResumeAI. Built with Next.js &amp;
            Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
