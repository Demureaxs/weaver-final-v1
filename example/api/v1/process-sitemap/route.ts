import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const url = formData.get('url') as string;
  const omitDomain = formData.get('omitDomain') === 'true';

  if (!file && !url) {
    return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 });
  }

  let sitemapContent: string;

  if (file) {
    sitemapContent = await file.text();
  } else {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch sitemap from URL' }, { status: 400 });
      }
      sitemapContent = await response.text();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid URL or network issue' }, { status: 400 });
    }
  }

  try {
    const locs = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
    const urls = locs.map(loc => loc.replace(/<\/?loc>/g, ''));
    const serviceUrls = urls.filter(url => url.includes('/services/'));

    const servicePages = serviceUrls.map(fullUrl => {
      let finalUrl = fullUrl;
      if (omitDomain) {
        try {
          const urlObj = new URL(fullUrl);
          finalUrl = urlObj.pathname;
        } catch (e) {
          console.error('Invalid URL for domain omission:', fullUrl, e);
        }
      }
      const title = finalUrl.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || '';
      return {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        url: finalUrl,
      };
    });

    return NextResponse.json({ services: servicePages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse sitemap' }, { status: 500 });
  }
}
