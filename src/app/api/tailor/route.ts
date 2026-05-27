import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Tailoring error:', error);
    const message = error instanceof Error ? error.message : 'Failed to tailor resume';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
