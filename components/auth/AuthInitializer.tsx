'use client';

import { useEffect } from 'react';
import { useUserActions } from '../../context/UserContext';
import { User, Article, Book, Sitemap } from '../../lib/types';

export const AuthInitializer = () => {
  const dispatch = useUserActions();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const response = await fetch('/api/user/me');
        const data = await response.json();

        if (response.ok && data.success && data.user) {
          dispatch({ type: 'LOGIN', payload: data.user });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Session check failed:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkSession();
  }, [dispatch]);

  return null; // This component renders nothing
};
