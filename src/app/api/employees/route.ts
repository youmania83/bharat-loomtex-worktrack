import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  department: z.string().min(2, 'Department is required'),
  designation: z.string().min(2, 'Designation is required'),
  employee_code: z.string().min(2, 'Employee code is required'),
  hourly_rate: z.number().nonnegative().optional().default(600),
  joining_date: z.string().optional(),
});

export async function GET() {
  try {
    const employees = await db.getEmployees();
    return NextResponse.json({ success: true, employees });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Admins can create employees.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const employee = await db.createEmployee(parsed.data);
    return NextResponse.json({ success: true, employee });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
