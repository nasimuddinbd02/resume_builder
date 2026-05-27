'use client';

import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface KeywordBadgesProps {
  matched: string[];
  missing: string[];
}

export default function KeywordBadges({ matched, missing }: KeywordBadgesProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Matched Keywords */}
      {matched.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-green-400" />
            Matched Keywords
            <span className="ml-auto text-xs tabular-nums">
              {matched.length}
            </span>
          </h4>
          <div className="stagger-children flex flex-wrap gap-1.5">
            {matched.map((kw) => (
              <Badge
                key={kw}
                className="border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              >
                <Check className="mr-0.5 h-3 w-3" />
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {missing.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <X className="h-3.5 w-3.5 text-red-400" />
            Missing Keywords
            <span className="ml-auto text-xs tabular-nums">
              {missing.length}
            </span>
          </h4>
          <div className="stagger-children flex flex-wrap gap-1.5">
            {missing.map((kw) => (
              <Badge
                key={kw}
                className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <X className="mr-0.5 h-3 w-3" />
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {matched.length === 0 && missing.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No keyword analysis available yet.
        </p>
      )}
    </div>
  );
}
