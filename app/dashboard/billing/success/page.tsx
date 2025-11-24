'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function BillingSuccessPage() {
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center text-center p-4 animate-fade-in'>
      <div className='bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6'>
        <CheckCircle size={64} className='text-green-600 dark:text-green-400' />
      </div>
      <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>Payment Successful!</h1>
      <p className='text-gray-600 dark:text-gray-400 max-w-md mb-8'>Thank you for your purchase. Your credits have been added to your account.</p>
      <Link href='/dashboard' className='bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg'>
        Go to Dashboard
      </Link>
    </div>
  );
}
