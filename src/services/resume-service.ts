import * as resumeDal from '@/data-access/resume';
import { extractResumeText } from '@/lib/parse-resume';
import { getAIProvider } from '@/lib/ai/ai-provider';
import {
  getParseResumePrompt,
  getTailorResumePrompt,
  getCoverLetterPrompt,
} from '@/lib/prompts';
import { ResumeData, TailoringResult } from '@/types/resume';

// Helper to sanitize database string fields (converting 'null' and 'undefined' to proper null values)
function sanitizeResumeDbObject(resume: any): any {
  if (!resume) return null;
  
  const sanitize = (val: string | null | undefined): string | null => {
    if (!val) return null;
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();
    if (lower === '' || lower === 'null' || lower === 'undefined') {
      return null;
    }
    return trimmed;
  };

  return {
    ...resume,
    phone: sanitize(resume.phone),
    location: sanitize(resume.location),
    website: sanitize(resume.website),
    linkedin: sanitize(resume.linkedin),
    github: sanitize(resume.github),
    summary: sanitize(resume.summary),
    experiences: (resume.experiences || []).map((exp: any) => ({
      ...exp,
      location: sanitize(exp.location),
      endDate: sanitize(exp.endDate),
    })),
    education: (resume.education || []).map((edu: any) => ({
      ...edu,
      field: sanitize(edu.field),
      location: sanitize(edu.location),
      startDate: sanitize(edu.startDate),
      endDate: sanitize(edu.endDate),
      gpa: sanitize(edu.gpa),
    })),
    projects: (resume.projects || []).map((p: any) => ({
      ...p,
      link: sanitize(p.link),
    })),
  };
}

// Helper to map DB resume format (which stores arrays as JSON strings in SQLite) to typed ResumeData
function resumeToData(resume: any): ResumeData {
  const sanitize = (val: string | null | undefined): string | null => {
    if (!val) return null;
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();
    if (lower === '' || lower === 'null' || lower === 'undefined') {
      return null;
    }
    return trimmed;
  };

  return {
    fullName: resume.fullName as string,
    email: resume.email,
    phone: sanitize(resume.phone),
    location: sanitize(resume.location),
    website: sanitize(resume.website),
    linkedin: sanitize(resume.linkedin),
    github: sanitize(resume.github),
    summary: sanitize(resume.summary),
    experiences: ((resume.experiences as any[]) || []).map((exp) => ({
      jobTitle: exp.jobTitle as string,
      company: exp.company,
      location: sanitize(exp.location),
      startDate: exp.startDate,
      endDate: sanitize(exp.endDate),
      isCurrent: exp.isCurrent,
      achievements: typeof exp.achievements === 'string'
        ? JSON.parse(exp.achievements || '[]')
        : exp.achievements,
      sortOrder: exp.sortOrder as number,
    })),
    education: ((resume.education as any[]) || []).map((edu) => ({
      school: edu.school as string,
      degree: edu.degree,
      field: sanitize(edu.field),
      location: sanitize(edu.location),
      startDate: sanitize(edu.startDate),
      endDate: edu.endDate,
      gpa: sanitize(edu.gpa),
      sortOrder: edu.sortOrder,
    })),
    skills: ((resume.skills as any[]) || []).map((s) => ({ name: s.name as string, category: s.category as string | null })),
    projects: ((resume.projects as any[]) || []).map((p) => ({
      name: p.name as string,
      description: p.description,
      technologies: typeof p.technologies === 'string'
        ? JSON.parse(p.technologies || '[]')
        : p.technologies,
      link: sanitize(p.link),
      sortOrder: p.sortOrder,
    })),
  };
}

export async function listResumes(userId: string) {
  const resumes = await resumeDal.getUserResumes(userId);
  return resumes.map(sanitizeResumeDbObject);
}

export async function getResume(id: string, userId: string) {
  const resume = await resumeDal.getResumeById(id, userId);
  if (!resume) return null;
  return sanitizeResumeDbObject(resume);
}

export async function createResume(userId: string, data: Partial<ResumeData>) {
  return resumeDal.createResume(userId, data);
}

export async function updateResume(id: string, userId: string, data: Partial<ResumeData>) {
  return resumeDal.updateResume(id, userId, data);
}

export async function deleteResume(id: string, userId: string) {
  return resumeDal.deleteResume(id, userId);
}

export async function parseResumeFile(file: File) {
  // Stage 1: Extract raw text from file
  const { text, fileName } = await extractResumeText(file);

  // Stage 2: Parse plain text to JSON structure using Configured AI
  const prompt = getParseResumePrompt(text);
  const ai = await getAIProvider();
  const parsedData = await ai.generateJSON<ResumeData>(prompt);

  return {
    parsedData,
    fileName,
    rawTextLength: text.length,
  };
}

export async function tailorResume(
  userId: string,
  resumeId: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string
) {
  // Fetch the base resume using data access layer
  const baseResume = await resumeDal.getResumeById(resumeId, userId);
  if (!baseResume) {
    throw new Error('Resume not found');
  }

  // Parse the DB fields (converting JSON strings back to arrays)
  const resumeData = resumeToData(baseResume);

  const ai = await getAIProvider();

  // Generate tailored resume via Configured AI API
  const tailorPrompt = getTailorResumePrompt(resumeData, jobDescription, jobTitle, companyName);
  const tailoringResult = await ai.generateJSON<TailoringResult>(tailorPrompt);

  // Generate cover letter via Configured AI API
  const coverLetterPrompt = getCoverLetterPrompt(
    tailoringResult.tailoredResume,
    jobDescription,
    jobTitle,
    companyName
  );
  const coverLetterText = await ai.generateText(coverLetterPrompt);

  // Save tailored resume + tailoring metadata into the database
  const tailoredResume = await resumeDal.createTailoredResume(
    userId,
    baseResume,
    tailoringResult,
    coverLetterText,
    jobTitle,
    companyName,
    jobDescription
  );

  return {
    resume: tailoredResume,
    atsScore: tailoringResult.atsScore,
    keywordsMatched: tailoringResult.keywordsMatched,
    keywordsMissing: tailoringResult.keywordsMissing,
    coverLetterText,
  };
}
