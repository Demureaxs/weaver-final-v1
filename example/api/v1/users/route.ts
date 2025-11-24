import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET handler to fetch user details
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, avatarUrl } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        email,
        avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        profile: true,
      },
    });

    if (avatarUrl !== undefined && updatedUser.profile) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { avatarUrl },
      });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error handling PUT /api/v1/users:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

