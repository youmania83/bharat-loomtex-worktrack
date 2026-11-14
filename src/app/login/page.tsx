'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Shield, User, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Yogesh Wadhwa (Owner / Tech Lead)',
      email: 'admin@risonaitech.com',
      role: 'admin',
      roleLabel: 'Admin / Owner',
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@risonaitech.com',
      role: 'employee',
      roleLabel: 'Senior Fullstack',
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      name: 'Priya Patel',
      email: 'priya.patel@risonaitech.com',
      role: 'employee',
      roleLabel: 'Lead UI/UX Designer',
    },
    {
      id: '00000000-0000-0000-0000-000000000013',
      name: 'Amit Verma',
      email: 'amit.verma@risonaitech.com',
      role: 'employee',
      roleLabel: 'AI Automation Specialist',
    },
    {
      id: '00000000-0000-0000-0000-000000000014',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@risonaitech.com',
      role: 'employee',
      roleLabel: 'Frontend Developer',
    },
    {
      id: '00000000-0000-0000-0000-000000000015',
      name: 'Vikram Singh',
      email: 'vikram.singh@risonaitech.com',
      role: 'employee',
      roleLabel: 'QA & Test Automation',
    },
    {
      id: '00000000-0000-0000-0000-000000000016',
      name: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@risonaitech.com',
      role: 'employee',
      roleLabel: 'Backend & Cloud',
    },
    {
      id: '00000000-0000-0000-0000-000000000017',
      name: 'Rohit Kumar',
      email: 'rohit.kumar@risonaitech.com',
      role: 'employee',
      roleLabel: 'Client Success & Analyst',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Find matching account or fallback to switch
      const matched = demoAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      const userId = matched ? matched.id : demoAccounts[0].id;
      const role = matched ? matched.role : 'admin';

      await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (role === 'admin') router.push('/admin/dashboard');
      else router.push('/employee/dashboard');
    } catch (_err) {
      setError('Login failed. Please select an account.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account: (typeof demoAccounts)[0]) => {
    setLoading(true);
    try {
      await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: account.id }),
      });
      if (account.role === 'admin') router.push('/admin/dashboard');
      else router.push('/employee/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@risonaitech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm" isLoading={loading}>
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick Instant Demo Switcher */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center mb-3">
              One-Click Instant Evaluation Login
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleQuickLogin(acc)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-left text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    {acc.role === 'admin' ? (
                      <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-blue-700">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{acc.roleLabel}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
