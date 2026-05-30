// src/app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchUserApplications, addJobApplication } from '@/services/application-service';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['Applied', 'Interview Scheduled', 'Interview', 'Offer', 'Rejected', 'Withdrawn']).optional(),
  notes: z.string().optional(),
  resumeId: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const applications = await fetchUserApplications(session.user.id);
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Fetch job applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const newApp = await addJobApplication(session.user.id, {
      title: data.title,
      company: data.company,
      link: data.link || undefined,
      status: data.status,
      notes: data.notes,
      resumeId: data.resumeId,
    });

    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Create job application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
