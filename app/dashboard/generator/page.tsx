'use client';

import React, { useState } from 'react';
import { useUserData, useUserActions } from '../../../context/UserContext';
import { GeneratorView } from '../../../views/GeneratorView';
import { Article } from '../../../lib/types';
import { GoogleGenAI } from '@google/genai';

export default function GeneratorPage() {
  const state = useUserData();
  const dispatch = useUserActions();
  const { user } = state;

  // Local State
  const [activeTab, setActiveTab] = useState('editor');
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [minWordsPerSection, setMinWordsPerSection] = useState(150);
  const [sectionCount, setSectionCount] = useState(3);
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeImage, setIncludeImage] = useState(true);
  const [bodyImageCount, setBodyImageCount] = useState(1);

  const generateBlog = async () => {
    if (!keyword.trim()) {
      setStatus('error');
      setStatusMessage('Please enter a keyword first.');
      return;
    }

    if (!user || !user.profile || user.profile.credits < 5) {
        alert(`Not enough credits! You need 5 but have ${user?.profile?.credits || 0}. Upgrade to continue.`);
        return;
    }

    setStatus('generating');
    setGeneratedContent('');
    setIsStreaming(false);
    setActiveTab('preview');
    setStatusMessage('Initializing AI agents...');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                keyword,
                minWordsPerSection,
                sectionCount,
                includeFaq,
                includeImage,
                bodyImageCount,
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to generate content');
        }

        if (!response.body) {
            throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let fullArticleText = '';

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            const chunk = decoder.decode(value, { stream: true });
            fullArticleText += chunk;

            if (fullArticleText.includes('--STATS--')) {
                const parts = fullArticleText.split('--STATS--');
                setGeneratedContent(parts[0]);
                const stats = JSON.parse(parts[1]);
                dispatch({ type: 'UPDATE_USER', payload: { profile: { ...user.profile, credits: stats.newCredits } } });
                // I will need to fetch the new article and add it to the user's articles
                // For now, I will just update the credits
            } else {
                setGeneratedContent(fullArticleText);
            }
        }
        
        setStatus('success');
        setStatusMessage('Content ready!');
        setIsStreaming(true);

    } catch (error: any) {
        console.error(error);
        setStatus('error');
        setStatusMessage(error.message || 'Failed to generate content.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Copied to clipboard!');
  };

  return (
    <GeneratorView
      keyword={keyword}
      setKeyword={setKeyword}
      minWordsPerSection={minWordsPerSection}
      setMinWordsPerSection={setMinWordsPerSection}
      sectionCount={sectionCount}
      setSectionCount={setSectionCount}
      bodyImageCount={bodyImageCount}
      setBodyImageCount={setBodyImageCount}
      includeFaq={includeFaq}
      setIncludeFaq={setIncludeFaq}
      includeImage={includeImage}
      setIncludeImage={setIncludeImage}
      savedKeywords={user?.profile?.keywords || []}
      savedSitemaps={[]} // user?.sitemap?.map((s: any) => s.url) || []
      generateBlog={generateBlog}
      status={status}
      statusMessage={statusMessage}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      generatedContent={generatedContent}
      setGeneratedContent={setGeneratedContent}
      isStreaming={isStreaming}
      setIsStreaming={setIsStreaming}
      handleRefineCreditDeduction={() => {}}
      copyToClipboard={copyToClipboard}
    />
  );
}
