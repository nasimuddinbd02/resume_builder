'use client';

import { ResumeData } from '@/types/resume';

interface CustomTemplateProps {
  data: ResumeData;
  id?: string;
  customStyles?: {
    accentColor?: string;
    fontFamily?: string;
    fontSize?: string;
    padding?: string;
  } | null;
}

export default function CustomTemplate({ data, id, customStyles }: CustomTemplateProps) {
  const ACCENT = customStyles?.accentColor || '#1f2937';

  const sortedExperiences = [...data.experiences].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  const sortedEducation = [...data.education].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  const sortedProjects = [...data.projects].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );

  const cleanContactValue = (val: string | null | undefined): string | null => {
    if (!val) return null;
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();
    if (lower === '' || lower === 'null' || lower === 'undefined') {
      return null;
    }
    return trimmed;
  };

  const contactParts = [
    cleanContactValue(data.email),
    cleanContactValue(data.phone),
    cleanContactValue(data.location),
    cleanContactValue(data.linkedin),
    cleanContactValue(data.github),
    cleanContactValue(data.website),
  ].filter(Boolean) as string[];

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '1.05em',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: ACCENT,
    borderBottom: `1.5px solid ${ACCENT}`,
    paddingBottom: '0.2em',
    marginBottom: '0.6em',
    marginTop: '1.1em',
  };

  const selectedFont = customStyles?.fontFamily === 'Inter' 
    ? "'Inter', 'SF Pro Text', system-ui, sans-serif"
    : customStyles?.fontFamily || "'Inter', 'SF Pro Text', system-ui, sans-serif";

  return (
    <div
      id={id || 'resume-preview'}
      className="resume-preview"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: customStyles?.padding || '0.5in 0.6in',
        fontFamily: selectedFont,
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontSize: customStyles?.fontSize || '0.8rem',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header ── */}
      <header style={{ marginBottom: '1.0em' }}>
        <h1
          style={{
            fontSize: '2.2em',
            fontWeight: 800,
            color: '#111827',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {data.fullName}
        </h1>
        {sortedExperiences[0] && (
          <p
            style={{
              fontSize: '1.12em',
              color: '#4b5563',
              marginTop: '0.2em',
              fontWeight: 500,
            }}
          >
            {sortedExperiences[0].jobTitle}
          </p>
        )}
        {contactParts.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6em 1.0em',
              fontSize: '0.9em',
              color: '#4b5563',
              marginTop: '0.5em',
            }}
          >
            {contactParts.map((part, i) => (
              <span key={`contact-${i}`}>
                {part}
                {i < contactParts.length - 1 && (
                  <span style={{ marginLeft: '1.0em', color: '#d1d5db' }}>|</span>
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* ── Summary ── */}
      {data.summary && (
        <section style={{ marginBottom: '0.8em' }}>
          <h2 style={sectionHeaderStyle}>Professional Summary</h2>
          <p
            style={{
              fontSize: '0.98em',
              lineHeight: 1.5,
              color: '#374151',
              margin: 0,
              textAlign: 'justify',
            }}
          >
            {data.summary}
          </p>
        </section>
      )}

      {/* ── Work Experience ── */}
      {sortedExperiences.length > 0 && (
        <section style={{ marginBottom: '0.8em' }}>
          <h2 style={sectionHeaderStyle}>Work Experience</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8em' }}>
            {sortedExperiences.map((exp, idx) => (
              <div key={`exp-${idx}`} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontWeight: 600,
                    fontSize: '1.02em',
                    color: '#111827',
                  }}
                >
                  <span>
                    {exp.jobTitle} <span style={{ fontWeight: 400, color: '#4b5563' }}>at</span> {exp.company}
                  </span>
                  <span style={{ fontSize: '0.92em', fontWeight: 500, color: '#4b5563' }}>
                    {exp.startDate} – {exp.endDate || (exp.isCurrent ? 'Present' : '')}
                  </span>
                </div>
                {exp.location && (
                  <div
                    style={{
                      fontSize: '0.9em',
                      color: '#6b7280',
                      marginTop: '0.08em',
                      fontStyle: 'italic',
                    }}
                  >
                    {exp.location}
                  </div>
                )}
                {exp.achievements.length > 0 && (
                  <ul
                    style={{
                      marginTop: '0.25em',
                      marginBottom: 0,
                      paddingLeft: '1.3em',
                      fontSize: '0.95em',
                      lineHeight: 1.45,
                      color: '#374151',
                    }}
                  >
                    {exp.achievements.map((ach, i) => (
                      <li key={i} style={{ marginBottom: '0.2em' }}>
                        {ach}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Skills ── */}
      {data.skills.length > 0 && (
        <section style={{ marginBottom: '0.8em' }}>
          <h2 style={sectionHeaderStyle}>Skills &amp; Technologies</h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4em',
              fontSize: '0.95em',
              color: '#374151',
            }}
          >
            {/* Group skills by category if any */}
            {(() => {
              const categories = data.skills.reduce<Record<string, string[]>>(
                (acc, s) => {
                  const cat = s.category || 'Skills';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(s.name);
                  return acc;
                },
                {}
              );
              return Object.entries(categories).map(([cat, list]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, color: '#111827', minWidth: '1.2in', marginRight: '0.6em' }}>
                    {cat}:
                  </span>
                  <span>{list.join(', ')}</span>
                </div>
              ));
            })()}
          </div>
        </section>
      )}

      {/* ── Projects ── */}
      {sortedProjects.length > 0 && (
        <section style={{ marginBottom: '0.8em' }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7em' }}>
            {sortedProjects.map((proj, idx) => (
              <div key={`proj-${idx}`} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontWeight: 600,
                    fontSize: '1.02em',
                    color: '#111827',
                  }}
                >
                  <span>
                    {proj.name}
                    {proj.link && (
                      <a
                        href={proj.link}
                        style={{
                          marginLeft: '0.6em',
                          fontSize: '0.88em',
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontWeight: 400,
                        }}
                      >
                        {proj.link}
                      </a>
                    )}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.95em',
                    lineHeight: 1.4,
                    color: '#374151',
                    margin: '0.12em 0 0.2em',
                  }}
                >
                  {proj.description}
                </p>
                {proj.technologies.length > 0 && (
                  <div style={{ fontSize: '0.9em', color: '#6b7280' }}>
                    <span style={{ fontWeight: 500, color: '#4b5563' }}>Technologies:</span>{' '}
                    {proj.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Education ── */}
      {sortedEducation.length > 0 && (
        <section style={{ marginBottom: '0.5em' }}>
          <h2 style={sectionHeaderStyle}>Education</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6em' }}>
            {sortedEducation.map((edu, idx) => (
              <div key={`edu-${idx}`} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontWeight: 600,
                    fontSize: '1.02em',
                    color: '#111827',
                  }}
                >
                  <span>
                    {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                  </span>
                  <span style={{ fontSize: '0.92em', fontWeight: 500, color: '#4b5563' }}>
                    {edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.92em',
                    color: '#4b5563',
                    marginTop: '0.08em',
                  }}
                >
                  <span>{edu.school}</span>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
