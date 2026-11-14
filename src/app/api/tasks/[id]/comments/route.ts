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
        { success: false, error: 'Unauthorized to comment on this task' },
        { status: 403 }
      );
    }

    const { content, isBlocker } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

    const comment = await db.addComment(id, user.id, content.trim(), Boolean(isBlocker));

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
