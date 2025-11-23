'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import { SitemapView } from '../../../views/SitemapView';
import { SitemapLink } from '../../../lib/types';

export default function SitemapPage() {
  const { state, dispatch } = useUser();
  const { user } = state;

  const [sitemapInputType, setSitemapInputType] = useState<'url' | 'text'>('url');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [sitemapText, setSitemapText] = useState('');
  const [discoveredUrls, setDiscoveredUrls] = useState<SitemapLink[]>([]);
  const [sitemapStatus, setSitemapStatus] = useState('idle');
  const [sitemapError, setSitemapError] = useState('');
  const [omitBaseUrl, setOmitBaseUrl] = useState(false);

  useEffect(() => {
    if (user?.sitemap && discoveredUrls.length === 0) {
      setDiscoveredUrls(user.sitemap);
      setSitemapStatus('parsed');
    }
  }, [user]);

  const handleSitemapFetch = async () => {
    setSitemapStatus('loading');
    setSitemapError('');
    await new Promise((r) => setTimeout(r, 1500));

    let links: SitemapLink[] = [];
    if (sitemapInputType === 'text' && sitemapText) {
      const matches = sitemapText.match(/<loc>(.*?)<\/loc>/g);
      if (matches) {
        links = matches.map((m) => {
          const url = m.replace(/<\/?loc>/g, '');
          const text = url.split('/').pop()?.replace(/-/g, ' ') || 'Page';
          return { url, text };
        });
      }
    } else {
      links = [
        { url: 'https://example.com/', text: 'Home' },
        { url: 'https://example.com/about', text: 'About' },
        { url: 'https://example.com/contact', text: 'Contact' },
        { url: 'https://example.com/blog/post-1', text: 'First Post' },
      ];
    }

    if (links.length === 0) {
      setSitemapError('No URLs found. Try pasting the XML content directly.');
      setSitemapStatus('idle');
    } else {
      setDiscoveredUrls(links);
      setSitemapStatus('parsed');
      dispatch({ type: 'SET_SITEMAP', payload: links });
    }
  };

  return (
    <SitemapView
      sitemapInputType={sitemapInputType}
      setSitemapInputType={setSitemapInputType}
      sitemapUrl={sitemapUrl}
      setSitemapUrl={setSitemapUrl}
      sitemapText={sitemapText}
      setSitemapText={setSitemapText}
      handleSitemapFetch={handleSitemapFetch}
      sitemapStatus={sitemapStatus}
      sitemapError={sitemapError}
      discoveredUrls={discoveredUrls}
      omitBaseUrl={omitBaseUrl}
      setOmitBaseUrl={setOmitBaseUrl}
    />
  );
}
