import type { Metadata } from "next";
import { getWaitlistCount } from "@/lib/queries/waitlist";
import { WaitlistForm } from "../waitlist-form";

export const metadata: Metadata = {
  title: "Join the waitlist — Ferro",
  description: "Early access opens soon for exotic and luxury rental fleet owners.",
};

export default async function WaitlistPage() {
  const waitlistCount = await getWaitlistCount();

  return (
    <div className="mx-auto max-w-[1100px] px-6">
      <section className="py-28 text-center sm:py-36">
        <h1 className="mb-5 text-[32px] font-extrabold tracking-tight sm:text-[44px]">
          Ready to run a tighter fleet?
        </h1>
        <p className="mb-9 text-base text-muted sm:text-[17px]">
          Join the waitlist — early access opens soon.
        </p>
        <WaitlistForm initialCount={waitlistCount} />
      </section>
    </div>
  );
}
