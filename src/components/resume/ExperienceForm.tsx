'use client';

import { ExperienceData } from '@/types/resume';
import { Plus, Trash2, X, Briefcase, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';

interface ExperienceFormProps {
  experiences: ExperienceData[];
  onChange: (experiences: ExperienceData[]) => void;
}

function createEmptyExperience(sortOrder: number): ExperienceData {
  return {
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    achievements: [''],
    sortOrder,
  };
}

export function ExperienceForm({ experiences, onChange }: ExperienceFormProps) {
  const updateExperience = (index: number, field: keyof ExperienceData, value: unknown) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };

    // If toggling isCurrent on, clear endDate
    if (field === 'isCurrent' && value === true) {
      updated[index].endDate = null;
    }

    onChange(updated);
  };

  const addExperience = () => {
    onChange([...experiences, createEmptyExperience(experiences.length)]);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    const updated = [...experiences];
    const achievements = [...updated[expIndex].achievements];
    achievements[achIndex] = value;
    updated[expIndex] = { ...updated[expIndex], achievements };
    onChange(updated);
  };

  const addAchievement = (expIndex: number) => {
    const updated = [...experiences];
    updated[expIndex] = {
      ...updated[expIndex],
      achievements: [...updated[expIndex].achievements, ''],
    };
    onChange(updated);
  };

  const removeAchievement = (expIndex: number, achIndex: number) => {
    const updated = [...experiences];
    updated[expIndex] = {
      ...updated[expIndex],
      achievements: updated[expIndex].achievements.filter((_, i) => i !== achIndex),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {experiences.map((exp, index) => (
        <Card key={index} className="fade-in-up relative">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground/50" />
              <Briefcase className="size-4 text-primary" />
              <CardTitle>
                {exp.jobTitle || exp.company
                  ? `${exp.jobTitle}${exp.company ? ` at ${exp.company}` : ''}`
                  : `Experience ${index + 1}`}
              </CardTitle>
            </div>
            <CardAction>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeExperience(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {/* Row 1: Job Title & Company */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`exp-title-${index}`}>Job Title</Label>
                <Input
                  id={`exp-title-${index}`}
                  placeholder="Software Engineer"
                  value={exp.jobTitle}
                  onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`exp-company-${index}`}>Company</Label>
                <Input
                  id={`exp-company-${index}`}
                  placeholder="Acme Inc."
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Location & Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`exp-location-${index}`}>Location</Label>
                <Input
                  id={`exp-location-${index}`}
                  placeholder="San Francisco, CA"
                  value={exp.location ?? ''}
                  onChange={(e) => updateExperience(index, 'location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`exp-start-${index}`}>Start Date</Label>
                <Input
                  id={`exp-start-${index}`}
                  placeholder="Jan 2023"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`exp-end-${index}`}>End Date</Label>
                <Input
                  id={`exp-end-${index}`}
                  placeholder={exp.isCurrent ? 'Present' : 'Dec 2024'}
                  value={exp.isCurrent ? 'Present' : (exp.endDate ?? '')}
                  disabled={exp.isCurrent}
                  onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                />
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={exp.isCurrent}
                    onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)}
                    className="size-3.5 rounded border-input accent-primary"
                  />
                  I currently work here
                </label>
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-2">
              <Label>Key Achievements</Label>
              <div className="space-y-2">
                {exp.achievements.map((achievement, achIndex) => (
                  <div key={achIndex} className="flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {achIndex + 1}
                    </span>
                    <Input
                      placeholder="Describe an achievement or responsibility..."
                      value={achievement}
                      onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAchievement(index, achIndex)}
                      disabled={exp.achievements.length <= 1}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="xs"
                className="mt-1 text-primary hover:text-primary"
                onClick={() => addAchievement(index)}
              >
                <Plus className="size-3" />
                Add Achievement
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={addExperience}
      >
        <Plus className="size-4" />
        Add Experience
      </Button>
    </div>
  );
}
