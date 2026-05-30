// src/app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchUserApplication, modifyJobApplication, removeJobApplication } from '@/services/application-service';
import { z } from 'zod';

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

  const application = await fetchUserApplication(id, session.user.id);
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
    const updated = await modifyJobApplication(id, session.user.id, {
      title: data.title,
      company: data.company,
      link: data.link || undefined,
      status: data.status,
      notes: data.notes || undefined,
      resumeId: data.resumeId || undefined,
    });
    return NextResponse.json(updated);
    } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
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
    await removeJobApplication(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
