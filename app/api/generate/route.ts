import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { User, Profile, Sitemap } from '@prisma/client';

// Define a type for User with its Profile relation for type safety
type UserWithProfile = User & { profile: Profile | null };
type SiteMapWithServices = Sitemap & { links: { text: string; url: string }[] };

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'YOUR_API_KEY');

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { keyword, sectionCount, minWordsPerSection, includeFaq, includeImage, bodyImageCount } = body;
  const tone = 'Conversational';
  const language = 'English';
  const serpAnalysis = false;
  const internalLinking = true;
  const externalLinking = true;

  let currentUserId: string;
  let userProfile: Profile;
  let userSitemap: SiteMapWithServices | null = null;

  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'No active session' }, { status: 401 });
    }
    currentUserId = session.userId;

    const currentUser: UserWithProfile | null = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }
    if (currentUser.profile.credits < 5) {
      return NextResponse.json({ message: 'Insufficient credits' }, { status: 403 });
    }
    userProfile = currentUser.profile;

    if (internalLinking) {
      userSitemap = await prisma.sitemap.findUnique({
        where: { userId: currentUserId },
        include: { links: true },
      });
    }
  } catch (error) {
    console.error('Error during initial user/sitemap check:', error);
    return NextResponse.json({ message: 'Error processing user data or sitemap' }, { status: 500 });
  }

  let prompt = `
    As an expert SEO content writer, please generate a comprehensive, engaging, and plagiarism-free article based on the following parameters.
    Your response should be in markdown format.

    **Primary Keyword:** "${keyword}"

    **Article Structure:**
    - Response should only include the article content, without any preamble or explanations.
    - The article should be well-structured with a clear introduction, body, and conclusion.
    - It must contain exactly ${sectionCount} sections, each with a relevant heading and aim for at least ${minWordsPerSection} words per section.
    - The tone of the article should be ${tone}.
    - The article should feature images that match the text for the sections you decide to include images for, these images must be sourced from the web and be valid links (include full href).
    - Refrain from use of em dashes; use commas or parentheses instead.
    - Avoid buzzwords and jargon; write in a clear and accessible manner.
    - The language of the article must be ${language}.

    **Content Requirements:**
    - The primary keyword, "${keyword}", should be naturally integrated throughout the article, including in headings where appropriate.
    - The content must be informative, accurate, and provide real value to the reader.
    - Ensure the article is easy to read and flows logically from one section to the next.
    - The article must feature a conclusion or summary that encapsulates the main points discussed.
`;

  if (internalLinking && userSitemap) {
    prompt += `
    **Internal Linking:**
    - Where relevant, please include internal links to the following pages from our sitemap.
    - Do not force links; they should only be included if they provide value to the reader and are contextually appropriate.
    - Here are the available pages for internal linking:
      ${userSitemap.links.map((service) => `- [${service.text}](${service.url})`).join('\n      ')}
`;
  }

  if (externalLinking) {
    prompt += `
    **External Linking:**
    - Include links to authoritative external sources to back up any claims or data presented in the article.
    - Ensure that external links use appropriate anchor text.
`;
  }

  prompt += `
    **Advanced Options:**
    - **SERP Analysis:** ${
      serpAnalysis
        ? 'Please analyze the top-ranking articles for the keyword and include similar topics and entities to improve our ranking potential.'
        : 'No SERP analysis required.'
    }
    - **FAQ Section:** ${
      includeFaq
        ? 'Please include a FAQ section at the end of the article that answers common questions related to the keyword.'
        : 'No FAQ section required.'
    }

    Please begin the article now.
  `;

  console.log('--- ARTICLE GENERATION PROMPT ---', prompt);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        let fullArticleText = '';
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullArticleText += chunkText;
          controller.enqueue(new TextEncoder().encode(chunkText));
        }

        if (fullArticleText) {
          try {
            const [updatedProfile, newArticle] = await prisma.$transaction([
              prisma.profile.update({
                where: { userId: currentUserId },
                data: { credits: { decrement: 5 } },
              }),
              prisma.article.create({
                data: {
                  title: keyword || 'Untitled Article',
                  content: fullArticleText,
                  userId: currentUserId,
                  snippet: fullArticleText.substring(0, 100) + '...',
                  status: 'Draft',
                },
              }),
            ]);

            const finalStats = {
              newCredits: updatedProfile.credits,
              newArticleId: newArticle.id,
            };

            controller.enqueue(new TextEncoder().encode(`\n\n--STATS--\n${JSON.stringify(finalStats)}`));
          } catch (dbError) {
            console.error('Database operation failed:', dbError);
            controller.enqueue(new TextEncoder().encode('\n\n--ERROR--\nFailed to save article and update stats. You have not been charged.'));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error generating content from AI model:', error);
    return NextResponse.json({ message: 'Failed to generate content from AI model', error: error.message }, { status: 500 });
  }
}
