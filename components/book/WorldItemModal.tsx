import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Wand2, RefreshCw, Check, MapPin, Scroll, Zap, Monitor, Flag, Globe } from 'lucide-react';
import { WorldItem, WorldCategory } from '../../lib/types'; // Assuming WorldCategory is defined here or in a similar types file
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import Generative AI

interface WorldItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (worldItem: WorldItem) => void;
  initialData?: WorldItem;
  bookTitle?: string; // Context for AI generation
  userApiKey?: string; // API key for AI if needed
  existingCategories: WorldCategory[];
}

const WORLD_CATEGORIES: WorldCategory[] = ['Location', 'Lore', 'Magic', 'Tech', 'Faction'];

const CategoryIcon = ({ category, size = 16 }: { category: WorldCategory; size?: number }) => {
  switch (category) {
    case 'Location':
      return <MapPin size={size} className='text-emerald-500' />;
    case 'Lore':
      return <Scroll size={size} className='text-amber-500' />;
    case 'Magic':
    case 'Faction': // Faction also uses Zap icon
      return <Zap size={size} className='text-purple-500' />;
    case 'Tech':
      return <Monitor size={size} className='text-blue-500' />;
    default:
      return <Globe size={size} className='text-gray-500' />;
  }
};


export const WorldItemModal = ({ isOpen, onClose, onSave, initialData, bookTitle, userApiKey, existingCategories }: WorldItemModalProps) => {
  const [formData, setFormData] = useState<WorldItem>(
    initialData || {
      id: '',
      bookId: '', // This will be set by the parent component
      name: '',
      category: 'Location', // Default category
      description: '',
    }
  );

  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [activeField, setActiveField] = useState<string>(''); // To track which field AI is generating for
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: '',
        bookId: '',
        name: '',
        category: 'Location',
        description: '',
      });
    }
    setAiPrompt('');
    setActiveField('');
    setIsGenerating(false);
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.name || !formData.description || !formData.category) {
      alert('Please fill in all required fields (Name, Category, Description).');
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleAiGenerate = async (field: 'name' | 'description') => {
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

      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

      let fullPrompt = '';
      if (field === 'name') {
        fullPrompt = `Generate a concise, creative name (2-5 words) for a ${formData.category.toLowerCase()} based on the following input: "${aiPrompt}". Context: ${bookTitle ? `for a book titled "${bookTitle}".` : ''} Return ONLY the name.`;
      } else if (field === 'description') {
        fullPrompt = `Generate a detailed (max 100 words) description for a ${formData.category.toLowerCase()} named "${formData.name}" based on the following input: "${aiPrompt}". Context: ${bookTitle ? `for a book titled "${bookTitle}".` : ''} Return ONLY the description.`;
      }

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      if (text) {
        setFormData((prev) => ({ ...prev, [field]: text.trim() }));
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
      <div className='bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto m-4'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-200 dark:bg-gray-900/50 sticky top-0 z-10'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
              <CategoryIcon category={formData.category} size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>{initialData?.id ? 'Edit World Item' : 'Create World Item'}</h2>
              <p className='text-xs text-gray-500'>Define an element of your world</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors'>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-8 space-y-6'>
          {/* Category */}
          <div className='space-y-2'>
            <label htmlFor='category' className='text-xs font-bold text-gray-500 uppercase'>Category</label>
            <select
              id='category'
              name='category'
              value={formData.category}
              onChange={handleChange}
              className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
            >
              {WORLD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className='space-y-2'>
            <div className='flex justify-between items-end'>
                <label htmlFor='name' className='text-xs font-bold text-gray-500 uppercase'>Name</label>
                <span className='text-[10px] text-purple-500 flex items-center gap-1'>
                    <Sparkles size={10} /> AI Enabled
                </span>
            </div>
            <div className='relative'>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='e.g., Elysium City, The Shadow Weave, Galactic Empire'
              />
              {/* AI Toolbar */}
              <div className='bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2 flex gap-2 items-center border border-purple-100 dark:border-purple-800/50 mt-2'>
                <div className='bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm'>
                  <Wand2 size={14} className='text-purple-500' />
                </div>
                <input
                  type='text'
                  value={activeField === 'name' ? aiPrompt : ''}
                  onChange={(e) => {
                    setActiveField('name');
                    setAiPrompt(e.target.value);
                  }}
                  placeholder="AI Prompt: 'futuristic city', 'ancient magic system'..."
                  className='flex-grow bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400'
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate('name')}
                />
                <button
                  onClick={() => handleAiGenerate('name')}
                  disabled={isGenerating || (activeField === 'name' && !aiPrompt.trim())}
                  className='p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors'
                >
                  {isGenerating && activeField === 'name' ? <RefreshCw size={14} className='animate-spin' /> : <Sparkles size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <div className='flex justify-between items-end'>
                <label htmlFor='description' className='text-xs font-bold text-gray-500 uppercase'>Description</label>
                <span className='text-[10px] text-purple-500 flex items-center gap-1'>
                    <Sparkles size={10} /> AI Enabled
                </span>
            </div>
            <div className='relative'>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 resize-y'
                placeholder='A brief explanation of this world item and its significance...'
              />
              {/* AI Toolbar */}
              <div className='bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2 flex gap-2 items-center border border-purple-100 dark:border-purple-800/50 mt-2'>
                <div className='bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm'>
                  <Wand2 size={14} className='text-purple-500' />
                </div>
                <input
                  type='text'
                  value={activeField === 'description' ? aiPrompt : ''}
                  onChange={(e) => {
                    setActiveField('description');
                    setAiPrompt(e.target.value);
                  }}
                  placeholder="AI Prompt: 'city powered by steam', 'magic that controls weather'..."
                  className='flex-grow bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400'
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate('description')}
                />
                <button
                  onClick={() => handleAiGenerate('description')}
                  disabled={isGenerating || (activeField === 'description' && !aiPrompt.trim())}
                  className='p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors'
                >
                  {isGenerating && activeField === 'description' ? <RefreshCw size={14} className='animate-spin' /> : <Sparkles size={14} />}
                </button>
              </div>
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
            <Save size={18} /> {initialData?.id ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </div>
    </div>
  );
};