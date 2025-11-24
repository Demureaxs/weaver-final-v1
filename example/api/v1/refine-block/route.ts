import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Profile } from '@prisma/client';

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'YOUR_API_KEY');

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ message: 'No active session' }, { status: 401 });
    }

    const { blockContent, refinementType } = await req.json();

    if (!blockContent || !refinementType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // --Credit Deduction Logic--

    let updatedProfile: Profile;
    try {
      const userProfile = await prisma.profile.findUnique({
        where: { userId: session.userId },
      });

      if (!userProfile) {
        return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
      }

      if (userProfile.credits < 2) {
        return NextResponse.json({ message: 'Insufficient credits' }, { status: 403 });
      }

      updatedProfile = await prisma.profile.update({
        where: { userId: session.userId },
        data: { credits: { decrement: 2 } },
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ message: 'Error fetching user profile' }, { status: 500 });
    }
    // --- End Credit Deduction Logic ---

    // -- Refinement Logic --
    const prompt = `                                                                                                    
          Based on the following instruction, please refine the text provided.                                              
          Instruction: "${refinementType}"                                                                                
          Text to refine: "${blockContent}"                                                                                 
                                                                                                                            
          Return only the refined text, without any additional commentary or markdown.                                      
        `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        // Stream the AI-generated content
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }

        // After the stream is done, send the updated credit count
        const stats = { newCredits: updatedProfile.credits };
        controller.enqueue(new TextEncoder().encode(`\n\n--STATS--\n${JSON.stringify(stats)}`));

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in refine-block route:', error);
    return NextResponse.json({ message: 'Error refining block' }, { status: 500 });
  }
}
