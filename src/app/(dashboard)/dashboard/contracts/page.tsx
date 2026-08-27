import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { listConnectionStatuses } from "@/lib/queries/settings";
import { listDocusignTemplates } from "@/lib/docusign";
import { listPandaDocTemplates } from "@/lib/pandadoc";

type UnifiedTemplate = {
  id: string;
  name: string;
  created: string | null;
  source: "docusign" | "pandadoc";
};

const SOURCE_LABEL: Record<UnifiedTemplate["source"], string> = {
  docusign: "DocuSign",
  pandadoc: "PandaDoc",
};

export default async function ContractsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const connections = await listConnectionStatuses();
  const docusignConnected =
    connections.find((c) => c.provider === "docusign")?.status === "connected";
  const pandadocConnected =
    connections.find((c) => c.provider === "pandadoc")?.status === "connected";
  const canManage = isFleetManagerOrAbove(profile.role);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Contracts</h1>

      {!docusignConnected && !pandadocConnected ? (
        <div className="rounded-[14px] border border-line bg-surface p-6">
          <h2 className="text-base font-bold">Connect an e-signature provider</h2>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
            Contracts are sent from your own DocuSign or PandaDoc account and
            its existing templates — connect either (or both) to get started.
          </p>
          {canManage ? (
            <div className="mt-5 flex gap-3">
              <Link
                href="/api/docusign/authorize"
                className="inline-block rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
              >
                Connect DocuSign →
              </Link>
              <Link
                href="/api/pandadoc/authorize"
                className="inline-block rounded-[9px] border border-line px-4 py-2 text-sm font-medium text-paper transition hover:border-amber-text hover:text-amber-text"
              >
                Connect PandaDoc →
              </Link>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">
              Ask an owner or broker to connect one from Settings.
            </p>
          )}
        </div>
      ) : (
        <>
          <TemplateList
            companyId={profile.company_id}
            docusignConnected={docusignConnected}
            pandadocConnected={pandadocConnected}
          />
          {(!docusignConnected || !pandadocConnected) && canManage && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted">
              <span>Also using {!docusignConnected ? "DocuSign" : "PandaDoc"}?</span>
              <Link
                href={!docusignConnected ? "/api/docusign/authorize" : "/api/pandadoc/authorize"}
                className="text-amber-text hover:underline"
              >
                Connect it too →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

async function TemplateList({
  companyId,
  docusignConnected,
  pandadocConnected,
}: {
  companyId: string;
  docusignConnected: boolean;
  pandadocConnected: boolean;
}) {
  const templates: UnifiedTemplate[] = [];
  const errors: string[] = [];

  await Promise.all([
    docusignConnected
      ? listDocusignTemplates(companyId)
          .then((list) => {
            templates.push(
              ...list.map((t) => ({
                id: t.templateId,
                name: t.name,
                created: t.created,
                source: "docusign" as const,
              }))
            );
          })
          .catch((err) => {
            errors.push(err instanceof Error ? err.message : "Failed to load DocuSign templates.");
          })
      : Promise.resolve(),
    pandadocConnected
      ? listPandaDocTemplates(companyId)
          .then((list) => {
            templates.push(
              ...(list ?? []).map((t) => ({
                id: t.id,
                name: t.name,
                created: t.dateCreated,
                source: "pandadoc" as const,
              }))
            );
          })
          .catch((err) => {
            errors.push(err instanceof Error ? err.message : "Failed to load PandaDoc templates.");
          })
      : Promise.resolve(),
  ]);

  if (errors.length > 0) {
    return (
      <div className="rounded-[14px] border border-line bg-surface p-6">
        {errors.map((err) => (
          <p key={err} className="text-sm text-red-400">
            {err}
          </p>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-[14px] border border-line bg-surface p-6">
        <h2 className="text-base font-bold">No templates yet</h2>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
          You&apos;re connected, but there are no templates in that account
          yet. Create one there and it&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
      {templates.map((template) => (
        <div
          key={`${template.source}-${template.id}`}
          className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-b-0"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{template.name}</div>
            {template.created && (
              <div className="mt-0.5 font-mono text-[11px] text-muted">
                Created {new Date(template.created).toLocaleDateString()}
              </div>
            )}
          </div>
          <span className="flex-shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-muted">
            {SOURCE_LABEL[template.source]}
          </span>
        </div>
      ))}
    </div>
  );
}
