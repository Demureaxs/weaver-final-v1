'use client';

import React, { useEffect } from 'react';
import { AuthScreen } from '../components/auth/AuthScreen';
import { useUser } from '../context/UserContext';
import { INITIAL_MOCK_DB } from '../lib/firebase';
import { useRouter } from '../components/NextShim'; 

export default function HomePage() {
  const { state, dispatch } = useUser();
  const { user, isLoading } = state;
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
        router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading spinner while AuthInitializer determines state
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;

  return (
    <AuthScreen 
        onLogin={(userData: any) => dispatch({ type: 'LOGIN', payload: userData })} 
        mockUsers={INITIAL_MOCK_DB} 
        switchMockUser={() => {}} 
    />
  );
}