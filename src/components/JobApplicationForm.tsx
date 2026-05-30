// src/components/JobApplicationForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function JobApplicationForm({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("Applied");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, company, link, status, notes }),
      });
      toast.success("Application created");
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create application");
    }
  };

  return (
    <Card className="glass-card mb-4">
      <CardHeader>
        <CardTitle>Create New Application</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <Input
            placeholder="Job Link (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <Input
            placeholder="Status (e.g., Applied, Interview)"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <Input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
