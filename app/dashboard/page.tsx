'use client';

import React from 'react';
import { useUserData } from '../../context/UserContext';
import { DashboardView } from '../../views/DashboardView';

export default function DashboardPage() {
  const state = useUserData();
  return <DashboardView user={state.user} />;
}
