"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpOwner, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    signUpOwner,
    initialState
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-mono text-sm uppercase tracking-widest text-amber-text">
          Ferro
        </h1>
        <h2 className="mt-2 text-2xl font-semibold">Create your company</h2>
        <p className="mt-1 text-sm text-paper/60">
          This account becomes the company owner.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="company_name" className="block text-sm text-paper/70">
              Company name
            </label>
            <input
              id="company_name"
              name="company_name"
              required
              placeholder="Apex Exotics"
              className="mt-1 w-full rounded-md border border-line bg-surface-2 px-3 py-2 outline-none focus:border-amber-text"
            />
          </div>
          <div>
            <label htmlFor="company_slug" className="block text-sm text-paper/70">
              Public URL slug
            </label>
            <input
              id="company_slug"
              name="company_slug"
              required
              placeholder="apex-exotics"
              className="mt-1 w-full rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-sm outline-none focus:border-amber-text"
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

          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-amber px-3 py-2 font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Creating..." : "Create company"}
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
