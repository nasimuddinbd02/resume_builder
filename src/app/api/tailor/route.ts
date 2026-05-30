import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tailorResume } from '@/services/resume-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId, jobTitle, companyName, jobDescription } = body;

    if (!resumeId || !jobTitle || !companyName || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields: resumeId, jobTitle, companyName, jobDescription' },
        { status: 400 }
      );
    }

    const result = await tailorResume(
      session.user.id,
      resumeId,
      jobTitle,
      companyName,
      jobDescription
    );

    // Automatically create a job application entry from the tailoring data
    try {
      await prisma.jobApplication.create({
        data: {
          userId: session.user.id,
          title: jobTitle,
          company: companyName,
          status: 'Applied',
          resumeId: result.resume?.id || null,
          notes: `Auto-tracked from resume tailoring. ATS Score: ${result.atsScore ?? 'N/A'}%`,
        },
      });
    } catch (appError) {
      // Log but don't fail the tailoring response if application creation fails
      console.error('[AUTO_APPLICATION_ERROR]', appError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Tailoring error:', error);
    const message = error instanceof Error ? error.message : 'Failed to tailor resume';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
