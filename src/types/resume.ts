export interface ExperienceData {
  id?: string;
  jobTitle: string;
  company: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  achievements: string[];
  sortOrder?: number;
}

export interface EducationData {
  id?: string;
  school: string;
  degree: string;
  field?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate: string;
  gpa?: string | null;
  sortOrder?: number;
}

export interface SkillData {
  id?: string;
  name: string;
  category?: string | null;
}

export interface ProjectData {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string | null;
  sortOrder?: number;
}

export interface ResumeData {
  id?: string;
  title?: string;
  isBase?: boolean;
  template?: string;
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  summary?: string | null;
  experiences: ExperienceData[];
  education: EducationData[];
  skills: SkillData[];
  projects: ProjectData[];
  tailoring?: TailoringJobData | null;
}

export interface TailoringResult {
  tailoredResume: ResumeData;
  atsScore: number;
  keywordsMatched: string[];
  keywordsMissing: string[];
}

export interface TailoringJobData {
  id?: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  atsScore?: number | null;
  coverLetterText?: string | null;
  keywordsMatched?: string | null;
  tailoredResumeId?: string;
}
