'use client';

import { ResumeData } from '@/types/resume';

interface ExecutiveTemplateProps {
  data: ResumeData;
  id?: string;
}

const ACCENT = '#4a3760';

export default function ExecutiveTemplate({ data, id }: ExecutiveTemplateProps) {
  const sortedExperiences = [...data.experiences].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  const sortedEducation = [...data.education].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  const sortedProjects = [...data.projects].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );

  const contactParts = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.github,
    data.website,
  ].filter(Boolean);

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: ACCENT,
    textAlign: 'center',
    borderTop: `1px solid ${ACCENT}`,
    borderBottom: `1px solid ${ACCENT}`,
    padding: '0.3rem 0',
    margin: '0.7rem 0 0.45rem',
  };

  // Group skills by category
  const skillsByCategory = data.skills.reduce<Record<string, string[]>>(
    (acc, skill) => {
      const cat = skill.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill.name);
      return acc;
    },
    {}
  );

  return (
    <div
      id={id || 'resume-preview'}
      className="resume-preview"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '0.6in 0.7in',
        fontFamily: "Georgia, 'Times New Roman', serif",
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
      }}
    >
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: ACCENT,
            margin: 0,
            letterSpacing: '0.04em',
          }}
        >
          {data.fullName}
        </h1>
        {contactParts.length > 0 && (
          <p
            style={{
              fontSize: '0.72rem',
              color: '#555',
              marginTop: '0.35rem',
              lineHeight: 1.6,
            }}
          >
            {contactParts.join('  |  ')}
          </p>
        )}
      </header>

      {/* Professional Summary */}
      {data.summary && (
        <section>
          <h2 style={sectionHeaderStyle}>Professional Summary</h2>
          <p
            style={{
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: '#333',
              textAlign: 'justify',
              margin: 0,
            }}
          >
            {data.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {sortedExperiences.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Professional Experience</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {sortedExperiences.map((exp, i) => (
              <div key={exp.id || i}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#111',
                    }}
                  >
                    {exp.jobTitle}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#777',
                      fontStyle: 'italic',
                    }}
                  >
                    {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#555',
                    margin: '0.05rem 0 0.15rem',
                    fontStyle: 'italic',
                  }}
                >
                  {exp.company}
                  {exp.location && `, ${exp.location}`}
                </p>
                {exp.achievements.length > 0 && (
                  <ul
                    style={{
                      margin: '0.15rem 0 0 1.2rem',
                      padding: 0,
                      listStyleType: 'disc',
                    }}
                  >
                    {exp.achievements.map((ach, j) => (
                      <li
                        key={j}
                        style={{
                          fontSize: '0.78rem',
                          lineHeight: 1.55,
                          color: '#333',
                          marginBottom: '0.08rem',
                        }}
                      >
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

      {/* Education */}
      {sortedEducation.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Education</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sortedEducation.map((edu, i) => (
              <div key={edu.id || i}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#111',
                    }}
                  >
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#777',
                      fontStyle: 'italic',
                    }}
                  >
                    {edu.startDate && `${edu.startDate} – `}
                    {edu.endDate}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#555',
                    margin: '0.05rem 0 0',
                    fontStyle: 'italic',
                  }}
                >
                  {edu.school}
                  {edu.location && `, ${edu.location}`}
                  {edu.gpa && (
                    <span style={{ color: '#777' }}> — GPA: {edu.gpa}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Skills &amp; Competencies</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {Object.entries(skillsByCategory).map(([cat, skills]) => (
              <p key={cat} style={{ fontSize: '0.78rem', color: '#333', margin: 0 }}>
                <strong style={{ color: '#222' }}>{cat}:</strong>{' '}
                {skills.join(', ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {sortedProjects.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Notable Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {sortedProjects.map((proj, i) => (
              <div key={proj.id || i}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#111',
                    }}
                  >
                    {proj.name}
                  </span>
                  {proj.link && (
                    <a
                      href={proj.link}
                      style={{
                        fontSize: '0.68rem',
                        color: ACCENT,
                        textDecoration: 'none',
                      }}
                    >
                      {proj.link}
                    </a>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '0.78rem',
                    lineHeight: 1.55,
                    color: '#333',
                    margin: '0.1rem 0',
                  }}
                >
                  {proj.description}
                </p>
                {proj.technologies.length > 0 && (
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: '#666',
                      margin: 0,
                      fontStyle: 'italic',
                    }}
                  >
                    Technologies: {proj.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
