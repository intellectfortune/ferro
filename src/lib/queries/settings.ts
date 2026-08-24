import { createClient } from "@/lib/supabase/server";
import type { ConnectionProvider, ConnectionStatus } from "@/types/database";

export async function getCompanyDetails(companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id, name, slug, logo_url")
    .eq("id", companyId)
    .single();

  return data;
}

const ALL_PROVIDERS: { provider: ConnectionProvider; label: string }[] = [
  { provider: "stripe", label: "Stripe" },
  { provider: "instagram", label: "Instagram" },
  { provider: "bouncie", label: "Bouncie GPS" },
  { provider: "google_ads", label: "Google Ads" },
  { provider: "meta_ads", label: "Meta Ads" },
  { provider: "docusign", label: "DocuSign" },
  { provider: "pandadoc", label: "PandaDoc" },
];

export async function listConnectionStatuses() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("company_connection_statuses");
  const byProvider = new Map(
    (data ?? []).map((row) => [row.provider, row.status])
  );

  // Stripe is configured at the platform level today (one shared Stripe
  // account handles invoicing for every company), not via a per-company
  // OAuth connection yet — so there's no row in company_connections for
  // it. Reflect that honestly here rather than showing "not connected"
  // for a feature that's actually live. Once per-company Stripe Connect
  // exists, this special case goes away and Stripe reads from the table
  // like everything else.
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return ALL_PROVIDERS.map(({ provider, label }) => {
    let status: ConnectionStatus = byProvider.get(provider) ?? "disconnected";
    if (provider === "stripe" && stripeConfigured) {
      status = "connected";
    }
    return { provider, label, status };
  });
}
