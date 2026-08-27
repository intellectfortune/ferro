"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitJoinRequest, type JoinActionState } from "@/lib/actions/join";

const initialState: JoinActionState = { error: null };

export default function JoinPage() {
  const [state, formAction, pending] = useActionState(submitJoinRequest, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-mono text-sm uppercase tracking-widest text-amber-text">
          Ferro
        </h1>
        <h2 className="mt-2 text-2xl font-semibold">Join a company</h2>
        <p className="mt-1 text-sm text-paper/60">
          Ask your team for their join code, then create your account below.
          An owner, broker, or fleet manager will approve your access.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="join_code" className="block text-sm text-paper/70">
              Join code
            </label>
            <input
              id="join_code"
              name="join_code"
              required
              placeholder="XK7P9QRT"
              autoCapitalize="characters"
              className="mt-1 w-full rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-sm uppercase tracking-widest outline-none focus:border-amber-text"
            />
          </div>
          <div>
            <label htmlFor="full_name" className="block text-sm text-paper/70">
              Your name
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              className="mt-1 w-full rounded-md border border-line bg-surface-2 px-3 py-2 outline-none focus:border-amber-text"
            />
          </div>
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
              minLength={8}
              className="mt-1 w-full rounded-md border border-line bg-surface-2 px-3 py-2 outline-none focus:border-amber-text"
            />
          </div>

          {state.error && <p className="text-sm text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-amber px-3 py-2 font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Submitting..." : "Request to join"}
          </button>
        </form>

        <p className="mt-6 text-sm text-paper/60">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-text hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
