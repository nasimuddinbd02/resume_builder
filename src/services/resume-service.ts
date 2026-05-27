import * as resumeDal from '@/data-access/resume';
import { extractResumeText } from '@/lib/parse-resume';
import { getAIProvider } from '@/lib/ai/ai-provider';
import {
  getParseResumePrompt,
  getTailorResumePrompt,
  getCoverLetterPrompt,
} from '@/lib/prompts';
import { ResumeData, TailoringResult } from '@/types/resume';

// Helper to map DB resume format (which stores arrays as JSON strings in SQLite) to typed ResumeData
function resumeToData(resume: any): ResumeData {
  return {
    fullName: resume.fullName,
    email: resume.email,
    phone: resume.phone,
    location: resume.location,
    website: resume.website,
    linkedin: resume.linkedin,
    github: resume.github,
    summary: resume.summary,
    experiences: (resume.experiences || []).map((exp: any) => ({
      jobTitle: exp.jobTitle,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent,
      achievements: typeof exp.achievements === 'string'
        ? JSON.parse(exp.achievements || '[]')
        : exp.achievements,
      sortOrder: exp.sortOrder,
    })),
    education: (resume.education || []).map((edu: any) => ({
      school: edu.school,
      degree: edu.degree,
      field: edu.field,
      location: edu.location,
      startDate: edu.startDate,
      endDate: edu.endDate,
      gpa: edu.gpa,
      sortOrder: edu.sortOrder,
    })),
    skills: (resume.skills || []).map((s: any) => ({ name: s.name, category: s.category })),
    projects: (resume.projects || []).map((p: any) => ({
      name: p.name,
      description: p.description,
      technologies: typeof p.technologies === 'string'
        ? JSON.parse(p.technologies || '[]')
        : p.technologies,
      link: p.link,
      sortOrder: p.sortOrder,
    })),
  };
}

export async function listResumes(userId: string) {
  return resumeDal.getUserResumes(userId);
}

export async function getResume(id: string, userId: string) {
  const resume = await resumeDal.getResumeById(id, userId);
  if (!resume) return null;
  return resume;
}

export async function createResume(userId: string, data: any) {
  return resumeDal.createResume(userId, data);
}

export async function updateResume(id: string, userId: string, data: any) {
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
