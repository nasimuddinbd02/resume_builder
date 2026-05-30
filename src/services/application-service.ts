import {
  getApplicationsByUserId,
  getApplicationByIdAndUserId,
  createApplication,
  updateApplication,
  deleteApplication
} from '@/data-access/application';
import { Prisma } from '@prisma/client';

export async function fetchUserApplications(userId: string) {
  return getApplicationsByUserId(userId);
}

export async function fetchUserApplication(id: string, userId: string) {
  return getApplicationByIdAndUserId(id, userId);
}

export async function addJobApplication(userId: string, data: {
  title: string;
  company: string;
  link?: string;
  status?: string;
  notes?: string;
  resumeId?: string;
}) {
  return createApplication({
    user: { connect: { id: userId } },
    title: data.title,
    company: data.company,
    link: data.link,
    status: data.status || 'Applied',
    notes: data.notes,
    resume: data.resumeId ? { connect: { id: data.resumeId } } : undefined,
  });
}

export async function modifyJobApplication(id: string, userId: string, data: {
  title?: string;
  company?: string;
  link?: string;
  status?: string;
  notes?: string;
  resumeId?: string | null;
}) {
  const updateData: Prisma.JobApplicationUpdateInput = {
    ...(data.title && { title: data.title }),
    ...(data.company && { company: data.company }),
    ...(data.link !== undefined && { link: data.link ?? undefined }),
    ...(data.status && { status: data.status }),
    ...(data.notes !== undefined && { notes: data.notes ?? undefined }),
    ...(data.resumeId !== undefined && {
      resume: data.resumeId ? { connect: { id: data.resumeId } } : { disconnect: true },
    }),
  };

  return updateApplication(id, userId, updateData);
}

export async function removeJobApplication(id: string, userId: string) {
  return deleteApplication(id, userId);
}
