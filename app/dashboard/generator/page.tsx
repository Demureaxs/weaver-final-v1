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
      let finalNewArticleId: string | null = null;
      let finalNewCredits: number | null = null;
      let streamError: string | null = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        fullArticleText += chunk;

        // Update content as it streams
        if (fullArticleText.includes('--STATS--')) {
          const parts = fullArticleText.split('--STATS--');
          setGeneratedContent(parts[0]);
          const stats = JSON.parse(parts[1]);
          finalNewArticleId = stats.newArticleId;
          finalNewCredits = stats.newCredits;
          // Don't update user state here yet, wait for full article to process
        } else if (fullArticleText.includes('--ERROR--')) {
          const parts = fullArticleText.split('--ERROR--');
          setGeneratedContent(parts[0]); // Display any content before error
          streamError = parts[1] || 'An error occurred during article generation.';
          done = true; // Stop processing further chunks on error
        } else {
          setGeneratedContent(fullArticleText);
        }
      }

      if (streamError) {
        setStatus('error');
        setStatusMessage(streamError);
      } else {
        setStatus('success');
        setStatusMessage('Content ready!');
        setIsStreaming(true);

        // Now that the stream is complete, update user credits and fetch the article
        if (finalNewCredits !== null) {
          dispatch({ type: 'UPDATE_USER', payload: { profile: { ...user.profile, credits: finalNewCredits } } });
        }

        if (finalNewArticleId) {
          const articleResponse = await fetch(`/api/articles/${finalNewArticleId}`);
          if (articleResponse.ok) {
            const newArticle: Article = await articleResponse.json();
            dispatch({ type: 'UPDATE_USER', payload: { articles: [...(user?.articles || []), newArticle] } });
          } else {
            console.error('Failed to fetch new article after generation');
          }
        }
      }
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
      savedSitemaps={user?.sitemap ? [user.sitemap.url] : []}
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
