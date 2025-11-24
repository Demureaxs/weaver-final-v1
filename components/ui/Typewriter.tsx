import React, { useState, useEffect, useRef } from 'react';
import { SimpleMarkdown } from '../editor/SimpleMarkdown';

export const Typewriter = ({ text, onComplete }: any) => {
  const [displayedText, setDisplayedText] = useState('');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!text) return;

    if (displayedText.length < text.length) {
      const newText = text.slice(0, displayedText.length + 1);
      const timeoutId = setTimeout(() => {
        setDisplayedText(newText);
      }, 5);
      return () => clearTimeout(timeoutId);
    } else {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }
  }, [text, displayedText]);

  return <SimpleMarkdown content={displayedText} onContentChange={() => {}} isStreaming={true} currentApiKey={undefined} onDeductCredit={undefined} />;
};
