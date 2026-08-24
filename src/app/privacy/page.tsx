import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Ferro's privacy policy.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-amber-text">
        Ferro
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <div className="mt-8 rounded-[14px] border border-dashed border-line bg-surface px-6 py-10 text-center">
        <p className="text-sm text-muted">
          This page is a placeholder. Ferro&apos;s Privacy Policy will be
          published here before launch.
        </p>
      </div>
      <Link
        href="/"
        className="mt-8 inline-block font-mono text-xs text-amber-text hover:underline"
      >
        ← Back
      </Link>
    </main>
  );
}
