import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET handler to fetch the sitemap for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (userId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const userSitemap = await prisma.sitemap.findUnique({
      where: { userId: session.userId },
      include: { services: true },
    });

    if (!userSitemap) {
      return NextResponse.json({ message: 'Sitemap not found' }, { status: 404 });
    }

    return NextResponse.json(userSitemap);
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return NextResponse.json({ message: 'Error fetching sitemap' }, { status: 500 });
  }
}

// POST handler to create a new sitemap for a user
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { services } = await req.json();
    if (!services || !Array.isArray(services)) {
      return NextResponse.json({ message: 'Invalid request: services array is required' }, { status: 400 });
    }

    const existingSitemap = await prisma.sitemap.findUnique({
      where: { userId: session.userId },
    });
    if (existingSitemap) {
      return NextResponse.json({ message: 'Sitemap already exists. Use PUT to update.' }, { status: 409 });
    }

    const newSitemap = await prisma.sitemap.create({
      data: {
        userId: session.userId,
        services: {
          create: services.map((service: { title: string; url: string }) => ({
            title: service.title,
            url: service.url,
          })),
        },
      },
      include: { services: true },
    });

    return NextResponse.json(newSitemap, { status: 201 });
  } catch (error) {
    console.error('Error creating sitemap:', error);
    return NextResponse.json({ message: 'Error creating sitemap' }, { status: 500 });
  }
}
// PUT handler to update an existing sitemap for a user
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { services } = await req.json();
    if (!services || !Array.isArray(services)) {
      return NextResponse.json({ message: 'Invalid request: services array is required ' }, { status: 400 });
    }

    // Using a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const sitemap = await tx.sitemap.findUnique({
        where: { userId: session.userId },
      });

      if (!sitemap) {
        // If no sitemap, create one
        return tx.sitemap.create({
          data: {
            userId: session.userId,
            services: {
              create: services.map((service: { title: string; url: string }) => ({
                title: service.title,
                url: service.url,
              })),
            },
          },
          include: { services: true },
        });
      } else {
        // If sitemap exists, delete old services and create new ones
        await tx.service.deleteMany({
          where: { sitemapId: sitemap.id },
        });

        return tx.sitemap.update({
          where: { userId: session.userId },
          data: {
            services: {
              create: services.map((service: { title: string; url: string }) => ({
                title: service.title,
                url: service.url,
              })),
            },
          },
          include: { services: true },
        });
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating sitemap:', error);
    return NextResponse.json({ message: 'Error updating sitemap' }, { status: 500 });
  }
}
// DELETE handler to remove a sitemap for a user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // This will cascade delete services due to the schema relation
    await prisma.sitemap.delete({
      where: { userId: session.userId },
    });

    return NextResponse.json({ message: 'Sitemap deleted successfully' });
  } catch (error) {
    // Prisma throws an error if the record to delete is not found
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Sitemap not found' }, { status: 404 });
    }
    console.error('Error deleting sitemap:', error);
    return NextResponse.json({ message: 'Error deleting sitemap' }, { status: 500 });
  }
}
