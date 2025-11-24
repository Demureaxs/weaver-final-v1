import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { formatText } from '../../lib/utils';

export const EditableBlock = (props: any) => {
  const { initialContent, tag, onSave, index, isStreaming, onDeductCredit, context } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Advanced Prompt State
  const [includePrevious, setIncludePrevious] = useState(false);
  const [includeNext, setIncludeNext] = useState(false);
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([]);

  const { previousContext, nextContext, availableCharacters } = props; // Destructure new props

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);
  const handleSave = () => {
    onSave(index, content);
    setIsEditing(false);
    setAiPrompt('');
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
    setAiPrompt('');
  };

  const handleAiRefine = async () => {
    if (!aiPrompt.trim()) return;

    if (onDeductCredit && !onDeductCredit(1)) return;

    setIsRefining(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

      if (!apiKey) {
        console.error('Google API key not found. Please set NEXT_PUBLIC_GOOGLE_API_KEY in .env');
        setContent(content + '\n\n[AI Error: API key not configured]');
        return;
      }

      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

      let prompt = `Refine the following text based on this instruction: "${aiPrompt}". 
      CRITICAL STYLE RULES: 
      1. Make it sound 100% human. 
      2. ABSOLUTELY NO em-dashes. 
      3. NO buzzwords. 
      Return only text.`;

      if (context) {
        prompt += `\n\nSTORY CONTEXT (Use this to inform the style/content): \n${context}`;
      }

      if (includePrevious && previousContext) {
        prompt += `\n\nPREVIOUS PARAGRAPH (Context): "${previousContext}"`;
      }

      if (includeNext && nextContext) {
        prompt += `\n\nNEXT PARAGRAPH (Context): "${nextContext}"`;
      }

      if (selectedCharIds.length > 0 && availableCharacters) {
        const selectedChars = availableCharacters.filter((c: any) => selectedCharIds.includes(c.id));
        const charContext = selectedChars.map((c: any) => `${c.name} (${c.role}): ${c.description}`).join('; ');
        prompt += `\n\nCHARACTERS PRESENT: ${charContext}`;
      }

      prompt += `\n\nText to refine: "${content}"`;

      console.log('--- REFINEMENT PROMPT ---', prompt);

      const response = await model.generateContent(prompt);

      const refinedText = response.response.text();
      if (refinedText) {
        setContent(refinedText.trim());
      }
      setAiPrompt('');
    } catch (error) {
      console.error('Refinement failed', error);
      alert('AI refinement failed. Please check your API key and try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const renderDisplay = () => {
    let cleanText = content;
    let className = `p-2 rounded-lg transition-colors border border-transparent relative group ${
      !isStreaming ? 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-800' : ''
    }`;
    const handleClick = () => {
      if (!isStreaming) setIsEditing(true);
    };

    if (tag === 'h1')
      return (
        <div onClick={handleClick} className={className}>
          <h1 className='text-3xl font-bold text-indigo-600 dark:text-indigo-400'>{formatText(content.replace(/^#\s/, ''))}</h1>
          {!isStreaming && (
            <Edit3
              size={16}
              className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity'
            />
          )}
        </div>
      );
    if (tag === 'h2')
      return (
        <div onClick={handleClick} className={className}>
          <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>{formatText(content.replace(/^##\s/, ''))}</h2>
          {!isStreaming && (
            <Edit3
              size={16}
              className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity'
            />
          )}
        </div>
      );
    if (tag === 'h3')
      return (
        <div onClick={handleClick} className={className}>
          <h3 className='text-xl font-semibold text-gray-700 dark:text-gray-200'>{formatText(content.replace(/^###\s/, ''))}</h3>
          {!isStreaming && (
            <Edit3
              size={16}
              className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity'
            />
          )}
        </div>
      );
    if (tag === 'h4')
      return (
        <div onClick={handleClick} className={className}>
          <h4 className='text-lg font-semibold text-gray-800 dark:text-gray-300'>{formatText(content.replace(/^####\s/, ''))}</h4>
          {!isStreaming && (
            <Edit3
              size={16}
              className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity'
            />
          )}
        </div>
      );
    if (tag === 'li')
      return (
        <div onClick={handleClick} className={className}>
          <li className='ml-4 list-disc text-gray-700 dark:text-gray-300'>{formatText(content.replace(/^[-*]\s/, ''))}</li>
          {!isStreaming && (
            <Edit3
              size={16}
              className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity'
            />
          )}
        </div>
      );
    if (tag === 'img') {
      const alt = content.match(/!\[(.*?)\]/)?.[1] || 'Image';
      const src = content.match(/\((.*?)\)/)?.[1];
      return (
        <img
          src={src}
          alt={alt}
          className='w-full h-auto rounded-lg shadow-md my-4 object-cover max-h-96'
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />
      );
    }
    if (tag === 'spacer') return <div className='h-2'></div>;
    return (
      <div onClick={handleClick} className={className}>
        <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>{formatText(content)}</p>
        {!isStreaming && <Edit3 size={14} className='absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity' />}
      </div>
    );
  };

  if (isEditing) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-indigo-500 p-4 space-y-3 animate-fade-in my-4'>
        <div className='flex justify-between items-center mb-1'>
          <span className='text-xs font-bold text-indigo-500 uppercase tracking-wide'>Editing Block</span>
          <div className='flex gap-2'>
            <button onClick={handleCancel} className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500'>
              <X size={18} />
            </button>
            <button onClick={handleSave} className='p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded text-indigo-600'>
              <Check size={18} />
            </button>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-mono focus:ring-0 focus:border-indigo-500 outline-none min-h-[100px] text-gray-800 dark:text-gray-200'
        />
        <div className='bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 flex flex-col sm:flex-row gap-2 items-center'>
          <div className='bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm'>
            <Sparkles size={16} className='text-indigo-500' />
          </div>
          <input
            type='text'
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="AI Prompt: 'Make it funnier' (Costs 1 Credit)..."
            className='flex-grow bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 text-gray-800 dark:text-gray-200 min-w-0 w-full sm:w-auto'
            onKeyDown={(e) => e.key === 'Enter' && handleAiRefine()}
          />
          <button
            onClick={handleAiRefine}
            disabled={isRefining || !aiPrompt.trim()}
            className='bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0'
          >
            {isRefining ? <RefreshCw size={16} className='animate-spin' /> : <Wand2 size={16} />}
          </button>
        </div>

        {/* Advanced Context Options */}
        <div className='bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-3 border border-gray-100 dark:border-gray-700'>
          <div className='flex flex-wrap gap-4'>
            {previousContext && (
              <label className='flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors'>
                <input
                  type='checkbox'
                  checked={includePrevious}
                  onChange={(e) => setIncludePrevious(e.target.checked)}
                  className='rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                />
                Include Previous Paragraph
              </label>
            )}
            {nextContext && (
              <label className='flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors'>
                <input
                  type='checkbox'
                  checked={includeNext}
                  onChange={(e) => setIncludeNext(e.target.checked)}
                  className='rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                />
                Include Next Paragraph
              </label>
            )}
          </div>

          {availableCharacters && availableCharacters.length > 0 && (
            <div className='space-y-1'>
              <span className='text-[10px] font-bold text-gray-400 uppercase'>Include Characters</span>
              <div className='flex flex-wrap gap-2'>
                {availableCharacters.map((char: any) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      setSelectedCharIds((prev) => (prev.includes(char.id) ? prev.filter((id) => id !== char.id) : [...prev, char.id]));
                    }}
                    className={`text-xs px-2 py-1 rounded-full border transition-all ${
                      selectedCharIds.includes(char.id)
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 text-indigo-700 dark:text-indigo-300'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-indigo-300'
                    }`}
                  >
                    {char.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return renderDisplay();
};
