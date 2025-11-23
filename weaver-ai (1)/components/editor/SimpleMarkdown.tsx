import React from 'react';
import { EditableBlock } from './EditableBlock';

export const SimpleMarkdown = ({ content, onContentChange, isStreaming = false, currentApiKey, onDeductCredit }: any) => {
  if (!content) return <div className="text-gray-400 italic">No content generated yet...</div>;
  const lines = content.split('\n');
  const handleBlockSave = (index: any, newContent: any) => { const newLines = [...lines]; newLines[index] = newContent; onContentChange(newLines.join('\n')); };
  return (
    <div className="space-y-2 text-left font-sans leading-relaxed text-gray-800 dark:text-gray-200">
      {lines.map((line: any, index: any) => {
        let tag = 'p';
        if (line.startsWith('# ')) tag = 'h1'; else if (line.startsWith('## ')) tag = 'h2'; else if (line.startsWith('### ')) tag = 'h3'; else if (line.startsWith('#### ')) tag = 'h4'; else if (line.startsWith('- ') || line.startsWith('* ')) tag = 'li'; else if (line.startsWith('![')) tag = 'img'; else if (line.trim() === '') tag = 'spacer';
        return <EditableBlock key={`${index}-${line.substring(0, 10)}`} index={index} initialContent={line} tag={tag} onSave={handleBlockSave} isStreaming={isStreaming} currentApiKey={currentApiKey} onDeductCredit={onDeductCredit} />;
      })}
    </div>
  );
};