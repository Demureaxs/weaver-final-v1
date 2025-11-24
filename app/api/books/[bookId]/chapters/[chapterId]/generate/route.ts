import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest, { params }: { params: Promise<{ bookId: string; chapterId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId, chapterId } = await params;

  try {
    // Verify book ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book || book.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get chapter
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter || chapter.bookId !== bookId) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const { includeCharacters, includeWorldItems, includePreviousChapter, includeNextChapter } = await req.json();

    // Build context
    let context = `Book: ${book.title} (${book.genre})
Story Arc: ${book.storyArc || 'Not specified'}
Tone: ${book.tone || 'Not specified'}
Setting: ${book.setting || 'Not specified'}

Current Chapter: ${chapter.title}
Chapter Arc: ${chapter.summary || 'Not specified'}
Target Word Count: ${chapter.targetWordCount || 1000}
`;

    // Add characters if requested
    if (includeCharacters && includeCharacters.length > 0) {
      const chars = await prisma.character.findMany({
        where: { id: { in: includeCharacters }, bookId },
      });
      if (chars.length > 0) {
        context += `\nCharacters:\n${chars.map((c) => `- ${c.name} (${c.role}): ${c.description}`).join('\n')}`;
      }
    }

    // Add world items if requested
    if (includeWorldItems && includeWorldItems.length > 0) {
      const items = await prisma.worldItem.findMany({
        where: { id: { in: includeWorldItems }, bookId },
      });
      if (items.length > 0) {
        context += `\nWorld Elements:\n${items.map((i) => `- ${i.name} (${i.category}): ${i.description}`).join('\n')}`;
      }
    }

    // Add previous chapter if requested
    if (includePreviousChapter) {
      const prevChapter = await prisma.chapter.findFirst({
        where: { bookId, order: { lt: chapter.order } },
        orderBy: { order: 'desc' },
      });
      if (prevChapter) {
        context += `\n\nPrevious Chapter: ${prevChapter.title}
Previous Chapter Summary: ${prevChapter.summary || 'Not specified'}`;
      }
    }

    // Add next chapter if requested
    if (includeNextChapter) {
      const nextChapter = await prisma.chapter.findFirst({
        where: { bookId, order: { gt: chapter.order } },
        orderBy: { order: 'asc' },
      });
      if (nextChapter) {
        context += `\n\nNext Chapter: ${nextChapter.title}
Next Chapter Summary: ${nextChapter.summary || 'Not specified'}`;
      }
    }

    // Generate content using AI
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `${context}

Write the full chapter content for "${chapter.title}" based on the chapter arc and context provided above.

Requirements:
- Target approximately ${chapter.targetWordCount || 1000} words
- Match the tone and setting of the book
- Follow the chapter arc closely
- Incorporate the characters and world elements naturally
- Create engaging, well-paced prose
- Use proper paragraph breaks for readability

Write ONLY the chapter content. Do not include the chapter title, chapter number, or any metadata. Just the story text.`;

    const response = await model.generateContent(prompt);

    const generatedContent = response.response.text().trim();

    // Calculate actual word count
    const actualWordCount = generatedContent.split(/\s+/).filter((w) => w.length > 0).length;

    // Update chapter with generated content
    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        content: generatedContent,
        actualWordCount,
      },
    });

    return NextResponse.json({
      chapter: updatedChapter,
      wordCount: actualWordCount,
    });
  } catch (error) {
    console.error('Failed to generate chapter content:', error);
    return NextResponse.json({ error: 'Failed to generate chapter content' }, { status: 500 });
  }
}
