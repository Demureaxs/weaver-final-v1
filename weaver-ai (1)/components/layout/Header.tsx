
'use client';

import React from 'react';
import { Sparkles, User, LogOut, Sun, Moon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, isDemoMode, INITIAL_MOCK_DB } from '../../lib/firebase';
import { useUser } from '../../context/UserContext';
import { useRouter } from '../NextShim'; // LOCALLY: import { useRouter } from 'next/navigation';

export const Header = () => {
  const { state, dispatch } = useUser();
  const { user } = state;
  const router = useRouter();

  const handleLogout = () => {
    if (auth) signOut(auth);
    dispatch({ type: 'LOGOUT' });
    router.push('/');
  };

  const switchMockUser = (mockUid: string) => {
      // @ts-ignore
      const newUser = INITIAL_MOCK_DB[mockUid];
      dispatch({ type: 'LOGIN', payload: newUser });
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-4 shadow-sm">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white"><Sparkles size={20} /></div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">WEAVER.ai</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Toggle Theme"
            >
              {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user && (
                <div className="flex items-center gap-2">
                    {isDemoMode && (
                        <div className="relative group">
                            <button className="hidden md:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                                <User size={14} className="text-indigo-500" />
                                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 max-w-[120px] truncate">{user.displayName || user.email}</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 hidden group-hover:block z-50">
                                <div className="text-xs font-bold text-gray-400 px-2 py-1 uppercase">Switch User</div>
                                {Object.values(INITIAL_MOCK_DB).map((u: any) => (
                                    <button key={u.uid} onClick={() => switchMockUser(u.uid)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${user?.uid === u.uid ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                        <div className={`w-2 h-2 rounded-full ${user?.uid === u.uid ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>{u.displayName.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Sign Out"><LogOut size={18} /></button>
          </div>
        </div>
    </header>
  );
};
