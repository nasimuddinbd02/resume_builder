'use client';

import { ResumeData } from '@/types/resume';
import ModernTemplate from '@/components/templates/ModernTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import CustomTemplate from '@/components/templates/CustomTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  template?: string;
  id?: string;
}

export default function ResumePreview({
  data,
  template = 'modern',
  id,
}: ResumePreviewProps) {
  const renderTemplate = () => {
    let templateName = template;
    let customStyles = null;

    if (template && template.startsWith('{')) {
      try {
        const parsed = JSON.parse(template);
        templateName = parsed.name || 'custom';
        customStyles = parsed;
      } catch (e) {
        console.error('Failed to parse template JSON:', e);
      }
    }

    switch (templateName) {
      case 'executive':
        return <ExecutiveTemplate data={data} id={id} />;
      case 'minimal':
        return <MinimalTemplate data={data} id={id} />;
      case 'custom':
        return <CustomTemplate data={data} id={id} customStyles={customStyles} />;
      case 'modern':
      default:
        return <ModernTemplate data={data} id={id} />;
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-muted/30 shadow-lg"
      style={{ width: '100%' }}
    >
      <div
        style={{
          transform: 'scale(0.6)',
          transformOrigin: 'top center',
          marginBottom: '-40%',
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}
