'use client';

import { useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { auth, isDemoMode, INITIAL_MOCK_DB } from '../../lib/firebase';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

export const AuthInitializer = () => {
  const { dispatch } = useUser();

  useEffect(() => {
    // 1. Handle Demo Mode or Missing Auth Config
    if (isDemoMode || !auth) {
        // Simulate a small delay for realism, then stop loading
        setTimeout(() => {
            dispatch({ type: 'LOGOUT' });
        }, 500);
        return;
    }

    // 2. Handle Custom Tokens (if injected)
    const initAuth = async () => {
      // @ts-ignore
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { 
            // @ts-ignore
            await signInWithCustomToken(auth, __initial_auth_token); 
        } catch (e) { 
            console.error("Token signin failed", e); 
        }
      }
    };
    initAuth();

    // 3. Listen to Firebase Auth State
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            // In a real app, you would fetch the user profile from Firestore here.
            // For this demo, we attach the mock profile to the auth user.
            // @ts-ignore
            const mockProfile = INITIAL_MOCK_DB['user_bob']; // Defaulting to Bob for auth users
            dispatch({ 
                type: 'LOGIN', 
                payload: { 
                    ...mockProfile, 
                    uid: currentUser.uid, 
                    email: currentUser.email || '' 
                } 
            });
        } else {
            dispatch({ type: 'LOGOUT' });
        }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null; // This component renders nothing
};