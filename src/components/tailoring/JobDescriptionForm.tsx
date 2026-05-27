'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, Briefcase, FileText, Loader2 } from 'lucide-react';

interface JobDescriptionFormProps {
  onSubmit: (data: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  }) => void;
  isLoading?: boolean;
}

export default function JobDescriptionForm({
  onSubmit,
  isLoading = false,
}: JobDescriptionFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim() || !jobDescription.trim()) return;
    onSubmit({ jobTitle, companyName, jobDescription });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="gradient-text text-lg">
          Target Job Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Company Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="companyName"
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Building2 className="h-3.5 w-3.5" />
              Company Name
            </Label>
            <div className="glow-focus rounded-md">
              <Input
                id="companyName"
                placeholder="e.g. Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Job Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="jobTitle"
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Job Title
            </Label>
            <div className="glow-focus rounded-md">
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="jobDescription"
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <FileText className="h-3.5 w-3.5" />
              Job Description
            </Label>
            <div className="glow-focus rounded-md">
              <Textarea
                id="jobDescription"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
                required
                className="min-h-[200px] resize-y"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || !companyName.trim() || !jobTitle.trim() || !jobDescription.trim()}
            className="w-full text-base font-semibold"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tailoring…
              </>
            ) : (
              '🚀 Tailor My Resume'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
