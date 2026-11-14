'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  CheckCircle2,
  Clock,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LogoutPage() {
  const [loggedOutAt, setLoggedOutAt] = useState<string>('');

  useEffect(() => {
    setLoggedOutAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-1.5">
          <span>RISON</span>
          <span className="text-blue-600 font-extrabold">WORKTRACK</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Rison AI Tech • Assign. Track. Improve.
        </p>
      </div>

      {/* Main Shift Summary Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl rounded-2xl sm:px-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Shift Logged Out Successfully
            </h3>
            <p className="text-xs text-slate-500">
              Your working session and daily hours have been safely recorded into the Rison WorkTrack central ledger.
            </p>
          </div>

          {/* Time & Session Metrics */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-slate-400" /> Clock-Out Timestamp
              </span>
              <span className="font-semibold text-slate-900 font-mono">
                {loggedOutAt || 'Just now'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <UserCheck className="w-4 h-4 text-emerald-500" /> Shift Status
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
                ⚪ Logged Out
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Briefcase className="w-4 h-4 text-blue-500" /> Active Timers
              </span>
              <span className="font-semibold text-emerald-600 text-[11px]">
                Paused & Synchronized
              </span>
            </div>
          </div>

          {/* Transparent Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Privacy Assurance:</strong> All work hours are transparently calculated from active task timers and recorded shift logins. No secret tracking or background surveillance.
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <Link href="/login" className="block w-full">
              <Button variant="primary" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm flex items-center justify-center gap-2">
                <span>Sign In Again</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/" className="block w-full">
              <Button variant="outline" className="w-full py-2.5 text-xs text-slate-700 font-medium">
                Return to Landing Overview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
