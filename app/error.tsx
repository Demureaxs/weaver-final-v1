'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100">
      <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-lg text-zinc-400 mb-8">
        An unexpected error has occurred.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-zinc-800 px-6 py-3 text-zinc-100 hover:bg-zinc-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
