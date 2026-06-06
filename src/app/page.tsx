"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  Sparkles,
  Download,
  Target,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Star,
  Check,
  CreditCard,
  ChevronDown,
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
  const { status } = useSession();
  const router = useRouter();
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  const handleUpgrade = async () => {
    if (status !== "authenticated") {
      router.push("/register?plan=pro");
      return;
    }
    
    setIsLoadingCheckout(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) throw new Error("Network response was not ok");
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border/50">
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
              Powered by Advanced AI
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

        {/* Testimonials */}
        <section className="border-t border-border/50 bg-card/10">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Loved by <span className="gradient-text">Professionals</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                See how ResumeAI is helping people land their dream jobs faster.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Sarah Jenkins",
                  role: "Product Manager at TechCorp",
                  content: "The AI tailoring feature is magic. It rewrote my bullet points perfectly for a PM role I really wanted, and I got the interview the next day.",
                  rating: 5,
                },
                {
                  name: "David Chen",
                  role: "Software Engineer",
                  content: "I always struggled with my cover letters. ResumeAI generated one that actually sounded like me but way more professional. Best tool ever.",
                  rating: 5,
                },
                {
                  name: "Emily Rodriguez",
                  role: "Marketing Director",
                  content: "The templates are clean and modern, and the ATS score check gave me so much confidence before hitting submit. Highly recommend!",
                  rating: 5,
                }
              ].map((testimonial, i) => (
                <div key={i} className="glass-card rounded-xl p-8 card-hover flex flex-col h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground/90 italic flex-1 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, <span className="gradient-text">Transparent Pricing</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Invest in your career with plans designed for every stage of your job search.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
              {/* Free Plan */}
              <div className="glass-card rounded-2xl p-8 flex flex-col border border-border/50">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Basic</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/forever</span>
                  </div>
                  <p className="text-muted-foreground text-sm">Perfect for building a strong foundation.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    "1 Resume & Cover Letter",
                    "Standard Template",
                    "Basic PDF Export",
                    "Limited AI Generations"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-auto">
                  <Button variant="outline" className="w-full h-11">Get Started Free</Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="glass-card rounded-2xl p-8 flex flex-col border-2 border-primary relative transform md:-translate-y-4 shadow-[0_0_40px_-10px_rgba(124,58,237,0.3)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">$9</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground text-sm">Everything you need to land your dream job.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    "Unlimited Resumes & Cover Letters",
                    "All Premium Templates",
                    "Unlimited AI Tailoring",
                    "Advanced ATS Analysis",
                    "Export to PDF & DOCX"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full h-11 gap-2 pulse-glow mt-auto" 
                  onClick={handleUpgrade}
                  disabled={isLoadingCheckout}
                >
                  <CreditCard className="w-4 h-4" />
                  {isLoadingCheckout ? "Loading..." : "Upgrade to Pro"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/50 bg-card/30">
          <div className="max-w-3xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "How does the AI tailoring work?",
                  a: "Our system uses advanced AI models to analyze your existing resume against a specific job description. It strategically rewrites your bullet points to emphasize relevant skills and improve ATS keyword matching without inventing false information."
                },
                {
                  q: "Is my data secure?",
                  a: "Yes. Your personal information and resumes are encrypted and stored securely. We never sell your data to third parties or use it to train public AI models."
                },
                {
                  q: "Can I cancel my Pro subscription anytime?",
                  a: "Absolutely. You can cancel your subscription from your account settings at any time with a single click. You'll retain access to Pro features until the end of your billing cycle."
                }
              ].map((faq, i) => (
                <div key={i} className="glass-card rounded-lg p-6">
                  <h4 className="font-semibold text-lg flex justify-between items-center mb-2">
                    {faq.q}
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
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
            &copy; {new Date().getFullYear()} ResumeAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
