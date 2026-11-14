'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TaskActivityLog } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/formatters';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<TaskActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In our db/store, getActivityLogs() provides records
    fetch('/api/tasks')
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success && data.tasks.length > 0) {
          // Fetch activity logs for sample tasks
          const allLogs: TaskActivityLog[] = [];
          for (const t of data.tasks.slice(0, 5)) {
            const tRes = await fetch(`/api/tasks/${t.id}`);
            const tData = await tRes.json();
            if (tData.success && tData.activityLogs) {
              allLogs.push(...tData.activityLogs);
            }
          }
          setLogs(allLogs);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor?.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            System & Workflow Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of task creations, status transitions, timer events, approvals, and returns.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action or actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden bg-white border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400 italic">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {log.actor?.full_name || 'System / Admin'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="purple">{log.action}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {log.details || 'Task state updated.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
