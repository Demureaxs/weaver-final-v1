import React, { useState } from 'react';
import { Sparkles, Mail, Lock, AlertCircle, User } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: any) => void;
}

export const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { email, password, displayName };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setIsLoading(false);
        return;
      }

      // Call onLogin with user data
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
      <div className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700'>
        <div className='text-center mb-8'>
          <div className='bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg'>
            <Sparkles size={32} />
          </div>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Welcome to WEAVER.ai</h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>AI-Powered Content Creation</p>
        </div>

        {error && (
          <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2'>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className='space-y-4'>
          {!isLogin && (
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Display Name</label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
                <input
                  type='text'
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none'
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Email</label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none'
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Password</label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none'
                required
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50'
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-gray-500'>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className='text-indigo-600 hover:underline font-medium'
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};
