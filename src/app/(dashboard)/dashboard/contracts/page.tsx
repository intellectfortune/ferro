import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import { listConnectionStatuses } from "@/lib/queries/settings";
import { listDocusignTemplates } from "@/lib/docusign";

export default async function ContractsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const connections = await listConnectionStatuses();
  const docusignConnected =
    connections.find((c) => c.provider === "docusign")?.status === "connected";

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Contracts</h1>

      {!docusignConnected ? (
        <div className="rounded-[14px] border border-line bg-surface p-6">
          <h2 className="text-base font-bold">Connect DocuSign</h2>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
            Contracts are sent from your own DocuSign account and its
            existing templates — connect it to get started.
          </p>
          {canManageVehicles(profile.role) ? (
            <Link
              href="/api/docusign/authorize"
              className="mt-5 inline-block rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
            >
              Connect DocuSign →
            </Link>
          ) : (
            <p className="mt-5 text-sm text-muted">
              Ask an owner or broker to connect DocuSign from Settings.
            </p>
          )}
        </div>
      ) : (
        <TemplateList companyId={profile.company_id} />
      )}
    </div>
  );
}

async function TemplateList({ companyId }: { companyId: string }) {
  let templates: Awaited<ReturnType<typeof listDocusignTemplates>> = [];
  let loadError: string | null = null;

  try {
    templates = await listDocusignTemplates(companyId);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load templates.";
  }

  if (loadError) {
    return (
      <div className="rounded-[14px] border border-line bg-surface p-6">
        <p className="text-sm text-red-400">{loadError}</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-[14px] border border-line bg-surface p-6">
        <h2 className="text-base font-bold">No templates yet</h2>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
          DocuSign is connected, but there are no templates in this account
          yet. Create one in DocuSign and it&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
      {templates.map((template) => (
        <div
          key={template.templateId}
          className="flex items-center justify-between border-b border-line px-5 py-4 last:border-b-0"
        >
          <div>
            <div className="text-sm font-semibold">{template.name}</div>
            {template.created && (
              <div className="mt-0.5 font-mono text-[11px] text-muted">
                Created {new Date(template.created).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
