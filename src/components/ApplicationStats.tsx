// src/components/ApplicationStats.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobApplication {
  id: string;
  title: string;
  company: string;
  status: string;
  // other fields omitted for brevity
}

interface Props {
  applications: JobApplication[];
}

export default function ApplicationStats({ applications }: Props) {
  const total = applications.length;
  const statusMap: Record<string, number> = {};
  applications.forEach((app) => {
    statusMap[app.status] = (statusMap[app.status] || 0) + 1;
  });

  return (
    <Card className="glass-card mb-4">
      <CardHeader>
        <CardTitle>Application Stats</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        <div>Total Applications: <Badge>{total}</Badge></div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusMap).map(([status, count]) => (
            <Badge key={status} variant="secondary">
              {status}: {count}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
