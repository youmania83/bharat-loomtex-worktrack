'use client';

import React, { useState } from 'react';
import { EmployeePerformance } from '@/lib/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ArrowUpDown, Download, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatHours } from '@/lib/utils/formatters';

interface EmployeePerformanceTableProps {
  data: EmployeePerformance[];
  onSelectEmployee?: (employeeId: string) => void;
}

export function EmployeePerformanceTable({
  data,
  onSelectEmployee,
}: EmployeePerformanceTableProps) {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'completion' | 'hours' | 'overdue'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter departments list
  const departments = Array.from(new Set(data.map((d) => d.department)));

  const handleSort = (field: 'score' | 'completion' | 'hours' | 'overdue') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filtered = data
    .filter((emp) => {
      const matchSearch =
        emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation.toLowerCase().includes(search.toLowerCase());
      const matchDept = departmentFilter === 'all' || emp.department === departmentFilter;
      return matchSearch && matchDept;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === 'score') diff = a.performance_score - b.performance_score;
      if (sortBy === 'completion') diff = a.completion_rate - b.completion_rate;
      if (sortBy === 'hours') diff = a.total_logged_hours - b.total_logged_hours;
      if (sortBy === 'overdue') diff = a.overdue_count - b.overdue_count;
      return sortOrder === 'desc' ? -diff : diff;
    });

  const handleDownloadCSV = () => {
    window.open('/api/export/csv', '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs space-y-4">
      {/* Table Controls */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter employee or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-blue-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* CSV Export Button */}
        <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="w-full sm:w-auto">
          <Download className="w-3.5 h-3.5" /> Export to CSV
        </Button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Assigned</th>
              <th className="py-3 px-4">Completed</th>
              <th className="py-3 px-4">Pending</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('overdue')}
              >
                <div className="flex items-center gap-1">
                  <span>Overdue</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('completion')}
              >
                <div className="flex items-center gap-1">
                  <span>Completion Rate</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('hours')}
              >
                <div className="flex items-center gap-1">
                  <span>Logged Time</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors text-right"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Performance Index</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                  No employees match the filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr
                  key={emp.employee_id}
                  onClick={() => onSelectEmployee && onSelectEmployee(emp.employee_id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{emp.full_name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300">
                        {emp.employee_code}
                      </span>
                      <span>• {emp.designation}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {emp.assigned_count}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {emp.completed_count}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-blue-600 dark:text-blue-400">
                    {emp.pending_count}
                  </td>
                  <td className="py-3.5 px-4">
                    {emp.overdue_count > 0 ? (
                      <span className="font-mono font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200">
                        {emp.overdue_count}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 w-36">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={emp.completion_rate} size="sm" />
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {emp.completion_rate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {formatHours(emp.total_logged_hours)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`text-sm font-bold font-mono px-2 py-0.5 rounded-md ${
                          emp.performance_score >= 80
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : emp.performance_score >= 60
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {emp.performance_score} / 100
                      </span>
                      {emp.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                      {emp.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-blue-500" />}
                      {emp.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
