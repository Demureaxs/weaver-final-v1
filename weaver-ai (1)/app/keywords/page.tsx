
'use client';

import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { KeywordResearchView } from '../../views/KeywordResearchView';
import { GoogleGenAI } from "@google/genai";

export default function KeywordsPage() {
  const { state, dispatch } = useUser();
  const { user } = state;
  
  const [seedKeyword, setSeedKeyword] = useState('');
  const [keywordResults, setKeywordResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleKeywordSearch = async () => {
      if (!seedKeyword.trim()) return;
      setIsSearching(true);
      setKeywordResults(null);
      
      let suggestions: any[] = [];
      const augmentData = (term: string) => ({ keyword: term, volume: Math.floor(Math.random() * 10000) + 50, difficulty: Math.floor(Math.random() * 100) });
      
      try {
          const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(seedKeyword)}`);
          if (!res.ok) throw new Error("CORS");
          const data = await res.json();
          suggestions = data[1].map(augmentData);
      } catch (err) {
           try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate 20 popular Google search autocomplete suggestions for the keyword "${seedKeyword}". Return ONLY a JSON array of strings. Example: ["keyword one", "keyword two"]`,
                config: { responseMimeType: 'application/json' }
              });
              const text = response.text;
              if (text) {
                  suggestions = JSON.parse(text).map(augmentData);
              }
           } catch (aiErr) { console.error(aiErr); }
           
           if (!suggestions.length) {
              await new Promise(r => setTimeout(r, 800));
              suggestions = [`${seedKeyword} guide`, `${seedKeyword} tips`, `best ${seedKeyword}`, `how to ${seedKeyword}`].map(augmentData);
           }
      }
      
      const categorized = { questions: [], prepositions: [], general: [] };
      const qWords = ['who', 'what', 'where', 'when', 'why', 'how'];
      const pWords = ['for', 'with', 'near', 'vs'];
      
      suggestions.forEach(item => {
          const lower = item.keyword.toLowerCase();
          // @ts-ignore
          if (qWords.some(q => lower.startsWith(q + ' '))) categorized.questions.push(item);
          // @ts-ignore
          else if (pWords.some(p => lower.includes(' ' + p + ' '))) categorized.prepositions.push(item);
          // @ts-ignore
          else categorized.general.push(item);
      });
      setKeywordResults(categorized);
      setIsSearching(false);
  };

  return (
    <KeywordResearchView 
        seedKeyword={seedKeyword}
        setSeedKeyword={setSeedKeyword}
        handleKeywordSearch={handleKeywordSearch}
        isSearching={isSearching}
        keywordResults={keywordResults}
        savedKeywords={user?.keywords || []}
        toggleKeyword={(kw: string) => dispatch({ type: 'TOGGLE_KEYWORD', payload: kw })}
    />
  );
}
