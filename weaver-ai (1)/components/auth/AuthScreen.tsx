import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Globe, AlertCircle } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, isDemoMode } from '../../lib/firebase';

export const AuthScreen = ({ onLogin, mockUsers, switchMockUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleMockAuth = (e) => { e?.preventDefault(); onLogin(mockUsers['user_alice']); };
  const handleGoogleLogin = async () => { if (isDemoMode || !auth) { onLogin(mockUsers['user_bob']); return; } try { const provider = new GoogleAuthProvider(); await signInWithPopup(auth, provider); } catch (err) { setError(err.message); } };
  const handleEmailAuth = async (e) => { e.preventDefault(); if (isDemoMode || !auth) { handleMockAuth(e); return; } try { if (isLogin) await signInWithEmailAndPassword(auth, email, password); else await createUserWithEmailAndPassword(auth, email, password); } catch (err) { setError(err.message); } };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg"><Sparkles size={32} /></div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome to WEAVER.ai</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">AI-Powered Content Creation</p>
          {isDemoMode && <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200">Prototyping / Demo Mode</span>}
        </div>
        {isDemoMode && (
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-3 tracking-wider">Quick Prototyping Login</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onLogin(mockUsers['user_alice'])} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-gray-100 dark:border-gray-700"><div className="font-bold text-sm text-gray-800 dark:text-gray-200">Alice</div><div className="text-xs text-gray-500">Gardener</div></button>
                    <button onClick={() => onLogin(mockUsers['user_bob'])} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-gray-100 dark:border-gray-700"><div className="font-bold text-sm text-gray-800 dark:text-gray-200">Bob</div><div className="text-xs text-gray-500">Developer</div></button>
                </div>
            </div>
        )}
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required /></div></div>
          <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required /></div></div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">{isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
        <div className="my-6 flex items-center gap-4"><div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div><span className="text-xs text-gray-400 font-medium">OR</span><div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div></div>
        <button onClick={handleGoogleLogin} className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600"><Globe size={18} />Continue with Google</button>
        <p className="mt-6 text-center text-sm text-gray-500">{isLogin ? "Don't have an account? " : "Already have an account? "}<button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 hover:underline font-medium">{isLogin ? 'Sign Up' : 'Log In'}</button></p>
      </div>
    </div>
  );
};