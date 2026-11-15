import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // If user is employee trying to access management route, redirect to employee workspace
  if (user.role !== 'admin' && user.role !== 'manager') {
    redirect('/employee/dashboard');
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased">
      <Sidebar role={user.role === 'admin' ? 'admin' : 'manager'} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
