'use client';

import { useState, useMemo } from 'react';
import { SkillData } from '@/types/resume';
import { Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface SkillsFormProps {
  skills: SkillData[];
  onChange: (skills: SkillData[]) => void;
}

const SUGGESTED_CATEGORIES = [
  'Languages',
  'Frameworks',
  'Tools',
  'Databases',
  'Soft Skills',
  'Other',
];

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState('Other');

  // Group skills by category
  const grouped = useMemo(() => {
    const groups: Record<string, SkillData[]> = {};
    for (const skill of skills) {
      const cat = skill.category ?? 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    }
    return groups;
  }, [skills]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    // Prevent duplicates
    const exists = skills.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase() && (s.category ?? 'Other') === newCategory
    );
    if (exists) return;

    onChange([...skills, { name: trimmed, category: newCategory }]);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const categoryOrder = [...SUGGESTED_CATEGORIES, ...Object.keys(grouped).filter((c) => !SUGGESTED_CATEGORIES.includes(c))];
  const visibleCategories = categoryOrder.filter((cat) => grouped[cat]?.length);

  return (
    <div className="space-y-6">
      {/* Grouped Skills Display */}
      {visibleCategories.length > 0 ? (
        <div className="space-y-4">
          {visibleCategories.map((category) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-primary" />
                <h4 className="text-sm font-medium text-foreground">{category}</h4>
                <span className="text-xs text-muted-foreground">
                  ({grouped[category].length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {grouped[category].map((skill) => {
                  const globalIndex = skills.findIndex(
                    (s) => s.name === skill.name && s.category === skill.category
                  );
                  return (
                    <Badge
                      key={`${skill.category}-${skill.name}`}
                      variant="secondary"
                      className="gap-1 pr-1 transition-all hover:bg-secondary/80"
                    >
                      {skill.name}
                      <button
                        type="button"
                        onClick={() => removeSkill(globalIndex)}
                        className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                        aria-label={`Remove ${skill.name}`}
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 py-8 text-center">
          <Sparkles className="mb-2 size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No skills added yet</p>
          <p className="text-xs text-muted-foreground/70">
            Add your technical and soft skills below
          </p>
        </div>
      )}

      {/* Add Skill Row */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
        <Label className="mb-3 text-muted-foreground">Add a Skill</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="skill-name" className="text-xs text-muted-foreground">
              Skill Name
            </Label>
            <Input
              id="skill-name"
              placeholder="e.g. React, Python, Leadership..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="w-full space-y-1.5 sm:w-44">
            <Label htmlFor="skill-category" className="text-xs text-muted-foreground">
              Category
            </Label>
            <select
              id="skill-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {SUGGESTED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={addSkill} size="default" className="shrink-0">
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
