import type { Metadata } from "next";
import { PricingCards } from "../pricing-cards";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, flat pricing for exotic and luxury rental fleets.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6">
      <section className="py-20 sm:py-24">
        <div className="mb-14 text-center">
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-amber-text">
            Simple pricing
          </div>
          <h1 className="text-[32px] font-extrabold tracking-tight sm:text-[44px]">
            Built for how fleets actually grow
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[17px] text-muted">
            No per-vehicle fees, no setup cost. Pick the plan that matches
            your fleet size today — switch anytime as it grows.
          </p>
        </div>
        <PricingCards />
      </section>
    </div>
  );
}
