// src/components/JobApplicationCard.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface JobApplication {
  id: string;
  title: string;
  company: string;
  link?: string | null;
  status: string;
  notes?: string | null;
  appliedAt: string;
}

interface Props {
  application: JobApplication;
  onUpdate: () => void;
}

export default function JobApplicationCard({ application, onUpdate }: Props) {
  const handleDelete = async () => {
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: "DELETE",
      });
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform">
      <CardHeader>
        <CardTitle>{application.title} @ {application.company}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Status: {application.status}</p>
        {application.link && (
          <a href={application.link} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            View posting
          </a>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => {/* Edit logic placeholder */}}>
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
