import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const task = await db.getTask(id);

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // Role check: employees can only view tasks assigned to them
    if (user.role === 'employee' && task.assigned_to !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied: You are not assigned to this task.' },
        { status: 403 }
      );
    }

    const [comments, timeLogs, activityLogs] = await Promise.all([
      db.getComments(id),
      db.getTimeLogsForTask(id),
      db.getActivityLogs(id),
    ]);

    return NextResponse.json({
      success: true,
      task,
      comments,
      timeLogs,
      activityLogs,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const task = await db.getTask(id);

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (user.role === 'employee' && task.assigned_to !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied: You cannot modify this task.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await db.updateTask(id, body, user.id);

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
