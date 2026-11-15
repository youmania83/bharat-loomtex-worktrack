import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { validateTaskAssignmentRights } from '@/lib/auth/permissions';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().default(''),
  task_type: z.enum(['daily', 'project']).default('project'),
  project_id: z.string().optional(),
  assigned_to: z.string().min(1, 'Assignee is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().min(1, 'Due date is required'),
  estimated_hours: z.number().nonnegative().optional().default(4),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('projectId') || undefined;
    const status = searchParams.get('status') || undefined;
    const employeeId = searchParams.get('employeeId') || undefined;

    // Scoped role check
    const tasks = await db.getTasks({
      role: user.role,
      userId: user.id,
      projectId,
      status,
      employeeId: user.role === 'admin' || user.role === 'manager' ? employeeId : user.id,
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Enforce Bharat Loomtex Task Assignment Rights Policy
    const permission = validateTaskAssignmentRights(user, parsed.data.assigned_to);
    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, error: permission.reason || 'Unauthorized task assignment.' },
        { status: 403 }
      );
    }

    const task = await db.createTask({
      ...parsed.data,
      assigned_by: user.id,
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
