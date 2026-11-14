'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/lib/types';

interface QuickRoleSwitcherProps {
  currentUserId?: string;
  onUserChanged?: () => void;
}

export function QuickRoleSwitcher({ currentUserId, onUserChanged }: QuickRoleSwitcherProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Prepend Admin profile
          const adminProf: Profile = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'admin@bharatloomtex.com',
            full_name: 'Suneet Kumar',
            role: 'admin',
            department: 'Executive Management',
            designation: 'Owner & Managing Director',
            status: 'active',
            created_at: '',
            updated_at: '',
          };
          const employeeProfiles = data.employees.map((e: any) => e.profile);
          setProfiles([adminProf, ...employeeProfiles]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const currentProfile = profiles.find((p) => p.id === currentUserId) || profiles[0];

  const handleSelectUser = async (userId: string, role: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        if (onUserChanged) onUserChanged();
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/employee/dashboard');
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors shadow-xs"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            currentProfile?.role === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'
          }`}
        />
        <div className="flex items-center gap-1.5 text-left">
          <span className="font-semibold text-slate-900">
            {currentProfile?.full_name || 'Quick Switcher'}
          </span>
          <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {currentProfile?.role === 'admin' ? 'Admin' : 'Employee'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">
              Switch Active Role & Account
            </div>

            {profiles.map((p) => {
              const isSelected = p.id === currentUserId;
              return (
                <button
                  key={p.id}
                  disabled={loading}
                  onClick={() => handleSelectUser(p.id, p.role)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {p.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                    ) : (
                      <User className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{p.full_name}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {p.designation}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
