import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data,
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function updateUserById(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  return prisma.user.findUnique({
    where: { stripeCustomerId },
  });
}

export async function updateStripeSubscription(stripeSubscriptionId: string, data: Prisma.UserUpdateInput) {
  return prisma.user.updateMany({
    where: { stripeSubscriptionId },
    data,
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
