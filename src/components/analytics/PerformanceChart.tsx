'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { EmployeePerformance } from '@/lib/types';

interface PerformanceChartProps {
  performanceData: EmployeePerformance[];
}

export function PerformanceChart({ performanceData }: PerformanceChartProps) {
  // 1. Employee comparison data
  const barData = performanceData.map((p) => ({
    name: p.full_name.split(' ')[0], // First name for clean axis
    Completed: p.completed_count,
    Pending: p.pending_count,
    Overdue: p.overdue_count,
    Score: p.performance_score,
  }));

  // 2. Status pie data
  const totalCompleted = performanceData.reduce((acc, p) => acc + p.completed_count, 0);
  const totalPending = performanceData.reduce((acc, p) => acc + p.pending_count, 0);
  const totalOverdue = performanceData.reduce((acc, p) => acc + p.overdue_count, 0);

  const pieData = [
    { name: 'Completed', value: totalCompleted || 1, color: '#16A34A' },
    { name: 'In Progress', value: totalPending || 1, color: '#2563EB' },
    { name: 'Overdue', value: totalOverdue || 0, color: '#DC2626' },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Employee-wise task completion bar chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Employee-Wise Task Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Completed vs Pending vs Overdue tasks across all personnel
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Completed" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pending" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Overdue" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task status breakdown pie chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Overall Completion Ratio
          </h3>
          <p className="text-xs text-slate-500">
            Real-time status breakdown
          </p>
        </div>
        <div className="h-52 w-full my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-xs font-medium">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-400">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
