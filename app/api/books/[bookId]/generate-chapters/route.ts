import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId } = await params;

  try {
    // Verify book ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book || book.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { chapterCount, averageWordCount } = await req.json();

    if (!chapterCount || chapterCount < 1 || chapterCount > 50) {
      return NextResponse.json({ error: 'Chapter count must be between 1 and 50' }, { status: 400 });
    }

    // Use AI to generate chapter outlines
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Generate ${chapterCount} chapter outlines for a ${book.genre} book titled "${book.title}".

Story Arc: ${book.storyArc || 'Not specified'}
Book Summary: ${book.summary}

For each chapter, provide:
1. A compelling chapter title
2. A chapter arc (2-3 sentence summary of what happens in this chapter)

Return ONLY a JSON array in this exact format:
[{ "title": "Chapter Title", "summary": "Chapter arc description" }]

Do not include any markdown formatting, code blocks, or additional text. Just the raw JSON array.`;

    const response = await model.generateContent(prompt);

    const text = response.response.text().trim();
    console.log('--- AI RESPONSE FOR CHAPTER GENERATION ---', text);

    // Remove markdown code blocks if present
    let jsonText = text;
    if (text.startsWith('```')) {
      jsonText = text
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();
    }

    console.log('--- CLEANED JSON TEXT ---', jsonText);

    let chapterOutlines;
    try {
      chapterOutlines = JSON.parse(jsonText);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed to parse text:', jsonText);
      return NextResponse.json(
        {
          error: 'AI returned invalid JSON format',
          details: `Parse error: ${parseError.message}`,
          rawResponse: text.substring(0, 200),
        },
        { status: 500 }
      );
    }

    // Get the current max order
    const lastChapter = await prisma.chapter.findFirst({
      where: { bookId },
      orderBy: { order: 'desc' },
    });
    const startOrder = (lastChapter?.order || 0) + 1;

    // Create chapters in database
    const createdChapters = await Promise.all(
      chapterOutlines.map((outline: { title: string; summary: string }, index: number) =>
        prisma.chapter.create({
          data: {
            title: outline.title,
            summary: outline.summary,
            content: '',
            order: startOrder + index,
            targetWordCount: averageWordCount || 1000,
            actualWordCount: 0,
            bookId,
          },
        })
      )
    );

    return NextResponse.json({ chapters: createdChapters });
  } catch (error) {
    console.error('Failed to generate chapters:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate chapters', details: errorMessage }, { status: 500 });
  }
}
