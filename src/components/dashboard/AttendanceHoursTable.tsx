'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  UserCheck,
  Briefcase,
  TrendingUp,
  Search,
  RefreshCw,
} from 'lucide-react';
import { EmployeeAttendanceToday } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

export function AttendanceHoursTable() {
  const [attendance, setAttendance] = useState<EmployeeAttendanceToday[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAttendance = () => {
    setLoading(true);
    fetch('/api/attendance')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.attendance)) {
          setAttendance(data.attendance);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filtered = attendance.filter(
    (a) =>
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase()) ||
      a.employee_code.toLowerCase().includes(search.toLowerCase())
  );

  const totalShiftHours = attendance.reduce((acc, a) => acc + a.today_shift_hours, 0);
  const totalTaskHours = attendance.reduce((acc, a) => acc + a.today_task_hours, 0);
  const onlineCount = attendance.filter((a) => a.is_online).length;

  const formatTime = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header & Metric Summary */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Employee Shift & Work Hours Log
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              Today's Live Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time shift logins, clock-out timestamps, and task timer hours recorded for all 7 team members.
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Staff Online</span>
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {onlineCount} / {attendance.length}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Team Shift Hours</span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {totalShiftHours.toFixed(1)} hrs
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-right">
            <span className="text-[10px] text-blue-700 font-semibold uppercase block">Active Task Hours</span>
            <span className="text-sm font-bold text-blue-700 font-mono">
              {totalTaskHours.toFixed(1)} hrs
            </span>
          </div>

          <button
            onClick={fetchAttendance}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Attendance"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <strong>{filtered.length}</strong> personnel records
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">First Clock-In</th>
              <th className="py-3 px-3">Clock-Out</th>
              <th className="py-3 px-3 text-right">Shift Hours</th>
              <th className="py-3 px-3 text-right">Task Hours</th>
              <th className="py-3 px-3 text-center">Efficiency Ratio</th>
              <th className="py-3 px-4 text-center">Active Tasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <div className="mt-2 text-xs">Loading employee attendance records...</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No employee attendance records found matching "{search}".
                </td>
              </tr>
            ) : (
              filtered.map((emp) => {
                const ratio = emp.today_shift_hours > 0
                  ? Math.min(100, Math.round((emp.today_task_hours / emp.today_shift_hours) * 100))
                  : 0;

                return (
                  <tr key={emp.employee_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{emp.full_name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        <span className="font-mono text-blue-600 font-medium">{emp.employee_code}</span>
                        <span>•</span>
                        <span>{emp.department}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {emp.is_online ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          ⚪ Logged Out
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-mono">
                      {formatTime(emp.first_login_at)}
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-mono">
                      {emp.is_online ? (
                        <span className="text-emerald-600 font-medium italic">Active Shift</span>
                      ) : (
                        formatTime(emp.last_logout_at)
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {emp.today_shift_hours.toFixed(1)} hrs
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-600">
                      {emp.today_task_hours.toFixed(1)} hrs
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ratio >= 80 ? 'bg-emerald-500' : ratio >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-slate-700">
                          {ratio}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge variant={emp.active_tasks_count > 0 ? 'info' : 'outline'}>
                        {emp.active_tasks_count} active
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
