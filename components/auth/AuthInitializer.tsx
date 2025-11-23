'use client';

import { useEffect } from 'react';
import { useUser } from '../../context/UserContext';

export const AuthInitializer = () => {
  const { dispatch } = useUser();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data.isLoggedIn && data.user) {
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
