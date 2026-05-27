import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseResumeFile } from '@/services/resume-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const result = await parseResumeFile(file);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Resume parsing error:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse resume';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
