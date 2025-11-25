import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const REFINE_COST = 1; // Cost in credits for AI refinement

export async function POST(req: NextRequest) {
  // 1. Verify user session
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse request body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { prompt, content, context, previousContext, nextContext, characterContext } = body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  // 3. Check user credits
  const userProfile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });

  if (!userProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (userProfile.credits < REFINE_COST) {
    return NextResponse.json(
      { error: `Insufficient credits. You need ${REFINE_COST} but have ${userProfile.credits}.` },
      { status: 403 }
    );
  }

  // 4. Deduct credits BEFORE calling AI
  const updatedProfile = await prisma.profile.update({
    where: { userId: session.userId },
    data: { credits: { decrement: REFINE_COST } },
  });

  // 5. Call Google Generative AI
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      // Refund credits if API key is not configured
      await prisma.profile.update({
        where: { userId: session.userId },
        data: { credits: { increment: REFINE_COST } },
      });
      return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the prompt
    let fullPrompt = `Refine the following text based on this instruction: "${prompt}". 
    CRITICAL STYLE RULES: 
    1. Make it sound 100% human. 
    2. ABSOLUTELY NO em-dashes. 
    3. NO buzzwords. 
    Return only text.`;

    if (context) {
      fullPrompt += `\n\nSTORY CONTEXT (Use this to inform the style/content): \n${context}`;
    }

    if (previousContext) {
      fullPrompt += `\n\nPREVIOUS PARAGRAPH (Context): "${previousContext}"`;
    }

    if (nextContext) {
      fullPrompt += `\n\nNEXT PARAGRAPH (Context): "${nextContext}"`;
    }

    if (characterContext && typeof characterContext === 'string') {
      fullPrompt += `\n\nCHARACTERS PRESENT: ${characterContext}`;
    }

    fullPrompt += `\n\nText to refine: "${content}"`;

    const response = await model.generateContent(fullPrompt);
    const refinedText = response.response.text();

    if (!refinedText) {
      // Refund credits if AI returned empty response
      await prisma.profile.update({
        where: { userId: session.userId },
        data: { credits: { increment: REFINE_COST } },
      });
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 500 });
    }

    return NextResponse.json({
      refinedText: refinedText.trim(),
      credits: updatedProfile.credits,
    });
  } catch (error) {
    console.error('AI refinement failed:', error);
    // Refund credits on AI failure
    await prisma.profile.update({
      where: { userId: session.userId },
      data: { credits: { increment: REFINE_COST } },
    });
    return NextResponse.json({ error: 'AI refinement failed' }, { status: 500 });
  }
}
