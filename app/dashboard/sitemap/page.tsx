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
  // TODO: discoveredUrls should be initialized by fetching the user's sitemap from a backend API.
  const [discoveredUrls, setDiscoveredUrls] = useState<any[]>([]);
  const [sitemapStatus, setSitemapStatus] = useState('idle');
  const [sitemapError, setSitemapError] = useState('');
  const [omitBaseUrl, setOmitBaseUrl] = useState(false);

  // TODO: This useEffect should be replaced with a call to a backend API to fetch the user's sitemap.
  // useEffect(() => {
  //   if (user?.sitemap && discoveredUrls.length === 0) {
  //     setDiscoveredUrls(user.sitemap);
  //     setSitemapStatus('parsed');
  //   }
  // }, [user]);

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

      // TODO: The links should now be of type Sitemap from lib/types, not SitemapLink.
      // And should include userId
      const links: any[] = data.links || [];

      if (links.length === 0) {
        setSitemapError('No URLs found. Try pasting the XML content directly.');
        setSitemapStatus('idle');
      } else {
        setDiscoveredUrls(links);
        setSitemapStatus('parsed');
        // TODO: This should trigger a backend API call to save the new sitemap for the user.
        // The SET_SITEMAP action is no longer handled by UserContext.
        // dispatch({ type: 'SET_SITEMAP', payload: links });
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
