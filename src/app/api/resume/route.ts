import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { listResumes, createResume } from '@/services/resume-service';

const createResumeSchema = z.object({
  title: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  template: z.string().optional().default('modern'),
  isBase: z.boolean().optional().default(true),
  experiences: z.array(z.object({
    jobTitle: z.string(),
    company: z.string(),
    location: z.string().optional().nullable(),
    startDate: z.string(),
    endDate: z.string().optional().nullable(),
    isCurrent: z.boolean().default(false),
    achievements: z.array(z.string()).default([]),
    sortOrder: z.number().default(0),
  })).default([]),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    field: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string(),
    gpa: z.string().optional().nullable(),
    sortOrder: z.number().default(0),
  })).default([]),
  skills: z.array(z.object({
    name: z.string(),
    category: z.string().optional().nullable(),
  })).default([]),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).default([]),
    link: z.string().optional().nullable(),
    sortOrder: z.number().default(0),
  })).default([]),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await listResumes(session.user.id);
    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createResumeSchema.parse(body);

    const resume = await createResume(session.user.id, data);
    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
