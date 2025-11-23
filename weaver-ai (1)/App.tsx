
import React from 'react';
import RootLayout from './app/layout';
import HomePage from './app/page';
import DashboardLayout from './app/dashboard/layout';
import DashboardPage from './app/dashboard/page';
import GeneratorPage from './app/generator/page';
import KeywordsPage from './app/keywords/page';
import SitemapPage from './app/sitemap/page';
import BookWriterPage from './app/book-writer/page';
import { RouterShimProvider, usePathname } from './components/NextShim';

// This component simulates the Next.js File-system routing
const NextRouterSimulator = () => {
  const path = usePathname();

  // Route Matching Logic
  if (path === '/') return <HomePage />;

  // Dashboard Routes (Wrapped in DashboardLayout)
  if (path.startsWith('/dashboard') || path.startsWith('/generator') || path.startsWith('/keywords') || path.startsWith('/sitemap') || path.startsWith('/book-writer')) {
      let Content = DashboardPage;
      if (path === '/dashboard') Content = DashboardPage;
      else if (path === '/generator') Content = GeneratorPage;
      else if (path === '/keywords') Content = KeywordsPage;
      else if (path === '/sitemap') Content = SitemapPage;
      else if (path === '/book-writer') Content = BookWriterPage;
      
      return (
          <DashboardLayout children={<Content />} />
      );
  }

  return <div>404 Not Found</div>;
};

const App = () => (
  <RouterShimProvider>
      <RootLayout children={<NextRouterSimulator />} />
  </RouterShimProvider>
);

export default App;