
'use client';

import React, { useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { useUser } from '../../context/UserContext';
import { useRouter } from '../../components/NextShim'; // LOCALLY: import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state } = useUser();
  const { user, isLoading } = state;
  const router = useRouter();

  // Basic client-side protection
  useEffect(() => {
    if (!isLoading && !user) {
        router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;

  // If user is null but not loading (redirecting), render nothing or a shell
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-screen-2xl w-full mx-auto p-4 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
