import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getResume, updateResume, deleteResume } from '@/services/resume-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const resume = await getResume(id, session.user.id);

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await getResume(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const resume = await updateResume(id, session.user.id, body);
    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await getResume(id, session.user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    await deleteResume(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
