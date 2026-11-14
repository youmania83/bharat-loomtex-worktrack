import { NextRequest, NextResponse } from 'next/server';
import { generateDailyReport, generateWeeklyReport } from '@/lib/ai/reportGenerator';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'daily';

    if (type === 'weekly') {
      const report = await generateWeeklyReport();
      return NextResponse.json({ success: true, report });
    }

    const report = await generateDailyReport();
    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
