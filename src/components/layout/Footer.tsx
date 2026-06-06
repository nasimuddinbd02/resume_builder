import Link from "next/link";
import { FileText } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
            <FileText className="w-3 h-3 text-primary" />
          </div>
          <span className="text-md font-bold gradient-text">ResumeAI</span>
        </div>
        
        <div className="text-sm text-muted-foreground text-center md:text-left">
          &copy; {currentYear} ResumeAI Inc. All rights reserved. Built for professional job seekers.
        </div>
        
        <div className="flex gap-4 text-sm font-medium text-muted-foreground">
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
