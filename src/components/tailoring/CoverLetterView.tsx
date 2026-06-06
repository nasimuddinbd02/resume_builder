'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardCopy, Download, Check } from 'lucide-react';
import { toast } from 'sonner';
import { exportToPDF, exportToDOCX } from '@/lib/pdf-export';

interface CoverLetterViewProps {
  text: string;
  jobTitle?: string;
  companyName?: string;
  hideActions?: boolean;
}

export default function CoverLetterView({
  text,
  jobTitle,
  companyName,
  hideActions = false,
}: CoverLetterViewProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const filename = [
        'Cover_Letter',
        companyName?.replace(/\s+/g, '_'),
        jobTitle?.replace(/\s+/g, '_'),
      ]
        .filter(Boolean)
        .join('_');
      await exportToPDF('cover-letter-preview', `${filename}.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadDOCX = () => {
    try {
      const filename = [
        'Cover_Letter',
        companyName?.replace(/\s+/g, '_'),
        jobTitle?.replace(/\s+/g, '_'),
      ]
        .filter(Boolean)
        .join('_');
      exportToDOCX('cover-letter-preview', `${filename}.doc`);
      toast.success('Word document downloaded!');
    } catch (err) {
      console.error('Word export error:', err);
      toast.error('Failed to generate Word document');
    }
  };

  // Split text into paragraphs
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {/* Action buttons */}
      {!hideActions && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <ClipboardCopy className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadDOCX}
            disabled={downloading}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download Word
          </Button>
        </div>
      )}

      {/* Letter document */}
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30 shadow-lg" style={{ width: '100%' }}>
        <div
          style={{
            transform: 'scale(0.58)',
            transformOrigin: 'top center',
            marginBottom: '-40%',
          }}
        >
          <div
            id="cover-letter-preview"
            style={{
              width: '8.5in',
              minHeight: '11in',
              padding: '1in 1in',
              fontFamily: "'Inter', sans-serif",
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
            }}
          >
            {/* Header area */}
            {(jobTitle || companyName) && (
              <div style={{ marginBottom: '1.5rem' }}>
                {companyName && (
                  <p
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#333',
                      margin: 0,
                    }}
                  >
                    Re: {jobTitle || 'Application'}
                    {companyName && ` at ${companyName}`}
                  </p>
                )}
              </div>
            )}

            {/* Body */}
            {paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: '0.85rem',
                  lineHeight: 1.7,
                  color: '#333',
                  marginBottom: '0.8rem',
                  textAlign: 'justify',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
