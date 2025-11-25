import React from 'react';
import { FileText, Edit3, CreditCard, Layers, FileEdit, Clock, ArrowRight } from 'lucide-react';
import { User, Article } from '../lib/types';

export const DashboardView = ({ user }: { user: User | null }) => {
  if (!user || !user.profile) return null;

  const activeCount = user.articles?.filter(a => a.status === 'Draft').length || 0;
  
  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Dashboard</h2>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Articles Generated */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Articles Generated</p>
                {/* Shows actual count of articles from the array */}
                <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{user.articles?.length || 0}</h3>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-500">
                <FileText size={24} />
            </div>
        </div>

        {/* Active Drafts */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Drafts</p>
                <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400">{activeCount}</h3>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl text-purple-500">
                <Edit3 size={24} />
            </div>
        </div>

        {/* Credits Remaining */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Credits Remaining</p>
                <h3 className={`text-3xl font-bold ${user.profile.credits > 10 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{user.profile.credits}</h3>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl text-green-500">
                <CreditCard size={24} />
            </div>
        </div>

        {/* Current Plan */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Plan</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.profile.plan}</h3>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-xl text-gray-600 dark:text-gray-300">
                <Layers size={24} />
            </div>
        </div>
      </div>

      {/* Quick Action / Upgrade Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
              <div>
                  <h3 className="font-bold text-lg">Running low on credits?</h3>
                  <p className="text-indigo-100 text-sm opacity-90">Upgrade your plan to unlock unlimited generation.</p>
              </div>
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors">
                  Upgrade Plan
              </button>
          </div>
      </div>

      {/* Recent Drafts / Articles List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/30">
              <FileEdit className="text-indigo-500" size={20} />
              <h3 className="font-bold text-gray-700 dark:text-gray-200">Recent Drafts</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {user.articles && user.articles.length > 0 ? (
                  user.articles.map((article: Article, idx: number) => (
                      <button key={idx} className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group flex justify-between items-center">
                          <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 transition-colors">{article.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {new Date(article.createdAt).toLocaleDateString()}</span>
                                  <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">{article.status}</span>
                              </div>
                          </div>
                          <div className="text-gray-300 group-hover:text-indigo-400">
                              <ArrowRight size={18} />
                          </div>
                      </button>
                  ))
              ) : (
                  <div className="p-8 text-center text-gray-400">
                      <p>No articles generated yet.</p>
                      <p className="text-xs mt-1">Go to the Generator tab to create your first post!</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
