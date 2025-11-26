'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-lg text-gray-400 mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
