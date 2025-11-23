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

    try {
      const response = await fetch('/api/sitemap/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sitemapInputType === 'url' ? sitemapUrl : undefined,
          xml: sitemapInputType === 'text' ? sitemapText : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSitemapError(data.error || 'Failed to scrape sitemap');
        setSitemapStatus('idle');
        return;
      }

      const links: SitemapLink[] = data.links || [];

      if (links.length === 0) {
        setSitemapError('No URLs found. Try pasting the XML content directly.');
        setSitemapStatus('idle');
      } else {
        setDiscoveredUrls(links);
        setSitemapStatus('parsed');
        dispatch({ type: 'SET_SITEMAP', payload: links });
      }
    } catch (error: any) {
      setSitemapError(`Error: ${error.message}`);
      setSitemapStatus('idle');
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
