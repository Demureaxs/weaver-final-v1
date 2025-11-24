import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ success: false, message: 'No active session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        articles: {
          orderBy: { updatedAt: 'desc' },
        },
        books: {
          include: {
            chapters: true,
            characters: true,
            worldBible: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        sitemap: {
          include: {
            links: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user as any;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Get User API error:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
