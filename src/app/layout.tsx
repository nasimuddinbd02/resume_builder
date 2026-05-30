import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumeAI — AI-Powered Resume Builder & Tailoring",
  description:
    "Build, tailor, and optimize your resume with AI. Upload your resume, enter a job description, and get a perfectly tailored resume and cover letter in seconds.",
  keywords: ["resume builder", "AI resume", "cover letter", "ATS optimization", "job application"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
