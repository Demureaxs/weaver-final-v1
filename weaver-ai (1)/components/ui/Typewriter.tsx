import React, { useState, useEffect } from 'react';
import { SimpleMarkdown } from '../editor/SimpleMarkdown';

export const Typewriter = ({ text, onComplete }: any) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    if (!text) return;

    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length >= text.length) {
          clearInterval(intervalId);
          if (onComplete) onComplete();
          return text;
        }
        return text.slice(0, prev.length + 1);
      });
    }, 5); 

    return () => clearInterval(intervalId);
  }, [text, onComplete]);

  return <SimpleMarkdown content={displayedText} onContentChange={() => {}} isStreaming={true} currentApiKey={undefined} onDeductCredit={undefined} />;
};