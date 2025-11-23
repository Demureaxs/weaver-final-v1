'use client';

import React from 'react';
import { useUser } from '../../context/UserContext';
import { DashboardView } from '../../views/DashboardView';

export default function DashboardPage() {
  const { state } = useUser();
  return <DashboardView user={state.user} />;
}
