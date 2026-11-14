import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.set(AUTH_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(new URL('/login', 'http://localhost:3000'));
  res.cookies.set(AUTH_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}
