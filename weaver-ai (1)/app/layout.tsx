'use client';

import React, { Component, ReactNode, ErrorInfo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { UserProvider, useUser } from '../context/UserContext';
import { AuthInitializer } from '../components/auth/AuthInitializer';
import '../index.css';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState { 
    return { hasError: true, error }; 
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) { 
    console.error("App Crash:", error, errorInfo); 
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center border border-red-200">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4 text-sm">The application encountered an error.</p>
            <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Reload App</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

export default function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="h-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
        <ErrorBoundary>
            <UserProvider>
                <ThemeWatcher />
                <AuthInitializer />
                {children}
            </UserProvider>
        </ErrorBoundary>
    </div>
  );
}