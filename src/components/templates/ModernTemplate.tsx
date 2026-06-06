'use client';

import { ResumeData } from '@/types/resume';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';

function Linkedin({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Github({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface ModernTemplateProps {
  data: ResumeData;
  id?: string;
}

const ACCENT = '#7c3aed';
const ACCENT_LIGHT = '#ede9fe';

export default function ModernTemplate({ data, id }: ModernTemplateProps) {
  // Group skills by category
  const skillsByCategory = data.skills.reduce<Record<string, string[]>>(
    (acc, skill) => {
      const cat = skill.category || 'Other';
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

  const email = cleanContactValue(data.email);
  const phone = cleanContactValue(data.phone);
  const location = cleanContactValue(data.location);
  const linkedin = cleanContactValue(data.linkedin);
  const github = cleanContactValue(data.github);
  const website = cleanContactValue(data.website);

  const contactItems = [
    email ? { icon: <Mail size={12} className="contact-icon-mail" />, value: email } : null,
    phone ? { icon: <Phone size={12} className="contact-icon-phone" />, value: phone } : null,
    location ? { icon: <MapPin size={12} className="contact-icon-mappin" />, value: location } : null,
    linkedin ? { icon: <Linkedin size={12} className="contact-icon-linkedin" />, value: linkedin } : null,
    github ? { icon: <Github size={12} className="contact-icon-github" />, value: github } : null,
    website ? { icon: <Globe size={12} className="contact-icon-globe" />, value: website } : null,
  ].filter(Boolean) as { icon: React.ReactNode; value: string }[];

  const sortedExperiences = [...data.experiences].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  const sortedEducation = [...data.education].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  const sortedProjects = [...data.projects].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );

  return (
    <div
      id={id || 'resume-preview'}
      className="resume-preview"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '0.5in',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 'min-content',
          maxWidth: '42%',
          flexShrink: 0,
          backgroundColor: '#1e1b4b',
          color: '#e8e4f8',
          padding: '0.25in 0.2in',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
        }}
      >
        {/* Name */}
        <div>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {data.fullName}
          </h1>
          {sortedExperiences[0] && (
            <p
              style={{
                fontSize: '0.7rem',
                color: '#c4b5fd',
                marginTop: '0.25rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {sortedExperiences[0].jobTitle}
            </p>
          )}
        </div>

        {/* Accent bar */}
        <div
          style={{
            width: '2rem',
            height: '3px',
            backgroundColor: ACCENT,
            borderRadius: '2px',
          }}
        />

        {/* Contact */}
        <div>
          <h2
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#c4b5fd',
              marginBottom: '0.4rem',
              borderBottom: 'none',
              paddingBottom: 0,
              marginTop: 0,
            }}
          >
            Contact
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {contactItems.map((item, i) => (
              <div
                key={`contact-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.65rem',
                  color: '#d6d3e8',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: ACCENT, flexShrink: 0 }}>{item.icon}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#c4b5fd',
                marginBottom: '0.5rem',
                borderBottom: 'none',
                paddingBottom: 0,
                marginTop: 0,
              }}
            >
              Skills
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {Object.entries(skillsByCategory).map(([cat, skills]) => (
                <div key={`cat-${cat}`}>
                  <p
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      color: '#a78bfa',
                      marginBottom: '0.15rem',
                    }}
                  >
                    {cat}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                    {skills.map((s, idx) => (
                      <span
                        key={`${s}-${idx}`}
                        style={{
                          fontSize: '0.58rem',
                          backgroundColor: 'rgba(124,58,237,0.18)',
                          color: '#e0d5ff',
                          padding: '0.1rem 0.3rem',
                          borderRadius: '3px',
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
          </div>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main
        style={{
          flex: 1,
          padding: '0.25in 0 0.25in 0.3in',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.7rem',
        }}
      >
        {/* Professional Summary */}
        {data.summary && (
          <section>
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: ACCENT,
                borderBottom: `2px solid ${ACCENT}`,
                paddingBottom: '0.2rem',
                marginBottom: '0.4rem',
                marginTop: 0,
              }}
            >
              Professional Summary
            </h2>
            <p
              style={{
                fontSize: '0.78rem',
                lineHeight: 1.55,
                color: '#444',
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
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: ACCENT,
                borderBottom: `2px solid ${ACCENT}`,
                paddingBottom: '0.2rem',
                marginBottom: '0.4rem',
                marginTop: 0,
              }}
            >
              Work Experience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {sortedExperiences.map((exp, i) => (
                <div key={exp.id || `exp-${i}`}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#111',
                        }}
                      >
                        {exp.jobTitle}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#555' }}>
                        {' '}
                        · {exp.company}
                      </span>
                      {cleanContactValue(exp.location) && (
                        <span style={{ fontSize: '0.72rem', color: '#888' }}>
                          {' '}
                          · {cleanContactValue(exp.location)}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: '#888',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.achievements.length > 0 && (
                    <ul
                      style={{
                        margin: '0.2rem 0 0 0',
                        paddingLeft: '0.6rem',
                        listStyleType: 'disc',
                      }}
                    >
                      {exp.achievements.map((ach, j) => (
                        <li
                          key={`ach-${j}`}
                          style={{
                            fontSize: '0.76rem',
                            lineHeight: 1.5,
                            color: '#444',
                            marginBottom: '0.1rem',
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
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: ACCENT,
                borderBottom: `2px solid ${ACCENT}`,
                paddingBottom: '0.2rem',
                marginBottom: '0.4rem',
                marginTop: 0,
              }}
            >
              Education
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {sortedEducation.map((edu, i) => (
                <div key={edu.id || `edu-${i}`}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#111',
                        }}
                      >
                        {edu.school}
                      </span>
                      {cleanContactValue(edu.location) && (
                        <span style={{ fontSize: '0.72rem', color: '#888' }}>
                          {' '}
                          · {cleanContactValue(edu.location)}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: '#888',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {edu.startDate && `${edu.startDate} – `}
                      {edu.endDate}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.76rem',
                      color: '#444',
                      margin: '0.05rem 0 0',
                    }}
                  >
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                    {cleanContactValue(edu.gpa) && (
                      <span style={{ color: '#888' }}> · GPA: {cleanContactValue(edu.gpa)}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {sortedProjects.length > 0 && (
          <section>
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: ACCENT,
                borderBottom: `2px solid ${ACCENT}`,
                paddingBottom: '0.2rem',
                marginBottom: '0.4rem',
                marginTop: 0,
              }}
            >
              Projects
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {sortedProjects.map((proj, i) => (
                <div key={proj.id || `proj-${i}`}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.82rem',
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
                          fontSize: '0.65rem',
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
                      fontSize: '0.76rem',
                      lineHeight: 1.5,
                      color: '#444',
                      margin: '0.1rem 0',
                    }}
                  >
                    {proj.description}
                  </p>
                  {proj.technologies.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.2rem',
                        marginTop: '0.1rem',
                      }}
                    >
                      {proj.technologies.map((tech, idx) => (
                        <span
                          key={`${tech}-${idx}`}
                          style={{
                            fontSize: '0.6rem',
                            backgroundColor: ACCENT_LIGHT,
                            color: ACCENT,
                            padding: '0.08rem 0.3rem',
                            borderRadius: '3px',
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
      </main>
    </div>
  );
}
