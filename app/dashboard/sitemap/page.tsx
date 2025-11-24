'use client';

import React, { useState, useEffect } from 'react';
import { useUserData, useUserActions } from '../../../context/UserContext';
import { SitemapView } from '../../../views/SitemapView';

export default function SitemapPage() {
  const state = useUserData();
  const dispatch = useUserActions();
  const { user } = state;

  const [sitemapInputType, setSitemapInputType] = useState<'url' | 'text'>('url');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [sitemapText, setSitemapText] = useState('');
  const [discoveredUrls, setDiscoveredUrls] = useState<any[]>([]);
  const [sitemapStatus, setSitemapStatus] = useState('idle');
  const [sitemapError, setSitemapError] = useState('');
  const [omitBaseUrl, setOmitBaseUrl] = useState(false);

  useEffect(() => {
    if (user?.sitemap) {
      setDiscoveredUrls(user.sitemap.links);
      setSitemapUrl(user.sitemap.url);
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

      const links: any[] = data.links || [];

      if (links.length === 0) {
        setSitemapError('No URLs found. Try pasting the XML content directly.');
        setSitemapStatus('idle');
      } else {
        setDiscoveredUrls(links);
        setSitemapStatus('parsed');

        const sitemapData = {
          url: sitemapUrl,
          links: links,
        };

        const method = user?.sitemap ? 'PUT' : 'POST';

        fetch('/api/sitemap', {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sitemapData),
        }).then((res) => {
          if (res.ok) {
            // Optionally update the user context
          }
        });
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
