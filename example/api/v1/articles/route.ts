import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const articleId = searchParams.get('id');

  try {
    if (articleId) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      return NextResponse.json(article, { status: 200 });
    }
    if (userId) {
      const articles = await prisma.article.findMany({
        where: { userId },
      });

      return NextResponse.json(articles, { status: 200 });
    }
    return NextResponse.json({ error: 'User ID or Article ID is required' }, { status: 400 });
  } catch (error) {
    console.error('Error handling GET /api/v1/articles:', error);
    return NextResponse.json({ error: 'Error fetching articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, filename } = await request.json();

    if (!title || !content || !filename) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newArticle = await prisma.article.create({
      data: {
        userId: session.userId,
        title,
        content,
        filename,
        status: 'completed',
      },
    });

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error('Error handling POST /api/v1/articles:', error);
    return NextResponse.json({ error: 'Error creating article' }, { status: 500 });
  }
}

// PUT handler to update an article
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, content, filename, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const articleToUpdate = await prisma.article.findFirst({
      where: { id, userId: session.userId },
    });

    if (!articleToUpdate) {
      return NextResponse.json({ error: 'Article not found or access denied' }, { status: 404 });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title: title ?? articleToUpdate.title,
        content: content ?? articleToUpdate.content,
        filename: filename ?? articleToUpdate.filename,
        status: status ?? articleToUpdate.status,
      },
    });

    console.log('Updated article:', updatedArticle);
    return NextResponse.json(updatedArticle, { status: 200 });
  } catch (error) {
    console.error('Error handling PUT /api/v1/articles:', error);
    return NextResponse.json({ error: 'Error updating article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const articleToDelete = await prisma.article.findFirst({
      where: { id, userId: session.userId },
    });

    if (!articleToDelete) {
      return NextResponse.json({ error: 'Article not found or access denied' }, { status: 404 });
    }

    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Article deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error handling DELETE /api/v1/articles:', error);
    return NextResponse.json({ error: 'Error deleting article' }, { status: 500 });
  }
}
