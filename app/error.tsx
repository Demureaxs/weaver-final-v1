'use client';

import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md text-center border border-gray-700">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong!</h1>
        <p className="text-gray-400 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
