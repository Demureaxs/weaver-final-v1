import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, RefreshCw, Check, BookOpen, Map, Palette } from 'lucide-react';
import { Book } from '../../lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface BookContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Book>) => void;
  initialData?: Book;
  userApiKey?: string;
}

export const BookContextModal = ({ isOpen, onClose, onSave, initialData, userApiKey }: BookContextModalProps) => {
  const [formData, setFormData] = useState({
    summary: '',
    storyArc: '',
    tone: '',
    setting: '',
    totalTargetWords: 0,
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [activeField, setActiveField] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        summary: initialData.summary || '',
        storyArc: initialData.storyArc || '',
        tone: initialData.tone || '',
        setting: initialData.setting || '',
        totalTargetWords: initialData.totalTargetWords || 0,
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

  const handleAiGenerate = async (field: string) => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setActiveField(field);

    try {
      const apiKey = userApiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

      if (!apiKey) {
        console.error('Google API key not found. Please set NEXT_PUBLIC_GOOGLE_API_KEY in .env');
        alert('AI generation failed: API key not configured');
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Generate a concise (max 50 words) ${field} description for a book titled "${initialData?.title || 'Unknown'}" (${
        initialData?.genre || 'Unknown genre'
      }). 
      User Context/Input: "${aiPrompt}". 
      Return ONLY the text.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      if (text) {
        handleChange(field, text.trim());
      }
      setAiPrompt('');
    } catch (e) {
      console.error('AI Generation failed', e);
      alert('AI generation failed. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
      setActiveField('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in'>
      <div className='bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto m-4'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-200 dark:bg-gray-900/50 sticky top-0 z-10'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>Story Settings</h2>
              <p className='text-xs text-gray-500'>Define the core pillars of your narrative</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors'>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-8 space-y-6'>
          {/* Tone & Logline */}
          <div className='grid grid-cols-1 gap-6'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <label className='text-xs font-bold text-gray-500 uppercase flex items-center gap-2'>
                  <Palette size={12} /> Tone / Atmosphere
                </label>
              </div>
              <input
                type='text'
                value={formData.tone}
                onChange={(e) => handleChange('tone', e.target.value)}
                className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='e.g. Gritty, Hopeful, Fast-paced, Whimsical'
              />
            </div>
          </div>

          {/* Story Arc */}
          <div className='space-y-2'>
            <div className='flex justify-between items-end'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Story Arc (The Grand Plot)</label>
              <span className='text-[10px] text-purple-500 flex items-center gap-1'>
                <Sparkles size={10} /> AI Enabled
              </span>
            </div>
            <div className='relative'>
              <textarea
                value={formData.storyArc}
                onChange={(e) => handleChange('storyArc', e.target.value)}
                className='w-full h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2'
                placeholder='Describe the main conflict and resolution...'
              />

              {/* AI Toolbar */}
              <div className='bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2 flex gap-2 items-center border border-purple-100 dark:border-purple-800/50'>
                <div className='bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm'>
                  <Wand2 size={14} className='text-purple-500' />
                </div>
                <input
                  type='text'
                  value={activeField === 'storyArc' ? aiPrompt : ''}
                  onChange={(e) => {
                    setActiveField('storyArc');
                    setAiPrompt(e.target.value);
                  }}
                  placeholder="AI Prompt: 'Hero's journey set in space'..."
                  className='flex-grow bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400'
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate('storyArc')}
                />
                <button
                  onClick={() => handleAiGenerate('storyArc')}
                  disabled={isGenerating || (activeField === 'storyArc' && !aiPrompt.trim())}
                  className='p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors'
                >
                  {isGenerating && activeField === 'storyArc' ? <RefreshCw size={14} className='animate-spin' /> : <Sparkles size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Setting / Environment */}
          <div className='space-y-2'>
            <div className='flex justify-between items-end'>
              <label className='text-xs font-bold text-gray-500 uppercase flex items-center gap-2'>
                <Map size={12} /> Setting / Environment
              </label>
              <span className='text-[10px] text-purple-500 flex items-center gap-1'>
                <Sparkles size={10} /> AI Enabled
              </span>
            </div>
            <div className='relative'>
              <textarea
                value={formData.setting}
                onChange={(e) => handleChange('setting', e.target.value)}
                className='w-full h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2'
                placeholder='Describe the world, time period, and atmosphere...'
              />
              {/* AI Toolbar */}
              <div className='bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2 flex gap-2 items-center border border-purple-100 dark:border-purple-800/50'>
                <div className='bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm'>
                  <Wand2 size={14} className='text-purple-500' />
                </div>
                <input
                  type='text'
                  value={activeField === 'setting' ? aiPrompt : ''}
                  onChange={(e) => {
                    setActiveField('setting');
                    setAiPrompt(e.target.value);
                  }}
                  placeholder="AI Prompt: 'Cyberpunk London in 2099'..."
                  className='flex-grow bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400'
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate('setting')}
                />
                <button
                  onClick={() => handleAiGenerate('setting')}
                  disabled={isGenerating || (activeField === 'setting' && !aiPrompt.trim())}
                  className='p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors'
                >
                  {isGenerating && activeField === 'setting' ? <RefreshCw size={14} className='animate-spin' /> : <Sparkles size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Total Target Word Count */}
        <div className='p-8 pt-0 space-y-2'>
          <label className='text-xs font-bold text-gray-500 uppercase'>Total Book Word Count Target</label>
          <input
            type='number'
            min='500'
            max='500000'
            step='1000'
            value={formData.totalTargetWords}
            onChange={(e) => handleChange('totalTargetWords', parseInt(e.target.value) || 0)}
            className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
            placeholder='e.g. 80000'
          />
          <p className='text-xs text-gray-400'>Recommended: Short story (5k-20k), Novella (20k-50k), Novel (50k-120k)</p>
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 sticky bottom-0'>
          <button onClick={onClose} className='px-6 py-3 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300 transition-colors'>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className='px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] flex items-center gap-2'
          >
            <Check size={18} /> Update Settings
          </button>
        </div>
      </div>
    </div>
  );
};
