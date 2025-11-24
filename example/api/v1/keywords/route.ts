import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ca } from 'zod/v4/locales';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keywords = await prisma.keyword.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(keywords, { status: 200 });
  } catch (error) {
    console.error('Error handling GET /api/v1/keywords:', error);
    return NextResponse.json({ error: 'Error fetching keywords' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let newKeywordStrings: string[] = [];

    if (body.keyword) {
      newKeywordStrings = [body.keyword];
    } else if (body.keywords && Array.isArray(body.keywords)) {
      newKeywordStrings = body.keywords;
    } else {
      return NextResponse.json({ error: 'No keywords provided' }, { status: 400 });
    }

    const createdKeywords = await Promise.all(
      newKeywordStrings.map(async (keywordStr) => {
        return await prisma.keyword.create({
          data: {
            userId: session.userId,
            text: keywordStr,
          },
        });
      })
    );

    return NextResponse.json(createdKeywords.length === 1 ? createdKeywords[0] : createdKeywords, { status: 201 });
  } catch (error) {
    console.error('Error handling POST /api/v1/keywords:', error);
    return NextResponse.json({ error: 'Error creating keyword' }, { status: 500 });
  }
}

// PUT handler to update a keyword
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, text } = await request.json();

    if (!id || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedKeyword = await prisma.keyword.updateMany({
      where: {
        id,
        userId: session.userId,
      },
      data: {
        text,
      },
    });

    if (updatedKeyword.count === 0) {
      return NextResponse.json({ error: 'Keyword not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Keyword updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error handling PUT /api/v1/keywords:', error);
    return NextResponse.json({ error: 'Error updating keyword' }, { status: 500 });
  }
}

// DELETE handler to delete a keyword
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Keyword ID is required' }, { status: 400 });
    }

    const deletedKeyword = await prisma.keyword.delete({
      where: {
        id,
        userId: session.userId,
      },
    });
    return NextResponse.json({ message: 'Keyword deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error handling DELETE /api/v1/keywords:', error);
    return NextResponse.json({ error: 'Error deleting keyword' }, { status: 500 });
  }
}
