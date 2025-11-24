import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { url, links } = await req.json();

    // Check if sitemap already exists
    const existing = await prisma.sitemap.findUnique({ where: { userId: session.userId } });
    if (existing) {
      return NextResponse.json({ error: 'Sitemap already exists. Use PUT to update.' }, { status: 409 });
    }

    const sitemap = await prisma.sitemap.create({
      data: {
        userId: session.userId,
        url,
        links: {
          create: links.map((l: any) => ({
            url: l.url,
            text: l.text || l.url,
            lastMod: l.lastMod,
          })),
        },
      },
      include: { links: true },
    });

    return NextResponse.json(sitemap);
  } catch (error) {
    console.error('Failed to create sitemap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { url, links } = await req.json();

    const existing = await prisma.sitemap.findUnique({ where: { userId: session.userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Sitemap not found. Use POST to create.' }, { status: 404 });
    }

    // Update sitemap URL and replace links
    // Transaction: Delete old links, update sitemap, create new links
    const [updatedSitemap] = await prisma.$transaction([
      prisma.sitemap.update({
        where: { id: existing.id },
        data: {
          url,
          links: {
            deleteMany: {},
            create: links.map((l: any) => ({
              url: l.url,
              text: l.text || l.url,
              lastMod: l.lastMod,
            })),
          },
        },
        include: { links: true },
      }),
    ]);

    return NextResponse.json(updatedSitemap);
  } catch (error) {
    console.error('Failed to update sitemap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
