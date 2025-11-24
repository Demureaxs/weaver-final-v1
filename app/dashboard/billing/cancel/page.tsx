'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function BillingCancelPage() {
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center text-center p-4 animate-fade-in'>
      <div className='bg-red-100 dark:bg-red-900/30 p-6 rounded-full mb-6'>
        <XCircle size={64} className='text-red-600 dark:text-red-400' />
      </div>
      <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>Payment Cancelled</h1>
      <p className='text-gray-600 dark:text-gray-400 max-w-md mb-8'>Your payment was cancelled and no charges were made.</p>
      <div className='flex gap-4'>
        <Link
          href='/dashboard/billing'
          className='bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
        >
          Try Again
        </Link>
        <Link href='/dashboard' className='text-indigo-600 dark:text-indigo-400 px-6 py-3 font-bold hover:underline flex items-center'>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
