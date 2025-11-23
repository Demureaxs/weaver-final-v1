
'use client';

import React from 'react';
import { LayoutDashboard, Sparkles, Search, Map, BookOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export const BottomNav = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard, color: 'indigo' },
    { label: 'Generator', path: '/dashboard/generator', icon: Sparkles, color: 'indigo' },
    { label: 'Keywords', path: '/dashboard/keywords', icon: Search, color: 'indigo' },
    { label: 'Sitemap', path: '/dashboard/sitemap', icon: Map, color: 'indigo' },
    // Adding placeholder for future book writer
    { label: 'Books', path: '/dashboard/book-writer', icon: BookOpen, color: 'purple' }, 
  ];

  return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 shadow-lg z-20">
          <div className="flex justify-around max-w-xl mx-auto">
              {navItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link 
                        key={item.path} 
                        href={item.path} 
                        className={`flex-1 p-2 rounded-xl flex flex-col items-center transition-colors ${active ? `text-${item.color}-600 dark:text-${item.color}-400 bg-${item.color}-50 dark:bg-${item.color}-900/20` : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Icon size={24} />
                        <span className="text-xs mt-1 font-medium">{item.label}</span>
                    </Link>
                  );
              })}
          </div>
      </div>
  );
};
