'use client';

import React, { useEffect, ReactNode } from 'react';
import { UserProvider, useUser } from '../context/UserContext';
import { AuthInitializer } from '../components/auth/AuthInitializer';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ThemeWatcher = () => {
  const { state } = useUser();
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <UserProvider>
        <ThemeWatcher />
        <AuthInitializer />
        {children}
      </UserProvider>
    </ErrorBoundary>
  );
}
