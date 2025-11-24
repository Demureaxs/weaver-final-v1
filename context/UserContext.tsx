'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, UserState, Action } from '../lib/types';

// 1. Define the initial state with the correct types
const initialState: UserState = {
  user: null,
  isLoading: true,
  theme: 'light',
};

// 2. Create two separate contexts: one for data, one for actions
const UserDataContext = createContext<UserState | undefined>(undefined);
const UserActionsContext = createContext<React.Dispatch<Action> | undefined>(undefined);

// 3. Simplify the reducer to match the new, leaner data structure
const userReducer = (state: UserState, action: Action): UserState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false };
    case 'UPDATE_USER':
      if (!state.user) return state;
      const { profile, ...otherUpdates } = action.payload;
      const updatedProfile = profile && state.user.profile ? { ...state.user.profile, ...profile } : profile || state.user.profile;

      return {
        ...state,
        user: {
          ...state.user,
          ...otherUpdates,
          profile: updatedProfile,
        },
      };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    default:
      return state;
  }
};

// 4. Create a single provider that provides both contexts
export const UserProvider = ({ children }: { children?: ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserDataContext.Provider value={state}>
      <UserActionsContext.Provider value={dispatch}>{children}</UserActionsContext.Provider>
    </UserDataContext.Provider>
  );
};

// 5. Create two separate hooks to consume the contexts
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserProvider');
  }
  return context;
};

export const useUserActions = () => {
  const context = useContext(UserActionsContext);
  if (!context) {
    throw new Error('useUserActions must be used within a UserProvider');
  }
  return context;
};
