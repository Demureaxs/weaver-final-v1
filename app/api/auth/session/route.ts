import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ success: false, user: null, message: 'No active session' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, user: null, message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user as any;
    return NextResponse.json({ success: true, isLoggedIn: true, user: userWithoutPassword, message: 'Session retrieved successfully' });
  } catch (error) {
    console.error('Get Session API error:', error);
    return NextResponse.json({ success: false, user: null, message: 'An internal server error occurred.' });
  }
}
