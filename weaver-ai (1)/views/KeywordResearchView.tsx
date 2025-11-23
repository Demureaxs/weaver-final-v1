
import React from 'react';
import { Search, RefreshCw, BarChart2, TrendingUp, Trash2, Plus } from 'lucide-react';
import { getDifficultyColor } from '../lib/utils';

export const KeywordResearchView = ({
    seedKeyword,
    setSeedKeyword,
    handleKeywordSearch,
    isSearching,
    keywordResults,
    savedKeywords,
    toggleKeyword
}) => {
  return (
    <div className="animate-fade-in space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-200 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Search className="text-indigo-500" size={20} />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Keyword Research</h2>
            </div>
            <div className="p-6">
                <div className="flex gap-2">
                    <input type="text" value={seedKeyword} onChange={(e) => setSeedKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()} placeholder="Enter a seed keyword..." className="flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button onClick={handleKeywordSearch} disabled={isSearching || !seedKeyword.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-colors">{isSearching ? <RefreshCw size={20} className="animate-spin" /> : 'Search'}</button>
                </div>
            </div>
        </div>
        {keywordResults && (
            <div className="grid gap-6">
                {['questions', 'prepositions', 'general'].map(type => {
                    if (keywordResults[type].length === 0) return null;
                    return (
                        <div key={type} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-200 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold capitalize text-gray-700 dark:text-gray-300">{type}</h3>
                                <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">{keywordResults[type].length}</span>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                <div className="hidden sm:flex p-2 text-xs text-gray-400 font-semibold uppercase tracking-wider"><div className="flex-grow pl-2">Keyword</div><div className="w-20 text-center">Volume</div><div className="w-20 text-center">Diff.</div><div className="w-10"></div></div>
                                {keywordResults[type].map((item: any, i: any) => {
                                    const isSaved = savedKeywords.includes(item.keyword);
                                    return (
                                        <div key={i} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group gap-2 sm:gap-0">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-grow truncate">{item.keyword}</span>
                                            <div className="flex items-center justify-between sm:justify-end sm:gap-4 w-full sm:w-auto">
                                                <div className="flex gap-3 sm:gap-4 text-xs">
                                                    <div className="flex items-center gap-1 text-gray-500 w-16 justify-end"><BarChart2 size={12} />{item.volume >= 1000 ? (item.volume/1000).toFixed(1) + 'k' : item.volume}</div>
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full w-16 justify-center border ${getDifficultyColor(item.difficulty)}`}><TrendingUp size={10} />{item.difficulty}</div>
                                                </div>
                                                <button onClick={() => toggleKeyword(item.keyword)} className={`p-1.5 rounded-lg transition-all ml-2 ${isSaved ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400 hover:text-indigo-600'}`}>{isSaved ? <Trash2 size={16} /> : <Plus size={16} />}</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};
