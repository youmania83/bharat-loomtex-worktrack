import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Shield,
  Users,
  CheckSquare,
  Clock,
  BarChart3,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();
  const [metrics, employees] = await Promise.all([
    db.getDashboardMetrics(),
    db.getEmployees(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Enterprise Banner */}
      <div className="bg-slate-900 text-slate-300 px-6 py-2 text-xs font-medium border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
          <span className="text-white font-semibold">RISON AI TECH</span>
          <span className="text-slate-500">•</span>
          <span>Enterprise Employee Productivity & Task Orchestration</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden sm:inline">Active Staff: <strong>7 Core Personnel</strong></span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-emerald-400 font-mono font-semibold">System Operational</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 lg:px-12 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-slate-900 flex items-center gap-1 text-base">
              <span>RISON</span>
              <span className="text-blue-600 font-extrabold">WORKTRACK</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium -mt-0.5">
              Assign. Track. Improve.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600 hidden md:block">
            Logged in as: <strong className="text-slate-900 font-semibold">{user.full_name}</strong> ({user.role.toUpperCase()})
          </div>
          <Link
            href="/login"
            className="text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            Switch Account
          </Link>
          <Link
            href={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Open {user.role === 'admin' ? 'Admin Console' : 'My Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Header Section */}
      <div className="bg-white border-b border-slate-200 py-12 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Bharat Loomtex Internal Enterprise System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
            High-Performance Employee Task & Productivity Platform
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transparent workload assignment, live work timer audits, review approval workflows, and mathematical productivity scoring for Bharat Loomtex.
          </p>

          {/* Real Live Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase">Staff Roster</div>
                <div className="text-lg font-bold font-mono text-slate-900">{metrics.total_employees} Employees</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase">Total Tasks</div>
                <div className="text-lg font-bold font-mono text-slate-900">{metrics.total_tasks} Work Items</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase">Completed</div>
                <div className="text-lg font-bold font-mono text-emerald-700">{metrics.completed_tasks} Delivered</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase">Velocity</div>
                <div className="text-lg font-bold font-mono text-slate-900">{metrics.overall_completion_rate}% Velocity</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Workspace Portal Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Command Portal Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                  OWNER / ADMIN ACCESS
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Management & Operations Console
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Assign daily and project tasks, monitor live progress across the 7 employees, review submissions in the approval queue, and access multi-factor productivity reports.
                </p>
              </div>

              {/* Quick Feature Pills */}
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 font-medium">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">Task Approvals</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">Kanban Board</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">CSV Exports</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">AI Reports</span>
              </div>
            </div>

            <Link
              href="/admin/dashboard"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Launch Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </Link>
          </div>

          {/* Employee Workspace Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  INDIVIDUAL EMPLOYEE PORTAL
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Employee Personal Workspace
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Access your personal assigned tasks, start and pause your live work timer with concurrency safety lock, update progress, flag blockers, and submit tasks for review.
                </p>
              </div>

              {/* Quick Feature Pills */}
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 font-medium">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">My Tasks Only</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">Live Timer Lock</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">Blocker Reports</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">Personal Score</span>
              </div>
            </div>

            <Link
              href="/employee/dashboard"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Launch Employee Workspace</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>

        {/* Instant Evaluation Roster */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Bharat Loomtex Team Roster</span>
                <span className="text-xs font-mono font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  1 Admin + 7 Employees
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any team member below to immediately switch context and evaluate their view and permissions.
              </p>
            </div>
            <Link
              href="/login"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Dedicated Login Screen</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Admin Profile */}
            <Link
              href="/login"
              className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 transition-all text-left flex flex-col justify-between space-y-2 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">
                    OWNER / ADMIN
                  </span>
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div className="font-bold text-sm text-slate-900 mt-1.5 group-hover:text-purple-700">
                  Suneet Kumar
                </div>
                <div className="text-[11px] text-purple-700 font-medium">Owner & Managing Director</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Executive Management</div>
              </div>
              <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1 pt-1">
                <span>Access Admin View</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* 7 Employees */}
            {employees.map((emp) => (
              <Link
                key={emp.id}
                href="/login"
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition-all text-left flex flex-col justify-between space-y-2 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800">
                      {emp.employee_code}
                    </span>
                    <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <div className="font-bold text-sm text-slate-900 mt-1.5 group-hover:text-blue-700">
                    {emp.profile?.full_name}
                  </div>
                  <div className="text-[11px] text-blue-700 font-medium truncate">
                    {emp.profile?.designation}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{emp.profile?.department}</div>
                </div>
                <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 pt-1">
                  <span>Access Employee View</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Engineering & Reliability Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Live Timer Concurrency Lock</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Starting a work timer automatically pauses any existing timer for that employee. Strictly prevents bogus parallel tracking.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Review & Approval Queue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Employees submit completed work with delivery notes. Admin can approve or return with revision feedback with one click.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Transparent Formula Scoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Objective 100-point rating: 30% completion rate + 30% on-time delivery + 25% quality approval + 15% progress consistency.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Phase 2 AI Synthesis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates daily operational briefs and weekly management recommendations derived strictly from real database rows.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Bharat Loomtex. WorkTrack — Production SaaS Application.</p>
      </footer>
    </div>
  );
}
