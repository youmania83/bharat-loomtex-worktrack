import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      <Sidebar role="employee" />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
