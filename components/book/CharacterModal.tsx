import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, RefreshCw, Check, User, Palette } from 'lucide-react';
import { Character } from '../../lib/types';
import { GoogleGenAI } from '@google/genai';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Character) => void;
  initialData?: Character | null;
  userApiKey?: string;
}

// --- CONSTANTS ---
const AVATAR_COLORS = [
  'gray',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];
const CHARACTER_ROLES = ['Protagonist', 'Antagonist', 'Deuteragonist', 'Mentor', 'Love Interest', 'Supporting', 'Extra'];

export const CharacterModal = ({ isOpen, onClose, onSave, initialData, userApiKey }: CharacterModalProps) => {
  const [formData, setFormData] = useState<Character>({
    id: '',
    bookId: '',
    name: '',
    role: 'Supporting',
    archetype: '',
    description: '',
    motivation: '',
    flaw: '',
    traits: [],
    avatarColor: 'gray',
  });

  const [traitsInput, setTraitsInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setTraitsInput(initialData.traits.join(', '));
    } else {
      // Reset for new character
      setFormData({
        id: Date.now().toString(),
        bookId: '',
        name: '',
        role: 'Supporting',
        archetype: '',
        description: '',
        motivation: '',
        flaw: '',
        traits: [],
        avatarColor: 'blue',
      });
      setTraitsInput('');
    }
  }, [initialData, isOpen]);

  const handleChange = (field: keyof Character, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const traits = traitsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);
    onSave({ ...formData, traits });
    onClose();
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const apiKey = userApiKey || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey });

      const prompt = `Generate a short, compelling character description (max 50 words) for a "${formData.role}" character named "${
        formData.name || 'Unknown'
      }". Context/Prompt: ${aiPrompt}. Return ONLY the text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text;
      if (text) {
        setFormData((prev) => ({ ...prev, description: text.trim() }));
      }
      setAiPrompt('');
    } catch (e) {
      console.error('AI Generation failed', e);
      // Fallback for demo or error
      setFormData((prev) => ({ ...prev, description: `(AI Demo) Generated description based on: ${aiPrompt}` }));
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
            <div
              className={`p-2 rounded-xl bg-${formData.avatarColor}-100 text-${formData.avatarColor}-600 dark:bg-${formData.avatarColor}-900/30 dark:text-${formData.avatarColor}-400 transition-colors`}
            >
              <User size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>{initialData ? 'Edit Character' : 'Create Character'}</h2>
              <p className='text-xs text-gray-500'>Define your story's cast</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors'>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-8 space-y-6'>
          {/* Row 1: Name & Role */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Character Name</label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='e.g. John Doe'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 appearance-none'
              >
                {CHARACTER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Archetype & Color */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Archetype</label>
              <input
                type='text'
                value={formData.archetype || ''}
                onChange={(e) => handleChange('archetype', e.target.value)}
                className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='e.g. The Reluctant Hero'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-xs font-bold text-gray-500 uppercase flex items-center gap-2'>
                <Palette size={12} /> Avatar Color
              </label>
              <div className='flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700'>
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleChange('avatarColor', c)}
                    className={`w-6 h-6 rounded-full bg-${c}-400 hover:scale-110 transition-transform ring-2 ${
                      formData.avatarColor === c ? 'ring-offset-2 ring-purple-500' : 'ring-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description with AI Assist */}
          <div className='space-y-2'>
            <div className='flex justify-between items-end'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Description / Bio</label>
              <span className='text-[10px] text-purple-500 flex items-center gap-1'>
                <Sparkles size={10} /> AI Enabled
              </span>
            </div>
            <div className='relative'>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className='w-full h-32 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2'
                placeholder='Describe appearance, personality, and background...'
              />

              {/* AI Toolbar */}
              <div className='bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2 flex gap-2 items-center border border-purple-100 dark:border-purple-800/50'>
                <div className='bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm'>
                  <Wand2 size={14} className='text-purple-500' />
                </div>
                <input
                  type='text'
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="AI Prompt: 'Make them sound mysterious' or 'Generate bio from name'..."
                  className='flex-grow bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400'
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className='p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors'
                >
                  {isGenerating ? <RefreshCw size={14} className='animate-spin' /> : <Sparkles size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Motivation & Flaw */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Motivation (Goal)</label>
              <input
                type='text'
                value={formData.motivation || ''}
                onChange={(e) => handleChange('motivation', e.target.value)}
                className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='What do they want?'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-xs font-bold text-gray-500 uppercase'>Flaw (Weakness)</label>
              <input
                type='text'
                value={formData.flaw || ''}
                onChange={(e) => handleChange('flaw', e.target.value)}
                className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='What holds them back?'
              />
            </div>
          </div>

          {/* Traits */}
          <div className='space-y-2'>
            <label className='text-xs font-bold text-gray-500 uppercase'>Traits (Comma separated)</label>
            <input
              type='text'
              value={traitsInput}
              onChange={(e) => setTraitsInput(e.target.value)}
              className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
              placeholder='Brave, Loyal, Stubborn...'
            />
            <div className='flex flex-wrap gap-2 mt-2'>
              {traitsInput
                .split(',')
                .filter((t) => t.trim())
                .map((t, i) => (
                  <span
                    key={i}
                    className='text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600'
                  >
                    {t.trim()}
                  </span>
                ))}
            </div>
          </div>
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
            <Check size={18} /> Save Character
          </button>
        </div>
      </div>
    </div>
  );
};
