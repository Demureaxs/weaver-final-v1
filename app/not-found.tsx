import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-zinc-100 mb-4">404</h1>
        <p className="text-xl text-zinc-400 mb-8">Page Not Found</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
