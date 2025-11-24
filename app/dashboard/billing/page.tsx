'use client';

import React from 'react';
import { Check, Zap } from 'lucide-react';
import { useUserData } from '../../../context/UserContext';

export default function BillingPage() {
  const { user } = useUserData();

  const handleSubscribe = async (plan: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred');
    }
  };

  return (
    <div className='max-w-4xl mx-auto py-12 px-4 animate-fade-in'>
      <div className='text-center mb-12'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>Upgrade Your Plan</h1>
        <p className='text-gray-600 dark:text-gray-400'>Unlock more power and features for your writing.</p>
      </div>

      <div className='grid md:grid-cols-2 gap-8'>
        {/* Free Plan */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>Free</h3>
          <div className='text-4xl font-bold text-gray-900 dark:text-white mb-6'>
            $0<span className='text-base font-normal text-gray-500'>/mo</span>
          </div>
          <ul className='space-y-4 mb-8 flex-1'>
            <li className='flex items-center gap-3 text-gray-600 dark:text-gray-300'>
              <Check size={20} className='text-green-500' /> 50 Credits / Month
            </li>
            <li className='flex items-center gap-3 text-gray-600 dark:text-gray-300'>
              <Check size={20} className='text-green-500' /> Basic Book Tools
            </li>
            <li className='flex items-center gap-3 text-gray-600 dark:text-gray-300'>
              <Check size={20} className='text-green-500' /> Standard Support
            </li>
          </ul>
          <button disabled className='w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-400 font-bold cursor-not-allowed'>
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className='bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl text-white p-8 flex flex-col relative overflow-hidden'>
          <div className='absolute top-0 right-0 bg-white/20 px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider'>Popular</div>
          <h3 className='text-xl font-bold mb-2 flex items-center gap-2'>
            <Zap size={20} className='text-yellow-300' /> Pro
          </h3>
          <div className='text-4xl font-bold mb-6'>
            $19<span className='text-base font-normal opacity-80'>/mo</span>
          </div>
          <ul className='space-y-4 mb-8 flex-1'>
            <li className='flex items-center gap-3'>
              <div className='bg-white/20 p-1 rounded-full'>
                <Check size={14} />
              </div>{' '}
              500 Credits / Month
            </li>
            <li className='flex items-center gap-3'>
              <div className='bg-white/20 p-1 rounded-full'>
                <Check size={14} />
              </div>{' '}
              Advanced AI Models
            </li>
            <li className='flex items-center gap-3'>
              <div className='bg-white/20 p-1 rounded-full'>
                <Check size={14} />
              </div>{' '}
              Priority Support
            </li>
            <li className='flex items-center gap-3'>
              <div className='bg-white/20 p-1 rounded-full'>
                <Check size={14} />
              </div>{' '}
              Unlimited Books
            </li>
          </ul>
          <button
            onClick={() => handleSubscribe('pro')}
            className='w-full py-3 rounded-xl bg-white text-indigo-600 font-bold hover:bg-gray-50 transition-colors shadow-lg'
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
