import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request submitted",
};

export default function JoinPendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-mono text-sm uppercase tracking-widest text-amber-text">
          Ferro
        </h1>
        <h2 className="mt-2 text-2xl font-semibold">Request submitted</h2>
        <p className="mt-3 text-sm text-paper/60">
          Your account is set up, but you won&apos;t have access until an
          owner, broker, or fleet manager at your company approves your
          request. Check back and sign in once they have.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-amber-text hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    </main>
  );
}
