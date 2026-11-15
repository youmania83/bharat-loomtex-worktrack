import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Admins and Directors can return tasks for revision.' },
        { status: 403 }
      );
    }

    const { reason } = await req.json();
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required.' },
        { status: 400 }
      );
    }

    const updated = await db.rejectTask(id, reason, user.id);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
