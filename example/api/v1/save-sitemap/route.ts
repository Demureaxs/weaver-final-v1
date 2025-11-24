import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sitemap } from '../../../../data/sitemap';

interface Service {
  title: string;
  url: string;
}

export async function POST(req: NextRequest) {
  const { services, userId }: { services: Service[]; userId?: number } = await req.json();

  if (!services || !userId) {
    return NextResponse.json({ error: 'Missing services or userId' }, { status: 400 });
  }

  // Make a mutable copy of the sitemap
  const newSitemap = [...sitemap];

  const userSitemapIndex = newSitemap.findIndex((item) => item.userId === userId);

  if (userSitemapIndex !== -1) {
    newSitemap[userSitemapIndex].services = services;
  } else {
    const newId = newSitemap.length > 0 ? Math.max(...newSitemap.map((item) => item.id)) + 1 : 1;
    newSitemap.push({
      id: newId,
      userId: userId,
      services: services,
    });
  }

  // Convert the array of objects to a string that is a valid TS file.
  const sitemapString = `export const sitemap = ${JSON.stringify(newSitemap, null, 2)};\n`;

  try {
    const filePath = path.join(process.cwd(), 'data', 'sitemap.ts');
    await fs.writeFile(filePath, sitemapString);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save sitemap:', error);
    return NextResponse.json({ error: 'Failed to save sitemap' }, { status: 500 });
  }
}