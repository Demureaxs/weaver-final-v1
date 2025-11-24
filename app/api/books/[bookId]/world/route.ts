import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId } = await params;

  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    const worldItem = await prisma.worldItem.create({
      data: {
        ...data,
        bookId,
      },
    });
    return NextResponse.json(worldItem);
  } catch (error) {
    console.error('Failed to create world item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId } = await params;

  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'World Item ID required' }, { status: 400 });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const worldItem = await prisma.worldItem.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(worldItem);
  } catch (error) {
    console.error('Failed to update world item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId } = await params;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'World Item ID required' }, { status: 400 });

  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.worldItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete world item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
