import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { amount, type } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (type !== 'deduct' && type !== 'add') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const userProfile = await prisma.profile.findUnique({ where: { userId: session.userId } });
    if (!userProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    if (type === 'deduct' && userProfile.credits < amount) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.userId },
      data: {
        credits: type === 'deduct' ? { decrement: amount } : { increment: amount },
      },
    });

    return NextResponse.json({ success: true, credits: updatedProfile.credits });
  } catch (error) {
    console.error('Failed to update credits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
