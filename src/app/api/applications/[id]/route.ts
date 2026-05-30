// src/app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Schema for updating a job application
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  link: z.string().url().optional().nullable(),
  status: z.enum(['Applied', 'Interview Scheduled', 'Interview', 'Offer', 'Rejected', 'Withdrawn']).optional(),
  notes: z.string().optional().nullable(),
  resumeId: z.string().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const application = await prisma.jobApplication.findUnique({
    where: { id, userId: session.user.id },
  });
  if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(application);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const updated = await prisma.jobApplication.update({
      where: { id, userId: session.user.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.company && { company: data.company }),
        ...(data.link !== undefined && { link: data.link ?? undefined }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes ?? undefined }),
        ...(data.resumeId !== undefined && {
          resume: data.resumeId ? { connect: { id: data.resumeId } } : { disconnect: true },
        }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Update job application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await prisma.jobApplication.delete({
      where: { id, userId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
