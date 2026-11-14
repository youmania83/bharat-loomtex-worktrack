'use client';

import React, { useState, useEffect } from 'react';
import { Download, Calculator } from 'lucide-react';
import { PerformanceChart } from '@/components/analytics/PerformanceChart';
import { EmployeePerformanceTable } from '@/components/analytics/EmployeePerformanceTable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmployeePerformance } from '@/lib/types';

export default function AdminAnalyticsPage() {
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);

  useEffect(() => {
    fetch('/api/analytics/performance')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPerformanceData(data.performance);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDownloadCSV = () => {
    window.open('/api/export/csv', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Productivity Analytics & Scoring Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, multi-dimensional employee evaluations with zero arbitrary black-box rankings.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="font-semibold">
          <Download className="w-4 h-4" /> Export All to CSV
        </Button>
      </div>

      {/* Transparent Formula Explainer Banner */}
      <Card className="bg-blue-50/50 border-blue-200 p-5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5 shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">
              Mathematical Scoring Formula
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Every employee’s composite performance score is computed directly from verifiable database facts:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-semibold">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <span className="font-bold text-blue-700 font-mono">30%</span> Completion Rate
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Completed / Assigned</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <span className="font-bold text-emerald-700 font-mono">30%</span> On-Time Delivery
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Finished before deadline</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <span className="font-bold text-purple-700 font-mono">25%</span> Approval & Quality
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Submissions approved</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <span className="font-bold text-amber-700 font-mono">15%</span> Work Consistency
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Progress slider updates</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Charts */}
      <PerformanceChart performanceData={performanceData} />

      {/* Roster Drilldown */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-slate-900">
          Detailed Employee Comparison Matrix
        </h3>
        <EmployeePerformanceTable data={performanceData} />
      </div>
    </div>
  );
}
