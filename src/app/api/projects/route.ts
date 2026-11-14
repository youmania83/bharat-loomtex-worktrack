import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  client_name: z.string().optional(),
  description: z.string().optional().default(''),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('active'),
  start_date: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
  target_end_date: z.string().optional(),
  budget_hours: z.number().nonnegative().optional().default(100),
});

export async function GET() {
  try {
    const projects = await db.getProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Admins can create projects.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const project = await db.createProject({
      ...parsed.data,
      created_by: user.id,
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
