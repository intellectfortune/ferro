import { type EmailOtpType } from "@supabase/supabase-js";
import { ConfirmButton } from "./confirm-button";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : null;
  const type = typeof params.type === "string" ? (params.type as EmailOtpType) : null;
  const next = typeof params.next === "string" ? params.next : "/dashboard";

  if (!tokenHash || !type) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-mono text-sm uppercase tracking-widest text-amber-text">
            Ferro
          </h1>
          <p className="mt-4 text-paper/70">
            This confirmation link is missing or malformed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-mono text-sm uppercase tracking-widest text-amber-text">
          Ferro
        </h1>
        <h2 className="mt-2 text-2xl font-semibold">Confirm your email</h2>
        <p className="mt-2 text-sm text-paper/60">
          Click below to finish setting up your account.
        </p>
        <ConfirmButton tokenHash={tokenHash} type={type} next={next} />
      </div>
    </main>
  );
}
