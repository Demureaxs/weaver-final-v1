import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { Sitemap } from '@/lib/types';
import { INITIAL_MOCK_DB } from '@/lib/mockdb';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.uid;

    // Filter sitemaps from the mock database based on the userId
    // Assuming a user can only have one sitemap for now
    const userSitemap: Sitemap | undefined = INITIAL_MOCK_DB.sitemaps.find(
      (sitemap) => sitemap.userId === userId
    );

    if (!userSitemap) {
        return NextResponse.json(null, { status: 200 }); // Return null if no sitemap found for user
    }

    return NextResponse.json(userSitemap, { status: 200 });
  } catch (error) {
    console.error('Error fetching user sitemap:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
