import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: NextRequest, { params }: { params: Promise<{ bookId: string; chapterId: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, chapterId } = await params;

    // 1. Fetch Chapter & User Profile (for credits)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const COST = 5; // Cost for polishing a full chapter
    if (user.profile.credits < COST) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId, bookId }, // Ensure chapter belongs to book
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    if (!chapter.content.trim()) {
      return NextResponse.json({ error: 'Chapter is empty' }, { status: 400 });
    }

    // 2. Construct Prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a professional book editor. Your task is to "polish" the following chapter content.
      
      GOAL:
      - Improve flow and coherence between paragraphs.
      - Fix any disjointed transitions caused by individual paragraph editing.
      - Maintain the original plot, characters, and tone.
      - Enhance the prose quality (show, don't tell).
      - Do NOT change the core story events.
      
      INPUT CONTENT:
      "${chapter.content}"
      
      OUTPUT:
      Return ONLY the polished content. Do not include any conversational filler or markdown code blocks.
    `;

    console.log('--- CHAPTER POLISH PROMPT ---', prompt);

    // 3. Call AI
    const result = await model.generateContent(prompt);
    const polishedContent = result.response.text();

    if (!polishedContent) {
      throw new Error('AI returned empty content');
    }

    // 4. Update DB & Deduct Credits
    const [updatedChapter, updatedProfile] = await prisma.$transaction([
      prisma.chapter.update({
        where: { id: chapterId },
        data: { content: polishedContent },
      }),
      prisma.profile.update({
        where: { userId: session.userId },
        data: { credits: { decrement: COST } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      chapter: updatedChapter,
      credits: updatedProfile.credits,
    });
  } catch (error: any) {
    console.error('Error polishing chapter:', error);
    return NextResponse.json({ error: 'Failed to polish chapter', details: error.message }, { status: 500 });
  }
}
