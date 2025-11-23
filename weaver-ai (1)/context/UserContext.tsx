'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { UserProfile, UserState, Action, SitemapLink } from '../lib/types';

const initialState: UserState = {
  user: null,
  isLoading: true,
  theme: 'light',
};

const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

const userReducer = (state: UserState, action: Action): UserState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false };
    case 'DEDUCT_CREDITS':
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, credits: Math.max(0, state.user.credits - action.payload) },
      };
    case 'ADD_ARTICLE':
      if (!state.user) return state;
      return {
        ...state,
        user: {
            ...state.user,
            articles: [action.payload, ...state.user.articles],
            activeCount: (state.user.activeCount || 0) + 1
        }
      };
    case 'SET_SITEMAP':
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, sitemap: action.payload }
      };
    case 'TOGGLE_KEYWORD':
      if (!state.user) return state;
      const kw = action.payload;
      const exists = state.user.keywords.includes(kw);
      const newKeywords = exists
        ? state.user.keywords.filter((k) => k !== kw)
        : [...state.user.keywords, kw];
      return {
        ...state,
        user: { ...state.user, keywords: newKeywords }
      };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    default:
      return state;
  }
};

export const UserProvider = ({ children }: { children?: ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
