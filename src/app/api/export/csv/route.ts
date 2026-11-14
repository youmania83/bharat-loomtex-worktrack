import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exportPerformanceToCSV } from '@/lib/utils/csv';

export async function GET() {
  try {
    const perfList = await db.getEmployeePerformanceList();
    const csvContent = exportPerformanceToCSV(perfList);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rison-worktrack-performance-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
