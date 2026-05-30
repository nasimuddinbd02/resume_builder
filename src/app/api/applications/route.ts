// src/app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Schema for creating a job application
const createSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  link: z.string().url().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  resumeId: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applications = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    orderBy: { appliedAt: 'desc' },
  });
  return NextResponse.json(applications);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const newApp = await prisma.jobApplication.create({
      data: {
        userId: session.user.id,
        title: data.title,
        company: data.company,
        link: data.link ?? undefined,
        status: data.status || 'Applied',
        notes: data.notes ?? undefined,
        resumeId: data.resumeId ?? undefined,
      },
    });
    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Job application creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
