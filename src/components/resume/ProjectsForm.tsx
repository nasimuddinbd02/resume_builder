'use client';

import { useState } from 'react';
import { ProjectData } from '@/types/resume';
import {
  Plus,
  Trash2,
  X,
  FolderKanban,
  GripVertical,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';

interface ProjectsFormProps {
  projects: ProjectData[];
  onChange: (projects: ProjectData[]) => void;
}

function createEmptyProject(sortOrder: number): ProjectData {
  return {
    name: '',
    description: '',
    technologies: [],
    link: '',
    sortOrder,
  };
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const [techInputs, setTechInputs] = useState<Record<number, string>>({});

  const updateProject = (index: number, field: keyof ProjectData, value: unknown) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addProject = () => {
    onChange([...projects, createEmptyProject(projects.length)]);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
    // Clean up tech input state
    setTechInputs((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const addTechnology = (projectIndex: number) => {
    const input = (techInputs[projectIndex] ?? '').trim();
    if (!input) return;

    // Support comma-separated values
    const newTechs = input
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const current = projects[projectIndex].technologies;
    const unique = newTechs.filter(
      (t) => !current.some((existing) => existing.toLowerCase() === t.toLowerCase())
    );

    if (unique.length > 0) {
      updateProject(projectIndex, 'technologies', [...current, ...unique]);
    }

    setTechInputs((prev) => ({ ...prev, [projectIndex]: '' }));
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const updated = projects[projectIndex].technologies.filter((_, i) => i !== techIndex);
    updateProject(projectIndex, 'technologies', updated);
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, projectIndex: number) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTechnology(projectIndex);
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <Card key={index} className="fade-in-up relative">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground/50" />
              <FolderKanban className="size-4 text-primary" />
              <CardTitle>
                {project.name || `Project ${index + 1}`}
              </CardTitle>
            </div>
            <CardAction>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeProject(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {/* Row 1: Name & Link */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`proj-name-${index}`}>Project Name</Label>
                <Input
                  id={`proj-name-${index}`}
                  placeholder="My Awesome Project"
                  value={project.name}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`proj-link-${index}`} className="gap-1">
                  <ExternalLink className="size-3" />
                  Link
                </Label>
                <Input
                  id={`proj-link-${index}`}
                  placeholder="https://github.com/user/project"
                  value={project.link ?? ''}
                  onChange={(e) => updateProject(index, 'link', e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor={`proj-desc-${index}`}>Description</Label>
              <Textarea
                id={`proj-desc-${index}`}
                placeholder="Describe the project, its purpose, and your role..."
                value={project.description}
                onChange={(e) => updateProject(index, 'description', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Technologies */}
            <div className="space-y-2">
              <Label>Technologies</Label>

              {/* Tech badges */}
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      variant="outline"
                      className="gap-1 pr-1 text-xs"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(index, techIndex)}
                        className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                        aria-label={`Remove ${tech}`}
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add tech input */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="React, TypeScript, Node.js..."
                  value={techInputs[index] ?? ''}
                  onChange={(e) =>
                    setTechInputs((prev) => ({ ...prev, [index]: e.target.value }))
                  }
                  onKeyDown={(e) => handleTechKeyDown(e, index)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTechnology(index)}
                  className="shrink-0"
                >
                  <Plus className="size-3" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Enter or use commas to add multiple technologies at once
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={addProject}
      >
        <Plus className="size-4" />
        Add Project
      </Button>
    </div>
  );
}
