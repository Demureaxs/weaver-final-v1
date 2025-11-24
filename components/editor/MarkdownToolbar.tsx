import React, { useState } from 'react';
import { Copy, Download, Edit2, Check } from 'lucide-react';

interface MarkdownToolbarProps {
  content: string;
  onEdit?: () => void;
  fileName?: string;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ content, onEdit, fileName = 'document.md' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700'>
      {onEdit && (
        <button
          onClick={onEdit}
          className='p-1.5 text-gray-500 hover:text-purple-600 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all'
          title='Edit'
        >
          <Edit2 size={16} />
        </button>
      )}
      <button
        onClick={handleCopy}
        className='p-1.5 text-gray-500 hover:text-green-600 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all'
        title='Copy'
      >
        {copied ? <Check size={16} className='text-green-600' /> : <Copy size={16} />}
      </button>
      <button
        onClick={handleDownload}
        className='p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all'
        title='Download'
      >
        <Download size={16} />
      </button>
    </div>
  );
};
