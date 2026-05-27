'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileCheck, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { ResumeData } from '@/types/resume';

interface ResumeUploaderProps {
  onParsed: (data: ResumeData) => void;
  onError?: (error: string) => void;
}

type UploadStage = 'idle' | 'extracting' | 'analyzing' | 'done' | 'error';

const stageConfig: Record<UploadStage, { label: string; progress: number }> = {
  idle: { label: '', progress: 0 },
  extracting: { label: 'Extracting text...', progress: 30 },
  analyzing: { label: 'Analyzing with AI...', progress: 65 },
  done: { label: 'Done!', progress: 100 },
  error: { label: 'Failed', progress: 0 },
};

export default function ResumeUploader({ onParsed, onError }: ResumeUploaderProps) {
  const [stage, setStage] = useState<UploadStage>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const allowed = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];

      if (!allowed.includes(file.type)) {
        const msg = 'Please upload a PDF or DOCX file.';
        onError?.(msg);
        toast.error(msg);
        return;
      }

      try {
        setStage('extracting');

        const formData = new FormData();
        formData.append('file', file);

        // Simulate staged progress
        const analyzeTimeout = setTimeout(() => setStage('analyzing'), 1500);

        const headers: Record<string, string> = {};
        const savedProvider = localStorage.getItem('ai_provider');
        const savedApiKey = localStorage.getItem('ai_api_key');
        if (savedProvider) headers['x-ai-provider'] = savedProvider;
        if (savedApiKey) headers['x-ai-api-key'] = savedApiKey;

        const response = await fetch('/api/parse', {
          method: 'POST',
          headers,
          body: formData,
        });

        clearTimeout(analyzeTimeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Upload failed (${response.status})`
          );
        }

        setStage('analyzing');

        const data = await response.json();

        setStage('done');

        // Small delay so user sees the "Done!" state
        setTimeout(() => {
          onParsed(data.parsedData);
        }, 600);
      } catch (err) {
        setStage('error');
        const message =
          err instanceof Error ? err.message : 'Failed to parse resume';
        onError?.(message);
        toast.error(message);

        // Reset after showing error
        setTimeout(() => setStage('idle'), 2500);
      }
    },
    [onParsed, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    if (stage === 'idle' || stage === 'error') {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so re-uploading same file works
    e.target.value = '';
  };

  const isProcessing = stage === 'extracting' || stage === 'analyzing';
  const { label, progress } = stageConfig[stage];

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center gap-3
          rounded-xl border-2 border-dashed p-10
          transition-all duration-200 cursor-pointer
          ${isDragOver
            ? 'pulse-glow border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          }
          ${isProcessing ? 'pointer-events-none' : ''}
        `}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload resume file"
        />

        {/* Icon */}
        {stage === 'done' ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
            <FileCheck className="h-7 w-7 text-green-400" />
          </div>
        ) : isProcessing ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
            <Upload className="h-7 w-7 text-muted-foreground" />
          </div>
        )}

        {/* Label text */}
        {stage === 'idle' || stage === 'error' ? (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drag &amp; drop your resume here, or{' '}
              <span className="text-primary underline underline-offset-2">
                click to browse
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports PDF, DOCX, DOC
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full max-w-xs">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <div className={`w-full ${isProcessing ? 'shimmer' : ''}`}>
              <Progress value={progress} className="h-2">
                <span className="sr-only">{progress}%</span>
              </Progress>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
