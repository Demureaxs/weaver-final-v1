import React from 'react';
import { ExternalLink } from 'lucide-react';

export const formatText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\[.*?\]\(.*?\)|(?<!\*)\*\*(?!\*).*?(?<!\*)\*\*(?!\*)|(?<!\*)\*(?!\*).*?(?<!\*)\*(?!\*)|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (match) {
            return <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>{match[1]}<ExternalLink size={10} className="opacity-50" /></a>;
        }
    }
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index} className="italic text-gray-800 dark:text-gray-100">{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">{part.slice(1, -1)}</code>;
    return part;
  });
};

export const getDifficultyColor = (diff: number) => {
    if (diff < 40) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700';
    if (diff < 70) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-700';
};
