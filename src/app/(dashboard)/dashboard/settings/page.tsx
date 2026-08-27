import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { getCompanyDetails, listConnectionStatuses } from "@/lib/queries/settings";
import { sumRevenueThisMonth, sumRevenueLastMonth, listInvoices } from "@/lib/queries/invoices";
import { CompanyProfileForm } from "./company-profile-form";
import { DisconnectButton } from "./disconnect-button";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-6">
      <h2 className="text-base font-bold">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

const CONNECT_HREF: Partial<Record<string, string>> = {
  docusign: "/api/docusign/authorize",
  bouncie: "/api/bouncie/authorize",
  pandadoc: "/api/pandadoc/authorize",
};

const PROVIDER_LABEL: Partial<Record<string, string>> = {
  docusign: "DocuSign",
  bouncie: "Bouncie",
  pandadoc: "PandaDoc",
};

function ConnectionStatusBanner({
  provider,
  status,
  message,
}: {
  provider: string;
  status: string;
  message?: string;
}) {
  return (
    <div
      className={`mb-6 rounded-[9px] border px-4 py-3 text-sm ${
        status === "connected"
          ? "border-amber-text/40 bg-amber-soft text-amber-text"
          : "border-red-400/40 bg-red-400/10 text-red-400"
      }`}
    >
      {status === "connected"
        ? `${PROVIDER_LABEL[provider] ?? provider} connected.`
        : (message ?? `${PROVIDER_LABEL[provider] ?? provider} connection failed.`)}
    </div>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    docusign?: string;
    bouncie?: string;
    pandadoc?: string;
    message?: string;
  }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!isFleetManagerOrAbove(profile.role)) redirect("/dashboard");

  const {
    docusign: docusignStatus,
    bouncie: bouncieStatus,
    pandadoc: pandadocStatus,
    message,
  } = await searchParams;

  const [company, connections, revenue, revenueLastMonth, invoices] = await Promise.all([
    getCompanyDetails(profile.company_id),
    listConnectionStatuses(),
    sumRevenueThisMonth(),
    sumRevenueLastMonth(),
    listInvoices(),
  ]);

  if (!company) redirect("/dashboard");

  const revenueChangePct = revenueLastMonth
    ? Math.round(((revenue - revenueLastMonth) / revenueLastMonth) * 100)
    : null;
  const invoicesThisMonth = invoices.filter((inv) => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return new Date(inv.created_at) >= monthStart;
  }).length;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Settings</h1>

      {docusignStatus && (
        <ConnectionStatusBanner provider="docusign" status={docusignStatus} message={message} />
      )}
      {bouncieStatus && (
        <ConnectionStatusBanner provider="bouncie" status={bouncieStatus} message={message} />
      )}
      {pandadocStatus && (
        <ConnectionStatusBanner provider="pandadoc" status={pandadocStatus} message={message} />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Company profile"
          description="Your business name and public storefront URL."
        >
          <CompanyProfileForm name={company.name} slug={company.slug} />
        </SectionCard>

        <SectionCard
          title="Plan & billing"
          description="Ferro is in early access — usage-based plans are coming. Rental invoicing is live today."
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-muted">
                Revenue this month
              </div>
              <div className="mt-1 text-2xl font-bold">
                ${revenue.toLocaleString()}
              </div>
              <div
                className={`mt-1 text-[11.5px] font-medium ${
                  revenueChangePct !== null && revenueChangePct >= 0
                    ? "text-amber-text"
                    : "text-muted"
                }`}
              >
                {revenueChangePct !== null
                  ? `${revenueChangePct >= 0 ? "+" : ""}${revenueChangePct}% vs last`
                  : "First month of revenue"}
              </div>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-muted">
                Invoices sent
              </div>
              <div className="mt-1 text-2xl font-bold">{invoices.length}</div>
              <div className="mt-1 text-[11.5px] font-medium text-muted">
                {invoicesThisMonth > 0 ? `${invoicesThisMonth} this month` : "None this month"}
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="mt-5 inline-block font-mono text-xs text-amber-text hover:underline"
          >
            View billing →
          </Link>
        </SectionCard>

        <SectionCard
          title="Connections"
          description="Third-party integrations for this company."
        >
          <div className="space-y-3">
            {connections.map((connection) => (
              <div
                key={connection.provider}
                className="flex items-center justify-between rounded-[9px] border border-line px-4 py-3"
              >
                <span className="text-sm font-medium">{connection.label}</span>
                {connection.status === "connected" ? (
                  CONNECT_HREF[connection.provider] ? (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-soft px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-text">
                        Connected
                      </span>
                      <DisconnectButton
                        provider={connection.provider}
                        label={connection.label}
                      />
                    </div>
                  ) : (
                    <span className="rounded-full bg-amber-soft px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-text">
                      Connected
                    </span>
                  )
                ) : CONNECT_HREF[connection.provider] ? (
                  <Link
                    href={CONNECT_HREF[connection.provider]!}
                    className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-paper/80 transition hover:text-amber-text"
                  >
                    Connect →
                  </Link>
                ) : (
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-muted">
                    Not connected
                  </span>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Team"
          description="Manage who has access to your Ferro account."
        >
          <Link
            href="/dashboard/team"
            className="inline-block rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
          >
            Manage team →
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
