"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-mono text-sm uppercase tracking-widest text-amber-text">
          Ferro
        </h1>
        <h2 className="mt-2 text-2xl font-semibold">Sign in</h2>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-paper/70">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-line bg-surface-2 px-3 py-2 outline-none focus:border-amber-text"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-paper/70">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-line bg-surface-2 px-3 py-2 outline-none focus:border-amber-text"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-amber px-3 py-2 font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-paper/60">
          Setting up a new fleet?{" "}
          <Link href="/signup" className="text-amber-text hover:underline">
            Create a company
          </Link>
        </p>
        <p className="mt-2 text-sm text-paper/60">
          Need to join a company?{" "}
          <Link href="/join" className="text-amber-text hover:underline">
            Enter a join code
          </Link>
        </p>
      </div>
    </main>
  );
}
