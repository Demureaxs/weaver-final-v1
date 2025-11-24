import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import fs from 'fs/promises';
import path from 'path';

// POST handler to prepare a download for a user's data
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId } = await request.json();
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId, userId: session.userId },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Sanitize the title to create a safe filename
    const sanitizedTitle = (article.title || 'untitled-article')
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]+/g, ''); // Remove all non-word chars except hyphens

    const filename = `${sanitizedTitle}.md`;
    const dirPath = path.join(process.cwd(), 'public', 'articles');
    const filePath = path.join(dirPath, filename);

    // Ensure the directory exists
    await fs.mkdir(dirPath, { recursive: true });

    // Write the article content to the file
    await fs.writeFile(filePath, article.content);

    // Return the URL and the filename for the cleanup job
    return NextResponse.json({ url: `/articles/${filename}`, filename: filename });
  } catch (error) {
    console.error('Error handling POST /api/v1/prepare-download:', error);
    return NextResponse.json({ error: 'Error preparing download' }, { status: 500 });
  }
}
