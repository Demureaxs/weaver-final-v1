import React, { useState } from 'react';
import { X, Sparkles, Check, BookOpen } from 'lucide-react';

interface ChapterGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  onGenerated: () => void;
}

export const ChapterGenerationModal: React.FC<ChapterGenerationModalProps> = ({ isOpen, onClose, bookId, onGenerated }) => {
  const [chapterCount, setChapterCount] = useState(10);
  const [averageWordCount, setAverageWordCount] = useState(2000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const totalWords = chapterCount * averageWordCount;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`/api/books/${bookId}/generate-chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterCount,
          averageWordCount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate chapters');
      }

      onGenerated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate chapters');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in'>
      <div className='bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 m-4'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-white/20'>
              <Sparkles size={24} className='text-white' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>AI Chapter Generation</h2>
              <p className='text-xs text-white/80'>Generate chapter outlines based on your story arc</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-white/10 rounded-full text-white transition-colors'>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-8 space-y-6'>
          {/* Number of Chapters */}
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Number of Chapters</label>
              <span className='text-sm font-bold text-purple-600 dark:text-purple-400'>{chapterCount} chapters</span>
            </div>
            <input
              type='range'
              min='1'
              max='50'
              step='1'
              value={chapterCount}
              onChange={(e) => setChapterCount(parseInt(e.target.value))}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
            <div className='flex justify-between text-xs text-gray-400'>
              <span>1</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          {/* Average Words Per Chapter */}
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Average Words Per Chapter</label>
              <span className='text-sm font-bold text-purple-600 dark:text-purple-400'>{averageWordCount} words</span>
            </div>
            <input
              type='range'
              min='500'
              max='5000'
              step='100'
              value={averageWordCount}
              onChange={(e) => setAverageWordCount(parseInt(e.target.value))}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
            <div className='flex justify-between text-xs text-gray-400'>
              <span>500</span>
              <span>2750</span>
              <span>5000</span>
            </div>
          </div>

          {/* Total Calculation */}
          <div className='bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/50'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <BookOpen size={16} className='text-purple-600 dark:text-purple-400' />
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>Estimated Total</span>
              </div>
              <span className='text-lg font-bold text-purple-600 dark:text-purple-400'>{totalWords.toLocaleString()} words</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className='px-6 py-3 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className='px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isGenerating ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Generating...
              </>
            ) : (
              <>
                <Check size={18} />
                Generate Chapters
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
