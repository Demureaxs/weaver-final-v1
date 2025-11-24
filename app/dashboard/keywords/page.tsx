'use client';

import React, { useState } from 'react';
import { useUserData, useUserActions } from '../../../context/UserContext';
import { KeywordResearchView } from '../../../views/KeywordResearchView';
import { GoogleGenAI } from '@google/genai';

export default function KeywordsPage() {
  const state = useUserData();
  const dispatch = useUserActions();
  const { user } = state;

  const [seedKeyword, setSeedKeyword] = useState('');
  const [keywordResults, setKeywordResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleKeywordSearch = async () => {
    if (!seedKeyword.trim()) return;
    setIsSearching(true);
    setKeywordResults(null);

    try {
      const res = await fetch('/api/keywords/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: seedKeyword }),
      });

      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const data = await res.json();
      // data.suggestions contains categorized arrays of {keyword, searchVolume, difficulty}
      const { suggestions } = data;
      // Ensure shape matches view expectations (questions, prepositions, comparisons, alphabetical)
      setKeywordResults(suggestions);
    } catch (err) {
      console.error('Keyword suggestion error:', err);
      // Fallback mock data (same shape as suggestions)
      const mock = {
        questions: [],
        prepositions: [],
        comparisons: [],
        alphabetical: [],
      };
      setKeywordResults(mock);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <KeywordResearchView
      seedKeyword={seedKeyword}
      setSeedKeyword={setSeedKeyword}
      handleKeywordSearch={handleKeywordSearch}
      isSearching={isSearching}
      keywordResults={keywordResults}
      savedKeywords={user?.profile?.keywords || []}
      toggleKeyword={(kw: string) => {
        if (!user || !user.profile) return;
        const currentKeywords = user.profile.keywords || [];
        const newKeywords = currentKeywords.includes(kw) ? currentKeywords.filter((k) => k !== kw) : [...currentKeywords, kw];

        dispatch({ type: 'UPDATE_USER', payload: { profile: { ...user.profile, keywords: newKeywords } } });

        fetch('/api/user/keywords', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: newKeywords }),
        });
      }}
    />
  );
}
