import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const books = await prisma.book.findMany({
      where: { userId: session.userId },
      include: {
        chapters: { orderBy: { order: 'asc' } },
        characters: true,
        worldBible: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error('Failed to fetch books:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, genre, summary } = await req.json();
    const book = await prisma.book.create({
      data: {
        title: title || 'Untitled Book',
        genre: genre || 'General',
        summary: summary || '',
        userId: session.userId,
      },
      include: {
        chapters: true,
        characters: true,
        worldBible: true,
      },
    });
    return NextResponse.json(book);
  } catch (error) {
    console.error('Failed to create book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'Book ID required' }, { status: 400 });

    // Verify ownership
    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook || existingBook.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const book = await prisma.book.update({
      where: { id },
      data: updates,
      include: {
        chapters: true,
        characters: true,
        worldBible: true,
      },
    });
    return NextResponse.json(book);
  } catch (error) {
    console.error('Failed to update book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Book ID required' }, { status: 400 });

  try {
    // Verify ownership
    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook || existingBook.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
