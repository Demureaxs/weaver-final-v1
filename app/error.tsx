'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-lg text-gray-400 mb-8">
        An unexpected error has occurred.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
