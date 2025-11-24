import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;

    const userArticles = await prisma.article.findMany({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json(userArticles, { status: 200 });
  } catch (error) {
    console.error('Error fetching user articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.userId;

        const body = await request.json();
        const { title, content, snippet, status, metadata } = body;

        const newArticle = await prisma.article.create({
            data: {
                title,
                content,
                snippet,
                status,
                metadata,
                userId: userId,
            },
        });

        return NextResponse.json(newArticle, { status: 201 });
    } catch (error) {
        console.error('Error creating article:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.userId;

        const body = await request.json();
        const { id, ...data } = body;

        const updatedArticle = await prisma.article.updateMany({
            where: {
                id: id,
                userId: userId,
            },
            data: data,
        });

        if (updatedArticle.count === 0) {
            return NextResponse.json({ error: 'Article not found or user not authorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error updating article:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.userId;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
        }

        const deletedArticle = await prisma.article.deleteMany({
            where: {
                id: id,
                userId: userId,
            },
        });

        if (deletedArticle.count === 0) {
            return NextResponse.json({ error: 'Article not found or user not authorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting article:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}