import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ success: false, user: null, message: 'No active session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true, // Include the related Profile object
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, user: null, message: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword, message: 'Session retrieved successfully' });

  } catch (error) {
    console.error('Get Session API error:', error);
    return NextResponse.json({ success: false, user: null, message: 'An internal server error occurred.' }, { status: 500 });
  }
}