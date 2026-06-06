'use client';

import { ResumeData } from '@/types/resume';

interface MinimalTemplateProps {
  data: ResumeData;
  id?: string;
}

const ACCENT = '#0d7377';

export default function MinimalTemplate({ data, id }: MinimalTemplateProps) {
  const sortedExperiences = [...data.experiences].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  const sortedEducation = [...data.education].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  const sortedProjects = [...data.projects].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );

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
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: ACCENT,
    marginBottom: '0.3rem',
    marginTop: 0,
    borderBottom: 'none',
    paddingBottom: 0,
  };

  return (
    <div
      id={id || 'resume-preview'}
      className="resume-preview"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '0.5in',
        fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        fontSize: '0.74rem',
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: `1.5px solid ${ACCENT}`,
          paddingBottom: '0.35rem',
          marginBottom: '0.55rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#111',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {data.fullName}
          </h1>
          {data.summary && (
            <p
              style={{
                fontSize: '0.68rem',
                color: '#666',
                marginTop: '0.15rem',
                maxWidth: '3.8in',
                lineHeight: 1.4,
                textAlign: 'justify',
              }}
            >
              {data.summary}
            </p>
          )}
        </div>
        <div
          style={{
            textAlign: 'right',
            fontSize: '0.62rem',
            color: '#555',
            lineHeight: 1.6,
          }}
        >
          {contactParts.map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </div>
      </header>

      {/* ── Two-Column Body ── */}
      <div style={{ display: 'flex', gap: '0.5in' }}>
        {/* Left Column — Skills + Education */}
        <div style={{ width: '28%', flexShrink: 0 }}>
          {/* Skills */}
          {data.skills.length > 0 && (
            <section style={{ marginBottom: '0.6rem' }}>
              <h2 style={sectionHeaderStyle}>Skills</h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                {Object.entries(skillsByCategory).map(([cat, skills]) => (
                  <div key={cat}>
                    <p
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        color: '#333',
                        marginBottom: '0.1rem',
                      }}
                    >
                      {cat}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.15rem',
                      }}
                    >
                      {skills.map((s, idx) => (
                        <span
                          key={`${s}-${idx}`}
                          style={{
                            fontSize: '0.58rem',
                            color: '#444',
                            backgroundColor: '#f0fafa',
                            border: '1px solid #d0e8e8',
                            padding: '0.06rem 0.25rem',
                            borderRadius: '2px',
                            lineHeight: 1.4,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {sortedEducation.length > 0 && (
            <section>
              <h2 style={sectionHeaderStyle}>Education</h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                {sortedEducation.map((edu, i) => (
                  <div key={edu.id || i}>
                    <p
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: '#111',
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {edu.degree}
                    </p>
                    {cleanContactValue(edu.field) && (
                      <p
                        style={{
                          fontSize: '0.62rem',
                          color: '#444',
                          margin: 0,
                        }}
                      >
                        {edu.field}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: '0.62rem',
                        color: '#666',
                        margin: '0.05rem 0 0',
                      }}
                    >
                      {edu.school}
                    </p>
                    <p
                      style={{
                        fontSize: '0.58rem',
                        color: '#888',
                        margin: '0.02rem 0 0',
                      }}
                    >
                      {edu.startDate && `${edu.startDate} – `}
                      {edu.endDate}
                      {cleanContactValue(edu.gpa) && ` · GPA: ${cleanContactValue(edu.gpa)}`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column — Experience + Projects */}
        <div style={{ flex: 1 }}>
          {/* Experience */}
          {sortedExperiences.length > 0 && (
            <section style={{ marginBottom: '0.55rem' }}>
              <h2 style={sectionHeaderStyle}>Experience</h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                {sortedExperiences.map((exp, i) => (
                  <div key={exp.id || i}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: '#111',
                        }}
                      >
                        {exp.jobTitle}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6rem',
                          color: '#999',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.68rem',
                        color: ACCENT,
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      {exp.company}
                      {cleanContactValue(exp.location) && (
                        <span style={{ color: '#999', fontWeight: 400 }}>
                          , {cleanContactValue(exp.location)}
                        </span>
                      )}
                    </p>
                    {exp.achievements.length > 0 && (
                      <ul
                        style={{
                          margin: '0.15rem 0 0 0',
                          paddingLeft: '0.6rem',
                          listStyleType: '\'–  \'',
                        }}
                      >
                        {exp.achievements.map((ach, j) => (
                          <li
                            key={j}
                            style={{
                              fontSize: '0.7rem',
                              lineHeight: 1.45,
                              color: '#444',
                              marginBottom: '0.05rem',
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

          {/* Projects */}
          {sortedProjects.length > 0 && (
            <section>
              <h2 style={sectionHeaderStyle}>Projects</h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                {sortedProjects.map((proj, i) => (
                  <div key={proj.id || i}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.3rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: '#111',
                        }}
                      >
                        {proj.name}
                      </span>
                      {proj.link && (
                        <a
                          href={proj.link}
                          style={{
                            fontSize: '0.58rem',
                            color: ACCENT,
                            textDecoration: 'none',
                          }}
                        >
                          ↗ link
                        </a>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '0.68rem',
                        lineHeight: 1.4,
                        color: '#444',
                        margin: '0.05rem 0',
                      }}
                    >
                      {proj.description}
                    </p>
                    {proj.technologies.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.15rem',
                        }}
                      >
                        {proj.technologies.map((tech, idx) => (
                          <span
                            key={`${tech}-${idx}`}
                            style={{
                              fontSize: '0.55rem',
                              color: ACCENT,
                              backgroundColor: '#f0fafa',
                              padding: '0.05rem 0.22rem',
                              borderRadius: '2px',
                              fontWeight: 500,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
