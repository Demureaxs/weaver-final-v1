
import React, { useState } from 'react';
import { Type, List, Image, HelpCircle, Link2, Sparkles, Eye, Settings, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { Typewriter } from '../components/ui/Typewriter';
import { SimpleMarkdown } from '../components/editor/SimpleMarkdown';

export const GeneratorView = ({
    keyword, setKeyword,
    wordCount, setWordCount,
    sectionCount, setSectionCount,
    bodyImageCount, setBodyImageCount,
    includeFaq, setIncludeFaq,
    includeImage, setIncludeImage,
    savedKeywords, savedSitemaps,
    generateBlog,
    status, statusMessage,
    activeTab, setActiveTab,
    generatedContent, setGeneratedContent,
    isStreaming, setIsStreaming,
    handleRefineCreditDeduction,
    copyToClipboard
}: any) => {
  const [isKeywordDropdownOpen, setIsKeywordDropdownOpen] = useState(false);

  return (
    <div className="animate-fade-in">
        <div className={`${activeTab === 'editor' ? 'block' : 'hidden'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 bg-gray-200 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <Sparkles className="text-indigo-500" size={20} />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Content Generator</h2>
                </div>
                <div className="p-6 space-y-8">
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Topic</label>
                    
                    {/* Click-Based Combobox for Topic Selection */}
                    <div className="relative">
                        <input 
                            type="text" 
                            value={keyword} 
                            onChange={(e) => setKeyword(e.target.value)} 
                            placeholder="e.g., Sustainable Gardening" 
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 pl-5 pr-10 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                        />
                        
                        {/* Dropdown Trigger if saved keywords exist */}
                        {savedKeywords.length > 0 && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <button 
                                    onClick={() => setIsKeywordDropdownOpen(!isKeywordDropdownOpen)}
                                    className="p-2 text-gray-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-indigo-50"
                                    title="Select saved keyword"
                                >
                                    {isKeywordDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                
                                {/* Click-based Dropdown */}
                                {isKeywordDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setIsKeywordDropdownOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 top-full mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-1 z-50">
                                            <div className="text-xs font-bold text-gray-400 px-3 py-2 uppercase border-b border-gray-100 dark:border-gray-700">Saved Keywords</div>
                                            {savedKeywords.map((kw: any, i: any) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => {
                                                        setKeyword(kw);
                                                        setIsKeywordDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 truncate transition-colors"
                                                >
                                                    {kw}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4"><div className="flex justify-between items-center"><label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300"><Type size={16} /> Word Count</label><span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-md">~{wordCount}</span></div><input type="range" min="300" max="2000" step="100" value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" /></div>
                    <div className="space-y-4"><div className="flex justify-between items-center"><label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300"><List size={16} /> Sections</label><span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded-md">{sectionCount}</span></div><input type="range" min="2" max="8" step="1" value={sectionCount} onChange={(e) => setSectionCount(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600" /></div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300"><Image size={16} /> Body Images</label><span className="bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 text-xs font-bold px-2 py-1 rounded-md">{bodyImageCount}</span></div>
                        <input type="range" min="0" max="3" step="1" value={bodyImageCount} onChange={(e) => setBodyImageCount(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-600" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                    <button onClick={() => setIncludeFaq(!includeFaq)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${includeFaq ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:border-gray-300'}`}><HelpCircle size={24} className="mb-2" /><span className="text-sm font-semibold">Include FAQ</span></button>
                    <button onClick={() => setIncludeImage(!includeImage)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${includeImage ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300' : 'border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:border-gray-300'}`}><Image size={24} className="mb-2" /><span className="text-sm font-semibold">AI Header Image</span></button>
                    </div>
                    {savedSitemaps.length > 0 && <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900 flex items-start gap-3"><Link2 size={18} className="text-green-600 mt-0.5" /><div><h4 className="text-sm font-bold text-green-800 dark:text-green-300">Internal Linking Active</h4><p className="text-xs text-green-600 dark:text-green-400 mt-1">Found {savedSitemaps.length} pages.</p></div></div>}

                    <button onClick={generateBlog} disabled={!keyword.trim()} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"><Sparkles size={20} /> Generate Blog Post (10 Credits)</button>
                    {status === 'success' && (
                        <button onClick={() => setActiveTab('preview')} className="w-full bg-white dark:bg-gray-700 border-2 border-indigo-100 dark:border-gray-600 text-indigo-600 dark:text-indigo-300 font-bold py-4 rounded-xl shadow-sm hover:bg-indigo-50 dark:hover:bg-gray-600 flex items-center justify-center gap-2 mt-3 transition-colors"><Eye size={20} /> View Current Preview</button>
                    )}
                </div>
            </div>
        </div>

        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'}`}>
            {status === 'generating' && <div className="flex flex-col items-center justify-center py-20 space-y-6"><div className="relative w-24 h-24"><div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 dark:border-gray-700 rounded-full animate-pulse"></div><div className="absolute top-0 left-0 w-full h-full border-t-4 border-indigo-600 rounded-full animate-spin"></div></div><p className="text-gray-500 dark:text-gray-400 text-sm">{statusMessage}</p></div>}
            {status === 'success' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"><button onClick={() => setActiveTab('editor')} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Settings size={16} /> Edit Config</button><button id="copy-btn" onClick={copyToClipboard} className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"><Copy size={16} /> Copy Markdown</button></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 min-h-[60vh]">
                        {isStreaming ? <Typewriter text={generatedContent} onComplete={() => setIsStreaming(false)} /> : <SimpleMarkdown content={generatedContent} onContentChange={setGeneratedContent} onDeductCredit={handleRefineCreditDeduction} />}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
