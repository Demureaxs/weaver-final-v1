import React, { useState } from 'react';
import { X, Sparkles, User, Globe, ChevronRight, ChevronLeft, Check, BookOpen, Wand2 } from 'lucide-react';
import { Book, Character, WorldItem } from '../../lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface BookSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookData: Partial<Book>, characters: Partial<Character>[], worldItems: Partial<WorldItem>[], generateDraft: boolean) => void;
  userApiKey?: string;
}

export const BookSetupModal = ({ isOpen, onClose, onSave, userApiKey }: BookSetupModalProps) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Step 1: Concept
  const [concept, setConcept] = useState({
    title: '',
    genre: '',
    tone: '',
    storyArc: '',
    summary: '',
  });

  // Step 2: Cast
  const [characters, setCharacters] = useState<Partial<Character>[]>([
    { name: '', role: 'Protagonist', archetype: '', description: '' },
    { name: '', role: 'Antagonist', archetype: '', description: '' },
  ]);

  // Step 3: World
  const [worldItems, setWorldItems] = useState<Partial<WorldItem>[]>([{ name: '', category: 'Location', description: '' }]);

  const handleConceptChange = (field: string, value: string) => {
    setConcept((prev) => ({ ...prev, [field]: value }));
  };

  const handleCharacterChange = (index: number, field: string, value: string) => {
    const newChars = [...characters];
    newChars[index] = { ...newChars[index], [field]: value };
    setCharacters(newChars);
  };

  const addCharacter = () => {
    setCharacters([...characters, { name: '', role: 'Supporting', archetype: '', description: '' }]);
  };

  const removeCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const handleWorldItemChange = (index: number, field: string, value: string) => {
    const newItems = [...worldItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setWorldItems(newItems);
  };

  const addWorldItem = () => {
    setWorldItems([...worldItems, { name: '', category: 'Location', description: '' }]);
  };

  const removeWorldItem = (index: number) => {
    setWorldItems(worldItems.filter((_, i) => i !== index));
  };

  const handleFinish = (generateDraft: boolean) => {
    onSave(concept, characters, worldItems, generateDraft);
    onClose();
  };

  // AI Helper
  const generateIdea = async (field: string, promptContext: string) => {
    setIsGenerating(true);
    try {
      const apiKey = userApiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      if (!apiKey) return;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Generate a creative ${field} for a ${concept.genre || 'fiction'} story. Context: ${promptContext}. Return only the text.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (text) handleConceptChange(field, text.trim());
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in'>
      <div className='bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col m-4'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-200 dark:bg-gray-900/50 flex justify-between items-center'>
          <div>
            <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>New Book Setup</h2>
            <p className='text-xs text-gray-500'>Step {step} of 4</p>
          </div>
          <div className='flex gap-2'>
            {/* Step Indicators */}
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 w-8 rounded-full transition-colors ${step >= s ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500'>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className='flex-grow overflow-y-auto p-8'>
          {/* STEP 1: CONCEPT */}
          {step === 1 && (
            <div className='space-y-6 animate-fade-in'>
              <div className='text-center mb-8'>
                <div className='inline-block p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 mb-3'>
                  <BookOpen size={32} />
                </div>
                <h3 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>The Core Concept</h3>
                <p className='text-gray-500'>Every great story starts with a seed. Let's plant yours.</p>
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-xs font-bold text-gray-500 uppercase'>Book Title</label>
                  <input
                    value={concept.title}
                    onChange={(e) => handleConceptChange('title', e.target.value)}
                    className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
                    placeholder='The Lost City of...'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-xs font-bold text-gray-500 uppercase'>Genre</label>
                  <input
                    value={concept.genre}
                    onChange={(e) => handleConceptChange('genre', e.target.value)}
                    className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
                    placeholder='Fantasy, Sci-Fi, Thriller...'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-xs font-bold text-gray-500 uppercase'>Story Arc / Logline</label>
                <div className='relative'>
                  <textarea
                    value={concept.storyArc}
                    onChange={(e) => handleConceptChange('storyArc', e.target.value)}
                    className='w-full h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 resize-none'
                    placeholder='A young farm boy discovers he is the chosen one...'
                  />
                  <button
                    onClick={() => generateIdea('storyArc', concept.genre)}
                    className='absolute bottom-3 right-3 p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors'
                    title='Generate Idea'
                  >
                    <Wand2 size={16} className={isGenerating ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CAST */}
          {step === 2 && (
            <div className='space-y-6 animate-fade-in'>
              <div className='text-center mb-8'>
                <div className='inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 mb-3'>
                  <User size={32} />
                </div>
                <h3 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>The Cast</h3>
                <p className='text-gray-500'>Who are the key players in this tale?</p>
              </div>

              <div className='space-y-4'>
                {characters.map((char, idx) => (
                  <div key={idx} className='bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative group'>
                    <div className='grid grid-cols-12 gap-4'>
                      <div className='col-span-4'>
                        <label className='text-[10px] font-bold text-gray-400 uppercase'>Name</label>
                        <input
                          value={char.name}
                          onChange={(e) => handleCharacterChange(idx, 'name', e.target.value)}
                          className='w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm'
                          placeholder='Name'
                        />
                      </div>
                      <div className='col-span-3'>
                        <label className='text-[10px] font-bold text-gray-400 uppercase'>Role</label>
                        <select
                          value={char.role}
                          onChange={(e) => handleCharacterChange(idx, 'role', e.target.value)}
                          className='w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm'
                        >
                          <option>Protagonist</option>
                          <option>Antagonist</option>
                          <option>Supporting</option>
                          <option>Mentor</option>
                        </select>
                      </div>
                      <div className='col-span-5'>
                        <label className='text-[10px] font-bold text-gray-400 uppercase'>Description</label>
                        <input
                          value={char.description}
                          onChange={(e) => handleCharacterChange(idx, 'description', e.target.value)}
                          className='w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm'
                          placeholder='Brief description...'
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeCharacter(idx)}
                      className='absolute -top-2 -right-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addCharacter}
                  className='w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors font-bold flex items-center justify-center gap-2'
                >
                  <User size={16} /> Add Character
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: WORLD */}
          {step === 3 && (
            <div className='space-y-6 animate-fade-in'>
              <div className='text-center mb-8'>
                <div className='inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 mb-3'>
                  <Globe size={32} />
                </div>
                <h3 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>The World</h3>
                <p className='text-gray-500'>Where does this story take place?</p>
              </div>

              <div className='space-y-4'>
                {worldItems.map((item, idx) => (
                  <div key={idx} className='bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative group'>
                    <div className='grid grid-cols-12 gap-4'>
                      <div className='col-span-4'>
                        <label className='text-[10px] font-bold text-gray-400 uppercase'>Name</label>
                        <input
                          value={item.name}
                          onChange={(e) => handleWorldItemChange(idx, 'name', e.target.value)}
                          className='w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm'
                          placeholder='Location Name'
                        />
                      </div>
                      <div className='col-span-3'>
                        <label className='text-[10px] font-bold text-gray-400 uppercase'>Category</label>
                        <select
                          value={item.category}
                          onChange={(e) => handleWorldItemChange(idx, 'category', e.target.value)}
                          className='w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm'
                        >
                          <option>Location</option>
                          <option>Lore</option>
                          <option>Faction</option>
                        </select>
                      </div>
                      <div className='col-span-5'>
                        <label className='text-[10px] font-bold text-gray-400 uppercase'>Description</label>
                        <input
                          value={item.description}
                          onChange={(e) => handleWorldItemChange(idx, 'description', e.target.value)}
                          className='w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm'
                          placeholder='Brief description...'
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeWorldItem(idx)}
                      className='absolute -top-2 -right-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addWorldItem}
                  className='w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors font-bold flex items-center justify-center gap-2'
                >
                  <Globe size={16} /> Add Location
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className='space-y-6 animate-fade-in text-center'>
              <div className='mb-8'>
                <div className='inline-block p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 mb-3'>
                  <Sparkles size={32} />
                </div>
                <h3 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>Ready to Write?</h3>
                <p className='text-gray-500'>We have everything we need to start your journey.</p>
              </div>

              <div className='grid grid-cols-2 gap-4 max-w-lg mx-auto'>
                <button
                  onClick={() => handleFinish(false)}
                  className='p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex flex-col items-center gap-3 group'
                >
                  <BookOpen size={32} className='text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200' />
                  <span className='font-bold text-gray-700 dark:text-gray-200'>Just Create Book</span>
                  <span className='text-xs text-gray-400'>I'll write the first chapter myself.</span>
                </button>

                <button
                  onClick={() => handleFinish(true)}
                  className='p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col items-center gap-3 group relative overflow-hidden'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity' />
                  <Sparkles size={32} className='text-purple-600 relative z-10' />
                  <span className='font-bold text-purple-700 dark:text-purple-300 relative z-10'>Generate Draft</span>
                  <span className='text-xs text-purple-500 relative z-10'>AI writes Chapter 1 (10 Credits)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className='p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center'>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className='flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-bold px-4 py-2 rounded-lg transition-colors'
            >
              <ChevronLeft size={18} /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!concept.title}
              className='flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              Next Step <ChevronRight size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
