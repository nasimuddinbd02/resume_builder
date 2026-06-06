import { prisma } from '@/lib/prisma';
import { ResumeData, ExperienceData, EducationData, SkillData, ProjectData, TailoringResult } from '@/types/resume';

export async function getUserResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    include: {
      experiences: { orderBy: { sortOrder: 'asc' } },
      education: { orderBy: { sortOrder: 'asc' } },
      skills: true,
      projects: { orderBy: { sortOrder: 'asc' } },
      tailoring: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getResumeById(id: string, userId: string) {
  return prisma.resume.findFirst({
    where: { id, userId },
    include: {
      experiences: { orderBy: { sortOrder: 'asc' } },
      education: { orderBy: { sortOrder: 'asc' } },
      skills: true,
      projects: { orderBy: { sortOrder: 'asc' } },
      tailoring: true,
    },
  });
}

export async function createResume(userId: string, data: Partial<ResumeData>) {
  return prisma.resume.create({
    data: {
      userId,
      title: data.title || 'Untitled Resume',
      isBase: data.isBase ?? true,
      template: data.template ?? 'modern',
      fullName: data.fullName || '',
      email: data.email || '',
      phone: data.phone,
      location: data.location,
      website: data.website,
      linkedin: data.linkedin,
      github: data.github,
      summary: data.summary,
      experiences: {
        create: (data.experiences || []).map((exp: ExperienceData, i: number) => ({
          jobTitle: exp.jobTitle || "",
          company: exp.company || "",
          location: exp.location,
          startDate: exp.startDate || "",
          endDate: exp.endDate,
          isCurrent: exp.isCurrent || false,
          achievements: JSON.stringify(exp.achievements || []),
          sortOrder: exp.sortOrder ?? i,
        })),
      },
      education: {
        create: (data.education || []).map((edu: EducationData, i: number) => ({
          school: edu.school || "",
          degree: edu.degree || "",
          field: edu.field,
          location: edu.location,
          startDate: edu.startDate,
          endDate: edu.endDate || "",
          gpa: edu.gpa,
          sortOrder: edu.sortOrder ?? i,
        })),
      },
      skills: {
        create: (data.skills || []).map((s: SkillData) => ({
          name: s.name || "",
          category: s.category,
        })),
      },
      projects: {
        create: (data.projects || []).map((proj: ProjectData, i: number) => ({
          name: proj.name || "",
          description: proj.description || "",
          technologies: JSON.stringify(proj.technologies || []),
          link: proj.link,
          sortOrder: proj.sortOrder ?? i,
        })),
      },
    },
    include: {
      experiences: true,
      education: true,
      skills: true,
      projects: true,
    },
  });
}

export async function updateResume(id: string, userId: string, data: Partial<ResumeData>) {
  // Delete existing child records and recreate inside a transaction
  await prisma.$transaction([
    prisma.workExperience.deleteMany({ where: { resumeId: id } }),
    prisma.education.deleteMany({ where: { resumeId: id } }),
    prisma.skill.deleteMany({ where: { resumeId: id } }),
    prisma.project.deleteMany({ where: { resumeId: id } }),
  ]);

  return prisma.resume.update({
    where: { id },
    data: {
      title: data.title || undefined,
      template: data.template || undefined,
      fullName: data.fullName || undefined,
      email: data.email || undefined,
      phone: data.phone,
      location: data.location,
      website: data.website,
      linkedin: data.linkedin,
      github: data.github,
      summary: data.summary,
      experiences: {
        create: (data.experiences || []).map((exp: ExperienceData, i: number) => ({
          jobTitle: exp.jobTitle || "",
          company: exp.company || "",
          location: exp.location,
          startDate: exp.startDate || "",
          endDate: exp.endDate,
          isCurrent: exp.isCurrent || false,
          achievements: JSON.stringify(exp.achievements || []),
          sortOrder: exp.sortOrder ?? i,
        })),
      },
      education: {
        create: (data.education || []).map((edu: EducationData, i: number) => ({
          school: edu.school || "",
          degree: edu.degree || "",
          field: edu.field,
          location: edu.location,
          startDate: edu.startDate,
          endDate: edu.endDate || "",
          gpa: edu.gpa,
          sortOrder: edu.sortOrder ?? i,
        })),
      },
      skills: {
        create: (data.skills || []).map((skill: SkillData) => ({
          name: skill.name || "",
          category: skill.category,
        })),
      },
      projects: {
        create: (data.projects || []).map((proj: ProjectData, i: number) => ({
          name: proj.name || "",
          description: proj.description || "",
          technologies: JSON.stringify(proj.technologies || []),
          link: proj.link,
          sortOrder: proj.sortOrder ?? i,
        })),
      },
    },
    include: {
      experiences: true,
      education: true,
      skills: true,
      projects: true,
    },
  });
}

export async function deleteResume(id: string, userId: string) {
  return prisma.resume.delete({
    where: { id },
  });
}

export async function createTailoredResume(
  userId: string,
  baseResume: any,
  tailoringResult: TailoringResult,
  coverLetterText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string
) {
  return prisma.resume.create({
    data: {
      userId,
      title: `Tailored for ${companyName} - ${jobTitle}`,
      isBase: false,
      template: baseResume.template,
      fullName: tailoringResult.tailoredResume.fullName,
      email: tailoringResult.tailoredResume.email,
      phone: tailoringResult.tailoredResume.phone,
      location: tailoringResult.tailoredResume.location,
      website: tailoringResult.tailoredResume.website,
      linkedin: tailoringResult.tailoredResume.linkedin,
      github: tailoringResult.tailoredResume.github,
      summary: tailoringResult.tailoredResume.summary,
      experiences: {
        create: (tailoringResult.tailoredResume.experiences || []).map((exp: ExperienceData, i: number) => ({
          jobTitle: exp.jobTitle || "",
          company: exp.company || "",
          location: exp.location,
          startDate: exp.startDate || "",
          endDate: exp.endDate,
          isCurrent: exp.isCurrent || false,
          achievements: JSON.stringify(exp.achievements || []),
          sortOrder: i,
        })),
      },
      education: {
        create: (tailoringResult.tailoredResume.education || []).map((edu: EducationData, i: number) => ({
          school: edu.school || "",
          degree: edu.degree || "",
          field: edu.field,
          location: edu.location,
          startDate: edu.startDate,
          endDate: edu.endDate || "",
          gpa: edu.gpa,
          sortOrder: i,
        })),
      },
      skills: {
        create: (tailoringResult.tailoredResume.skills || []).map((s: SkillData) => ({
          name: s.name || "",
          category: s.category,
        })),
      },
      projects: {
        create: (tailoringResult.tailoredResume.projects || []).map((p: ProjectData, i: number) => ({
          name: p.name || "",
          description: p.description || "",
          technologies: JSON.stringify(p.technologies || []),
          link: p.link,
          sortOrder: i,
        })),
      },
      tailoring: {
        create: {
          jobTitle,
          companyName,
          jobDescription,
          atsScore: (() => {
            if (typeof tailoringResult.atsScore === 'number') return tailoringResult.atsScore;
            if (typeof tailoringResult.atsScore === 'string') {
              const parsed = parseInt(tailoringResult.atsScore, 10);
              return isNaN(parsed) ? null : parsed;
            }
            return null;
          })(),
          coverLetterText,
          keywordsMatched: JSON.stringify(tailoringResult.keywordsMatched || []),
        },
      },
    },
    include: {
      experiences: true,
      education: true,
      skills: true,
      projects: true,
      tailoring: true,
    },
  });
}
