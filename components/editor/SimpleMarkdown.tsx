import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SimpleMarkdownProps {
  content: string;
  className?: string;
}

export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag='div' {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          a: ({ node, ...props }) => <a {...props} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline' />,
          img: ({ node, ...props }) => <img {...props} className='rounded-lg shadow-md max-w-full h-auto my-4' />,
          table: ({ node, ...props }) => (
            <div className='overflow-x-auto my-4'>
              <table {...props} className='min-w-full divide-y divide-gray-200 dark:divide-gray-700' />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className='px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
            />
          ),
          td: ({ node, ...props }) => <td {...props} className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400' />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
