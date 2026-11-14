import React from 'react';
import Link from 'next/link';
import { Layers, Shield, Users, CheckSquare, Clock, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white flex items-center gap-1 text-sm">
            <span>RISON</span>
            <span className="text-blue-400 font-extrabold">WORKTRACK</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Switch Account
          </Link>
          <Link
            href={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <span>Enter App ({user.role === 'admin' ? 'Admin' : 'Employee'})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Rison AI Tech Enterprise SaaS Release</span>
        </div>

        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Assign. Track. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Improve.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The complete employee task and productivity intelligence management system. Real-time time audits, strict review approval workflows, and transparent mathematical scoring.
          </p>
        </div>

        {/* Portals Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl pt-6 text-left">
          {/* Admin Portal Card */}
          <Link
            href="/admin/dashboard"
            className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10 group space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-400">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-bold border border-purple-800">
                1 OWNER / ADMIN
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                Admin & Operations Console
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Task assignment, project tracks, review approvals queue, productivity analytics, and CSV exports.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 pt-2">
              <span>Launch Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Employee Workspace Card */}
          <Link
            href="/employee/dashboard"
            className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 hover:border-emerald-500 transition-all hover:shadow-xl hover:shadow-emerald-500/10 group space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                7 EMPLOYEES ACTIVE
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Employee Workspace
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Personal task queue, live timer with concurrency lock, progress sliders, blocker reporting, and submit for approval.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 pt-2">
              <span>Launch Employee Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-10 text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-bold text-white">Live Time Lock</h3>
            <p className="text-[11px] text-slate-400">
              Automatic single-timer constraint per employee prevents bogus parallel logging.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xs font-bold text-white">Review Queues</h3>
            <p className="text-[11px] text-slate-400">
              One-click management approval or rejection with feedback reasons.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-xs font-bold text-white">Formula Scoring</h3>
            <p className="text-[11px] text-slate-400">
              Weighted composite index: 30% delivery + 30% on-time + 25% quality + 15% consistency.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-bold text-white">Phase 2 AI Synthesis</h3>
            <p className="text-[11px] text-slate-400">
              Deterministic daily briefs and weekly management action recommendations.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Rison AI Tech. Rison WorkTrack — Built for Enterprise Scalability.</p>
      </footer>
    </div>
  );
}
