import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, RefreshCw, Check, Bookmark, FileText } from 'lucide-react';
import { Chapter } from '../../lib/types';
import { GoogleGenAI } from '@google/genai';

interface ChapterContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Chapter>) => void;
  initialData?: Chapter;
  userApiKey?: string;
  bookTitle?: string;
}

export const ChapterContextModal = ({ isOpen, onClose, onSave, initialData, userApiKey, bookTitle }: ChapterContextModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    targetWordCount: 1000,
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        summary: initialData.summary || '',
        targetWordCount: initialData.targetWordCount || 1000,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const apiKey = userApiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

      if (!apiKey) {
        console.error('Google API key not found. Please set NEXT_PUBLIC_GOOGLE_API_KEY in .env');
        alert('AI generation failed: API key not configured');
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Generate a concise chapter summary/breakdown for a chapter titled "${formData.title}" in the book "${bookTitle || 'Unknown'}". 
      User Context/Input: "${aiPrompt}". 
      Return ONLY the text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text;
      if (text) {
        handleChange('summary', text.trim());
      }
      setAiPrompt('');
    } catch (e) {
      console.error('AI Generation failed', e);
      alert('AI generation failed. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in'>
      <div className='bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto m-4'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-200 dark:bg-gray-900/50 sticky top-0 z-10'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
              <Bookmark size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>Chapter Settings</h2>
              <p className='text-xs text-gray-500'>Define the focus of this chapter</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors'>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-8 space-y-6'>
          {/* Title */}
          <div className='space-y-2'>
            <label className='text-xs font-bold text-gray-500 uppercase flex items-center gap-2'>
              <FileText size={12} /> Chapter Title
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. Chapter 1: The Beginning'
            />
          </div>

          {/* Summary / Breakdown */}
          <div className='space-y-2'>
            <div className='flex justify-between items-end'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Chapter Summary / Breakdown</label>
              <span className='text-[10px] text-blue-500 flex items-center gap-1'>
                <Sparkles size={10} /> AI Enabled
              </span>
            </div>
            <div className='relative'>
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                className='w-full h-32 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2'
                placeholder='What happens in this chapter? Key plot points...'
              />

              {/* AI Toolbar */}
              <div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2 flex gap-2 items-center border border-blue-100 dark:border-blue-800/50'>
                <div className='bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm'>
                  <Wand2 size={14} className='text-blue-500' />
                </div>
                <input
                  type='text'
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="AI Prompt: 'Summarize the conflict between Bob and the AI'..."
                  className='flex-grow bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400'
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className='p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
                >
                  {isGenerating ? <RefreshCw size={14} className='animate-spin' /> : <Sparkles size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Target Word Count Slider */}
        <div className='p-8 pt-0 space-y-2'>
          <div className='flex justify-between items-center'>
            <label className='text-xs font-bold text-gray-500 uppercase'>Target Word Count</label>
            <span className='text-sm font-bold text-blue-600 dark:text-blue-400'>{formData.targetWordCount} words</span>
          </div>
          <input
            type='range'
            min='500'
            max='5000'
            step='100'
            value={formData.targetWordCount}
            onChange={(e) => handleChange('targetWordCount', parseInt(e.target.value))}
            className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
          />
          <div className='flex justify-between text-xs text-gray-400'>
            <span>500</span>
            <span>2750</span>
            <span>5000</span>
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 sticky bottom-0'>
          <button onClick={onClose} className='px-6 py-3 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300 transition-colors'>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className='px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] flex items-center gap-2'
          >
            <Check size={18} /> Update Chapter
          </button>
        </div>
      </div>
    </div>
  );
};
