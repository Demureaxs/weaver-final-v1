import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for session token - matcher ensures this only runs for /dashboard routes
  const sessionToken = request.cookies.get('session_token');

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
