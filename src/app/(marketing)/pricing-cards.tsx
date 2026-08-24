import Link from "next/link";

const CHECK = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 flex-shrink-0 text-amber-text">
    <path d="M4 10l4 4 8-8" />
  </svg>
);

const PLANS = [
  {
    name: "Starter · Under 5 vehicles",
    price: "$249",
    period: "/4 weeks",
    desc: "For fleets just getting organized",
    features: [
      "Website & listings",
      "CRM & calendar",
      "Billing & invoicing",
      "1 employee seat included",
    ],
    featured: false,
  },
  {
    name: "Fleet · 5+ vehicles",
    price: "$500",
    period: "/4 weeks",
    desc: "For established, growing fleets",
    features: [
      "Everything in Starter",
      "Unlimited vehicles",
      "3 employee seats included",
      "Priority support",
    ],
    featured: true,
  },
];

export function PricingCards() {
  return (
    <div>
      <div className="mx-auto grid max-w-[760px] grid-cols-1 gap-5 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-[16px] border bg-ink p-9 ${
              plan.featured ? "border-amber-text" : "border-line"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-8 rounded-full bg-amber px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-on-amber">
                Most fleets
              </span>
            )}
            <h3 className="font-mono text-[13px] font-semibold uppercase tracking-wide text-muted">
              {plan.name}
            </h3>
            <div className="mt-3 mb-1 text-[42px] font-extrabold leading-none tracking-tight text-paper">
              {plan.price}
              <span className="text-[15px] font-medium text-muted">{plan.period}</span>
            </div>
            <div className="mb-6 text-[13px] text-muted">{plan.desc}</div>
            <ul className="mb-7">
              {plan.features.map((feature, i) => (
                <li
                  key={feature}
                  className={`flex items-center gap-2.5 py-2 text-[13.5px] text-paper ${
                    i > 0 ? "border-t border-line" : ""
                  }`}
                >
                  {CHECK}
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/waitlist"
              className={`block rounded-[9px] py-3.5 text-center text-sm font-bold transition hover:brightness-110 ${
                plan.featured
                  ? "bg-amber text-on-amber"
                  : "bg-surface-2 text-paper"
              }`}
            >
              Join waitlist
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center font-mono text-[12.5px] text-muted-dim">
        Additional employee seats $2.99/mo each, on either plan
      </p>
    </div>
  );
}
