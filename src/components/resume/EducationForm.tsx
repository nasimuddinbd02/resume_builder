'use client';

import { EducationData } from '@/types/resume';
import { Plus, Trash2, GraduationCap, GripVertical } from 'lucide-react';
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

interface EducationFormProps {
  education: EducationData[];
  onChange: (education: EducationData[]) => void;
}

function createEmptyEducation(sortOrder: number): EducationData {
  return {
    school: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    sortOrder,
  };
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const updateEducation = (index: number, field: keyof EducationData, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addEducation = () => {
    onChange([...education, createEmptyEducation(education.length)]);
  };

  const removeEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <Card key={index} className="fade-in-up relative">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground/50" />
              <GraduationCap className="size-4 text-primary" />
              <CardTitle>
                {edu.school || edu.degree
                  ? `${edu.degree}${edu.school ? ` — ${edu.school}` : ''}`
                  : `Education ${index + 1}`}
              </CardTitle>
            </div>
            <CardAction>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeEducation(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {/* Row 1: School & Degree */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`edu-school-${index}`}>School / University</Label>
                <Input
                  id={`edu-school-${index}`}
                  placeholder="Stanford University"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                <Input
                  id={`edu-degree-${index}`}
                  placeholder="Bachelor of Science"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Field & Location */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`edu-field-${index}`}>Field of Study</Label>
                <Input
                  id={`edu-field-${index}`}
                  placeholder="Computer Science"
                  value={edu.field ?? ''}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edu-location-${index}`}>Location</Label>
                <Input
                  id={`edu-location-${index}`}
                  placeholder="Stanford, CA"
                  value={edu.location ?? ''}
                  onChange={(e) => updateEducation(index, 'location', e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Start Date, End Date, GPA */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`edu-start-${index}`}>Start Date</Label>
                <Input
                  id={`edu-start-${index}`}
                  placeholder="Sep 2019"
                  value={edu.startDate ?? ''}
                  onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edu-end-${index}`}>End Date</Label>
                <Input
                  id={`edu-end-${index}`}
                  placeholder="Jun 2023"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edu-gpa-${index}`}>GPA</Label>
                <Input
                  id={`edu-gpa-${index}`}
                  placeholder="3.9 / 4.0"
                  value={edu.gpa ?? ''}
                  onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={addEducation}
      >
        <Plus className="size-4" />
        Add Education
      </Button>
    </div>
  );
}
