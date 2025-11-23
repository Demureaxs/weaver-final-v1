import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { Article } from '@/lib/types';
import { INITIAL_MOCK_DB } from '@/lib/mockdb';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.uid;

    // Filter articles from the mock database based on the userId
    const userArticles: Article[] = INITIAL_MOCK_DB.articles.filter(
      (article) => article.userId === userId
    );

    return NextResponse.json(userArticles, { status: 200 });
  } catch (error) {
    console.error('Error fetching user articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
