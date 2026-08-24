import Link from "next/link";
import { getWaitlistCount } from "@/lib/queries/waitlist";
import { WaitlistForm } from "./waitlist-form";
import { HeroMockup } from "./hero-mockup";
import { PricingCards } from "./pricing-cards";

const FEATURES = [
  {
    icon: (
      <path d="M3 12l1.5-5A2 2 0 016.4 5.5h7.2a2 2 0 011.9 1.5L17 12M2.5 12h15v3.5a1 1 0 01-1 1h-13a1 1 0 01-1-1V12z" />
    ),
    title: "Website & listings",
    desc: "Type in your car's details and it's live on your site — no web design needed.",
  },
  {
    icon: <path d="M2.5 3.5h15v14h-15zM2.5 8h15M6.5 12h2M6.5 15h5" />,
    title: "CRM & calendar",
    desc: "Bookings, service events, and your whole team's schedule in one view.",
  },
  {
    icon: <path d="M3 6.5l7-4 7 4v7l-7 4-7-4v-7zM3 6.5l7 4 7-4M10 10.5V17.5" />,
    title: "Billing & invoicing",
    desc: "Real Stripe invoicing, revenue tracking, and payment status at a glance.",
  },
  {
    icon: (
      <path d="M7 6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M14.5 7a2 2 0 100 4 2 2 0 000-4zM12.5 11c1.8.2 3 1.4 3.5 3" />
    ),
    title: "Team management",
    desc: "Bring employees on with scoped CRM access — billing and listings stay yours to control.",
  },
  {
    icon: <path d="M3 3v14M3 12l4-3 3 2 5-6" />,
    title: "Ad campaigns",
    desc: "Launch Google & Meta ads for your listings straight from Ferro.",
    soon: true,
  },
  {
    icon: <path d="M2.5 4h15v12h-15zM2.5 5.5l7.5 5 7.5-5" />,
    title: "DM automation",
    desc: "Auto-reply to Instagram booking inquiries without lifting a finger.",
    soon: true,
  },
];

const BRANDS = ["Lamborghini", "McLaren", "Ferrari", "Rolls-Royce", "Porsche"];

export default async function MarketingHomePage() {
  const waitlistCount = await getWaitlistCount();

  return (
    <>
      <div className="mx-auto max-w-[1100px] px-6">
        <section className="pt-20 pb-16 text-center sm:pt-24">
          <div className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-amber-text">
            Now onboarding early fleet owners
          </div>
          <h1 className="mx-auto max-w-[780px] text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-[56px] lg:text-[68px]">
            One system to <span className="text-amber-text">run</span> your
            exotic rental fleet.
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-lg text-muted sm:text-[19px]">
            Website, CRM, calendar, invoicing, and fleet listings — built for
            owners running their own exotic and luxury rental fleet. No more
            five different tools.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/waitlist"
              className="rounded-[10px] bg-amber px-7 py-[15px] text-[15px] font-bold text-on-amber transition hover:brightness-110"
            >
              Join the waitlist
            </Link>
            <a
              href="#features"
              className="rounded-[10px] border border-line px-7 py-[15px] text-[15px] font-semibold text-paper transition hover:border-amber-text"
            >
              See how it works
            </a>
          </div>
          <div className="mt-5 font-mono text-xs text-muted-dim">
            No credit card required · Early access pricing
          </div>

          <div className="mt-16">
            <HeroMockup />
          </div>
        </section>
      </div>

      <div className="border-y border-line py-12 text-center">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-wide text-muted-dim">
          Built for owners running
        </div>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-3 px-6 text-[15px] font-semibold text-muted-dim">
          {BRANDS.map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-6">
        <section id="features" className="py-24">
          <div className="mb-14 text-center">
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-amber-text">
              Everything in one place
            </div>
            <h2 className="text-[32px] font-extrabold tracking-tight sm:text-[38px]">
              Stop juggling five tools
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[16px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-ink p-8">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-soft">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-[19px] w-[19px] text-amber-text"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="mb-2 text-[16.5px] font-bold">{feature.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-muted">
                  {feature.desc}
                </p>
                {feature.soon && (
                  <span className="mt-3 inline-block rounded-full border border-line px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-muted-dim">
                    Coming soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="bg-surface py-24">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mb-14 text-center">
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-amber-text">
              Simple pricing
            </div>
            <h2 className="text-[32px] font-extrabold tracking-tight sm:text-[38px]">
              Built for how fleets actually grow
            </h2>
          </div>
          <PricingCards />
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-6">
        <section className="py-28 text-center">
          <h2 className="mb-5 text-[32px] font-extrabold tracking-tight sm:text-[40px]">
            Ready to run a tighter fleet?
          </h2>
          <p className="mb-9 text-base text-muted">
            Join the waitlist — early access opens soon.
          </p>
          <WaitlistForm initialCount={waitlistCount} />
        </section>
      </div>
    </>
  );
}
