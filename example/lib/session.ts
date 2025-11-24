import Iron from '@hapi/iron';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

const MAX_AGE = 60 * 60 * 8; // 8 hours
const TOKEN_NAME = 'session_token';

// Encrypt and seal the session data
async function sealData(data: any) {
  return Iron.seal(data, process.env.TOKEN_SECRET as string, Iron.defaults);
}

// Decrypt and unseal the session data
async function unsealData(token: string) {
  return Iron.unseal(token, process.env.TOKEN_SECRET as string, Iron.defaults);
}

// Function to create a new session and set the cookie
export async function setSession(data: any) {
  // Corrected function signature
  const createdAt = Date.now();
  const payload = { ...data, createdAt, maxAge: MAX_AGE };
  const token = await sealData(payload);

  (await cookies()).set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });
}

// Function to get and decrypt the session from the cookie
export async function getSession() {
  const token = (await cookies()).get(TOKEN_NAME)?.value;
  if (!token) return null;

  try {
    const session = await unsealData(token);
    const expiresAt = session.createdAt + session.maxAge * 1000;

    if (Date.now() > expiresAt) {
      console.error('Session expired');
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

// Function to remove the session cookie
export async function removeCookie() {
  (await cookies()).set(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  });
}
