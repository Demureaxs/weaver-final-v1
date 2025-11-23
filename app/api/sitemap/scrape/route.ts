import { NextRequest, NextResponse } from 'next/server';

interface SitemapLink {
  url: string;
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, xml } = body;

    let sitemapXml = xml;

    // If URL provided, fetch the sitemap
    if (url && !xml) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SitemapBot/1.0)',
          },
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
          return NextResponse.json({ error: `Failed to fetch sitemap: ${response.statusText}` }, { status: 400 });
        }

        sitemapXml = await response.text();
      } catch (error: any) {
        return NextResponse.json({ error: `Failed to fetch sitemap: ${error.message}` }, { status: 400 });
      }
    }

    if (!sitemapXml) {
      return NextResponse.json({ error: 'No sitemap URL or XML provided' }, { status: 400 });
    }

    // Extract URLs from sitemap XML
    const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g);

    if (!urlMatches || urlMatches.length === 0) {
      return NextResponse.json({ error: 'No URLs found in sitemap' }, { status: 400 });
    }

    const urls = urlMatches.map((match: string) => match.replace(/<\/?loc>/g, ''));

    // Extract text from URL paths (no scraping needed)
    const results: SitemapLink[] = urls.map((url: string) => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        // Get the last segment of the path
        const segments = pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1] || 'home';

        // Convert URL slug to readable text
        // e.g., "about-us" -> "About Us"
        const text = lastSegment
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return { url, text };
      } catch (error) {
        // Fallback for invalid URLs
        return { url, text: 'Page' };
      }
    });

    return NextResponse.json({ links: results }, { status: 200 });
  } catch (error: any) {
    console.error('Sitemap scraping error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
