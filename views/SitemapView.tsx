import React from 'react';
import { Map, Globe, Upload, AlertCircle, Link2, Link2Off } from 'lucide-react';
import { SitemapLink } from '../lib/types';

interface SitemapViewProps {
  sitemapInputType: 'url' | 'text';
  setSitemapInputType: (value: 'url' | 'text') => void;
  sitemapUrl: string;
  setSitemapUrl: (value: string) => void;
  sitemapText: string;
  setSitemapText: (value: string) => void;
  handleSitemapFetch: () => void;
  sitemapStatus: string;
  sitemapError: string;
  discoveredUrls: SitemapLink[];
  omitBaseUrl: boolean;
  setOmitBaseUrl: (value: boolean) => void;
}

export const SitemapView = ({
  sitemapInputType,
  setSitemapInputType,
  sitemapUrl,
  setSitemapUrl,
  sitemapText,
  setSitemapText,
  handleSitemapFetch,
  sitemapStatus,
  sitemapError,
  discoveredUrls,
  omitBaseUrl,
  setOmitBaseUrl,
}: SitemapViewProps) => {
  return (
    <div className='animate-fade-in space-y-6 max-w-2xl mx-auto'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
        <div className='p-4 bg-gray-200 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2'>
          <Map className='text-indigo-500' size={20} />
          <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100'>Sitemap Manager</h2>
        </div>
        <div className='p-6'>
          <div className='flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4'>
            <button
              onClick={() => setSitemapInputType('url')}
              className={`pb-2 text-sm font-medium transition-colors ${
                sitemapInputType === 'url' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
              }`}
            >
              URL Link
            </button>
            <button
              onClick={() => setSitemapInputType('text')}
              className={`pb-2 text-sm font-medium transition-colors ${
                sitemapInputType === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
              }`}
            >
              File / Text
            </button>
          </div>
          {sitemapInputType === 'url' ? (
            <div className='space-y-4'>
              <div className='relative'>
                <Globe className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  type='text'
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  placeholder='https://example.com/sitemap.xml'
                  className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none'
                />
              </div>
              <p className='text-xs text-gray-500'>Fetch may fail due to CORS. Use File/Text if this happens.</p>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors relative'>
                <input
                  type='file'
                  accept='.xml'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = ev.target?.result;
                      if (typeof result === 'string') {
                        setSitemapText(result);
                        setSitemapInputType('text');
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />
                <Upload className='mx-auto text-gray-400 mb-2' size={24} />
                <span className='text-sm text-gray-500'>Click to upload .xml file</span>
              </div>
              <div className='relative'>
                <textarea
                  value={sitemapText}
                  onChange={(e) => setSitemapText(e.target.value)}
                  placeholder='<urlset>...</urlset>'
                  className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 h-32 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none'
                />
              </div>
            </div>
          )}
          <button
            onClick={handleSitemapFetch}
            disabled={sitemapStatus === 'loading'}
            className='w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {sitemapStatus === 'loading' ? 'Processing...' : 'Collect & Save Pages'}
          </button>
          {sitemapError && (
            <div className='mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg flex gap-2 items-start'>
              <AlertCircle size={16} className='mt-0.5 flex-shrink-0' />
              {sitemapError}
            </div>
          )}
        </div>
      </div>
      {sitemapStatus === 'parsed' && (
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
          <div className='p-4 bg-gray-200 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <h3 className='font-semibold text-gray-700 dark:text-gray-200'>Found Pages ({discoveredUrls.length})</h3>
            <button
              onClick={() => setOmitBaseUrl(!omitBaseUrl)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                omitBaseUrl
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent'
              }`}
            >
              {omitBaseUrl ? <Link2Off size={14} /> : <Link2 size={14} />} Omit Base URL
            </button>
          </div>
          <div className='max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700'>
            {discoveredUrls.map((link: SitemapLink, idx: number) => {
              const displayUrl = omitBaseUrl
                ? (() => {
                    try {
                      return new URL(link.url).pathname;
                    } catch (e) {
                      return link.url;
                    }
                  })()
                : link.url;
              return (
                <div key={idx} className='p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group'>
                  <div className='flex justify-between items-start gap-4'>
                    <div className='min-w-0 flex-grow'>
                      <span className='text-xs text-gray-400 truncate block max-w-[200px] sm:max-w-xs'>{displayUrl}</span>
                      <p className='text-sm font-medium text-gray-800 dark:text-gray-200 truncate'>{link.text || 'Page'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
