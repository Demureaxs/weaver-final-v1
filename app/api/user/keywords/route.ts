import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { keywords } = await req.json();
    if (!Array.isArray(keywords)) {
      return NextResponse.json({ error: 'Keywords must be an array' }, { status: 400 });
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.userId },
      data: { keywords },
    });

    return NextResponse.json({ success: true, keywords: updatedProfile.keywords });
  } catch (error) {
    console.error('Failed to update keywords:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
