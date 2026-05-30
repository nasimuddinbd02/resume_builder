import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getApplicationsByUserId(userId: string) {
  return prisma.jobApplication.findMany({
    where: { userId },
    orderBy: { appliedAt: 'desc' },
  });
}

export async function getApplicationByIdAndUserId(id: string, userId: string) {
  return prisma.jobApplication.findUnique({
    where: { id, userId },
  });
}

export async function createApplication(data: Prisma.JobApplicationCreateInput) {
  return prisma.jobApplication.create({
    data,
  });
}

export async function updateApplication(id: string, userId: string, data: Prisma.JobApplicationUpdateInput) {
  return prisma.jobApplication.update({
    where: { id, userId },
    data,
  });
}

export async function deleteApplication(id: string, userId: string) {
  return prisma.jobApplication.delete({
    where: { id, userId },
  });
}
