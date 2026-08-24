import type { Metadata } from "next";
import { MarketingNav } from "./marketing-nav";
import { MarketingFooter } from "./marketing-footer";

export const metadata: Metadata = {
  title: "Ferro — Run your exotic rental fleet",
  description:
    "Website, CRM, calendar, invoicing, and fleet listings — one system built for owners running their own exotic and luxury rental fleet.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-scope flex min-h-screen flex-col bg-ink text-paper">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
