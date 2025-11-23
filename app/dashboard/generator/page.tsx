'use client';

import React, { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { GeneratorView } from '../../../views/GeneratorView';
import { Article } from '../../../lib/types';
import { GoogleGenAI } from '@google/genai';

export default function GeneratorPage() {
  const { state, dispatch } = useUser();
  const { user } = state;

  // Local State
  const [activeTab, setActiveTab] = useState('editor');
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [wordCount, setWordCount] = useState(500);
  const [sectionCount, setSectionCount] = useState(3);
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeImage, setIncludeImage] = useState(true);
  const [bodyImageCount, setBodyImageCount] = useState(1);

  const checkAndDeductCredits = (cost: number) => {
    if (!user || user.credits < cost) {
      alert(`Not enough credits! You need ${cost} but have ${user?.credits || 0}. Upgrade to continue.`);
      return false;
    }
    dispatch({ type: 'DEDUCT_CREDITS', payload: cost });
    return true;
  };

  const generateBlog = async () => {
    if (!keyword.trim()) {
      setStatus('error');
      setStatusMessage('Please enter a keyword first.');
      return;
    }

    if (!checkAndDeductCredits(10)) return;

    setStatus('generating');
    setGeneratedContent('');
    setIsStreaming(false);
    setActiveTab('preview');
    setStatusMessage('Initializing AI agents...');

    try {
      setStatusMessage(`Drafting ${wordCount} words on "${keyword}"...`);
      const internalLinks =
        user?.sitemap
          ?.slice(0, 5)
          .map((l) => l.url)
          .join(', ') || '';
      let internalLinksContext = internalLinks
        ? `SEO & LINKING (CRITICAL): INTERNAL LINKS: Naturally integrate 3-5 links from: ${internalLinks}.`
        : `SEO & LINKING: EXTERNAL LINKS: Include 2-3 high-authority external links.`;

      let markdown = '';
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `
                Write a blog post about "${keyword}". Word count: ~${wordCount}. Sections: ${sectionCount}. ${includeFaq ? 'Include FAQ.' : ''}
                ${internalLinksContext}
                IMAGES: Include ${bodyImageCount} additional images within body text using tag: [IMAGE_PROMPT: description]
                STYLE GUIDELINES:
                1. TONE: Conversational, human, authentic.
                2. NO em-dashes (—).
                3. NO buzzwords (leverage, unleash, game-changer).
                4. EXTERNAL LINKS: MUST be real, clickable URLs (e.g., [Wikipedia](https://wikipedia.org/wiki/...)), NEVER placeholders like [Link 1].
                5. FORMAT: STRICT Markdown (# H1, ## H2).
              `,
        });

        let rawMarkdown = response.text;
        if (!rawMarkdown) throw new Error('No content');
        markdown = rawMarkdown.replace(/^H(\d):\s*/gm, (match, level) => '#'.repeat(parseInt(level)) + ' ');
      } catch (apiError) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        markdown = `# ${keyword} (Demo Mode)\n\n*Real generation failed.* \n\n## Introduction\nWelcome to your blog post about ${keyword}. \n\n[IMAGE_PROMPT: A futuristic robot writing a blog post]\n\n## Main Section\nContent goes here.`;
      }

      markdown = markdown.replace(/\[IMAGE_PROMPT:\s*(.*?)\]/g, (match, prompt) => {
        return `![${prompt}](https://placehold.co/600x400/orange/white?text=${encodeURIComponent(prompt.substring(0, 20))})`;
      });

      setGeneratedContent(markdown);

      const newArticle: Article = {
        id: Date.now().toString(),
        title: keyword,
        content: markdown,
        snippet: markdown.substring(0, 100) + '...',
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_ARTICLE', payload: newArticle });

      setStatus('success');
      setStatusMessage('Content ready!');
      setIsStreaming(true);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setStatusMessage('Failed.');
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
      wordCount={wordCount}
      setWordCount={setWordCount}
      sectionCount={sectionCount}
      setSectionCount={setSectionCount}
      bodyImageCount={bodyImageCount}
      setBodyImageCount={setBodyImageCount}
      includeFaq={includeFaq}
      setIncludeFaq={setIncludeFaq}
      includeImage={includeImage}
      setIncludeImage={setIncludeImage}
      savedKeywords={user?.keywords || []}
      savedSitemaps={user?.sitemap?.map((s: any) => s.url) || []}
      generateBlog={generateBlog}
      status={status}
      statusMessage={statusMessage}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      generatedContent={generatedContent}
      setGeneratedContent={setGeneratedContent}
      isStreaming={isStreaming}
      setIsStreaming={setIsStreaming}
      handleRefineCreditDeduction={(cost: number) => checkAndDeductCredits(cost)}
      copyToClipboard={copyToClipboard}
    />
  );
}
