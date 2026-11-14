import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  let userId: string | undefined;

  try {
    const body = await req.json().catch(() => ({}));
    userId = body.userId;
  } catch {
    // No json body
  }

  if (!userId) {
    userId = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  }

  let sessionSummary = null;
  if (userId) {
    sessionSummary = await db.clockOut(userId);
  }

  const res = NextResponse.json({
    success: true,
    message: 'Logged out and shift closed successfully',
    session: sessionSummary,
  });

  res.cookies.set(AUTH_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}

export async function GET(req: NextRequest) {
  const userId = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (userId) {
    await db.clockOut(userId);
  }

  const res = NextResponse.redirect(new URL('/logout', req.url));
  res.cookies.set(AUTH_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}
