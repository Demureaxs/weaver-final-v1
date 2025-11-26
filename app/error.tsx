'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-100 mb-4">
          Something went wrong!
        </h1>
        <p className="text-zinc-400 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
