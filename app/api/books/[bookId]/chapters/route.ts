import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId } = await params;

  try {
    // Verify book ownership
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Failed to fetch chapters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId } = await params;

  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, order, targetWordCount } = await req.json();

    // Get max order if not provided
    let newOrder = order;
    if (newOrder === undefined) {
      const lastChapter = await prisma.chapter.findFirst({
        where: { bookId },
        orderBy: { order: 'desc' },
      });
      newOrder = (lastChapter?.order || 0) + 1;
    }

    // Calculate word count for initial content
    const actualWordCount = content
      ? content
          .trim()
          .split(/\s+/)
          .filter((w: string) => w.length > 0).length
      : 0;

    const chapter = await prisma.chapter.create({
      data: {
        title: title || 'New Chapter',
        content: content || '',
        order: newOrder,
        targetWordCount: targetWordCount || 1000,
        actualWordCount,
        bookId,
      },
    });
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Failed to create chapter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId } = await params;

  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'Chapter ID required' }, { status: 400 });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate word count if content is being updated
    if (updates.content) {
      const wordCount = updates.content
        .trim()
        .split(/\s+/)
        .filter((w: string) => w.length > 0).length;
      updates.actualWordCount = wordCount;
    }

    const chapter = await prisma.chapter.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Failed to update chapter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId } = await params;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Chapter ID required' }, { status: 400 });

  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.chapter.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete chapter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
