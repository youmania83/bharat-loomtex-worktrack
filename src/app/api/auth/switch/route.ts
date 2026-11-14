import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    const profile = await db.getProfile(userId);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Automatically clock in the employee session
    const session = await db.clockIn(userId);

    const res = NextResponse.json({ success: true, user: profile, session });
    res.cookies.set(AUTH_COOKIE_NAME, userId, {
      path: '/',
      httpOnly: false, // Accessible to client so components can react
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
