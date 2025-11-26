import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page Not Found</p>
      <Link
        href="/"
        className="rounded-md bg-zinc-800 px-6 py-3 text-zinc-100 hover:bg-zinc-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
