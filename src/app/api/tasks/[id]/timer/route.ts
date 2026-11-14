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
    const task = await db.getTask(id);

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (user.role === 'employee' && task.assigned_to !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You are not assigned to this task.' },
        { status: 403 }
      );
    }

    const { action } = await req.json();

    if (action === 'start') {
      const result = await db.startTaskTimer(id, user.id);
      return NextResponse.json({
        success: true,
        action: 'started',
        timer: result.activeTimer,
        previousPausedTaskId: result.previousPausedTaskId,
      });
    }

    if (action === 'pause' || action === 'stop') {
      const paused = await db.pauseTaskTimer(id, user.id);
      return NextResponse.json({
        success: true,
        action: 'paused',
        timer: paused,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const logs = await db.getTimeLogsForTask(id);
    const active = await db.getRunningTimer(user.id);

    return NextResponse.json({
      success: true,
      logs,
      isCurrentTaskRunning: active?.task_id === id,
      activeTimer: active,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
