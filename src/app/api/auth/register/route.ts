import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerUser } from '@/services/user-service';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    const user = await registerUser(name, email, password);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    const message = error instanceof Error ? error.message : 'Internal server error';
    const isConflict = message.includes('already exists');
    
    return NextResponse.json(
      { error: message },
      { status: isConflict ? 409 : 500 }
    );
  }
}
