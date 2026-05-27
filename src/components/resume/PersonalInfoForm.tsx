'use client';

import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';

function Linkedin({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Github({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PersonalInfoFormProps {
  data: {
    fullName: string;
    email: string;
    phone?: string | null;
    location?: string | null;
    website?: string | null;
    linkedin?: string | null;
    github?: string | null;
    summary?: string | null;
  };
  onChange: (field: string, value: string) => void;
}

const fields = [
  { key: 'fullName', label: 'Full Name', icon: User, placeholder: 'John Doe', type: 'text', required: true },
  { key: 'email', label: 'Email', icon: Mail, placeholder: 'john@example.com', type: 'email', required: true },
  { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+1 (555) 000-0000', type: 'tel', required: false },
  { key: 'location', label: 'Location', icon: MapPin, placeholder: 'San Francisco, CA', type: 'text', required: false },
  { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://johndoe.com', type: 'url', required: false },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/johndoe', type: 'url', required: false },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/johndoe', type: 'url', required: false },
] as const;

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const Icon = field.icon;
          const value = data[field.key as keyof typeof data] ?? '';

          return (
            <div key={field.key} className="glow-focus space-y-2">
              <Label htmlFor={field.key} className="text-muted-foreground">
                <Icon className="size-3.5" />
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id={field.key}
                type={field.type}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      {/* Summary - full width */}
      <div className="glow-focus space-y-2">
        <Label htmlFor="summary" className="text-muted-foreground">
          <User className="size-3.5" />
          Professional Summary
        </Label>
        <Textarea
          id="summary"
          placeholder="Write a brief professional summary highlighting your key skills and experience..."
          value={data.summary ?? ''}
          onChange={(e) => onChange('summary', e.target.value)}
          className="min-h-[120px]"
        />
        <p className="text-xs text-muted-foreground">
          A compelling summary helps recruiters quickly understand your value proposition.
        </p>
      </div>
    </div>
  );
}
