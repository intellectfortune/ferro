import { createServiceClient } from "@/lib/supabase/service";

type DocusignCredentials = {
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO timestamp
  base_uri: string;
  account_id: string;
};

function authServer() {
  const host = process.env.DOCUSIGN_AUTH_SERVER;
  if (!host) throw new Error("DOCUSIGN_AUTH_SERVER is not set.");
  return host;
}

function basicAuthHeader() {
  const key = process.env.DOCUSIGN_INTEGRATION_KEY;
  const secret = process.env.DOCUSIGN_SECRET_KEY;
  if (!key || !secret) {
    throw new Error("DOCUSIGN_INTEGRATION_KEY / DOCUSIGN_SECRET_KEY are not set.");
  }
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

/**
 * Exchanges an OAuth authorization code for an access/refresh token pair,
 * then resolves the account's base URI via userinfo. Called once from the
 * /api/docusign/callback route.
 */
export async function exchangeDocusignCode(code: string) {
  const tokenRes = await fetch(`https://${authServer()}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`DocuSign token exchange failed: ${await tokenRes.text()}`);
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const userInfoRes = await fetch(`https://${authServer()}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!userInfoRes.ok) {
    throw new Error(`DocuSign userinfo failed: ${await userInfoRes.text()}`);
  }
  const userInfo = (await userInfoRes.json()) as {
    accounts: { account_id: string; base_uri: string; is_default: boolean }[];
  };

  const wantedAccountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const account =
    userInfo.accounts.find((a) => a.account_id === wantedAccountId) ??
    userInfo.accounts.find((a) => a.is_default) ??
    userInfo.accounts[0];

  if (!account) {
    throw new Error("DocuSign userinfo returned no accounts.");
  }

  const credentials: DocusignCredentials = {
    access_token: tokenJson.access_token,
    refresh_token: tokenJson.refresh_token,
    expires_at: new Date(Date.now() + tokenJson.expires_in * 1000).toISOString(),
    base_uri: account.base_uri,
    account_id: account.account_id,
  };

  return credentials;
}

async function refreshDocusignToken(
  refreshToken: string
): Promise<Pick<DocusignCredentials, "access_token" | "refresh_token" | "expires_at">> {
  const res = await fetch(`https://${authServer()}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`DocuSign token refresh failed: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: new Date(Date.now() + json.expires_in * 1000).toISOString(),
  };
}

/**
 * Returns a valid (non-expired) access token + account info for the given
 * company's DocuSign connection, refreshing and persisting a new one if
 * the stored token is expired or about to expire. Throws if the company
 * hasn't connected DocuSign yet.
 */
export async function getValidDocusignAccessToken(companyId: string) {
  const supabase = createServiceClient();
  const { data: connection, error } = await supabase
    .from("company_connections")
    .select("credentials, status")
    .eq("company_id", companyId)
    .eq("provider", "docusign")
    .single();

  if (error || !connection || connection.status !== "connected" || !connection.credentials) {
    throw new Error("DocuSign is not connected for this company.");
  }

  const credentials = connection.credentials as unknown as DocusignCredentials;
  const expiresInMs = new Date(credentials.expires_at).getTime() - Date.now();

  if (expiresInMs > 60_000) {
    return credentials;
  }

  const refreshed = await refreshDocusignToken(credentials.refresh_token);
  const updated: DocusignCredentials = { ...credentials, ...refreshed };

  await supabase
    .from("company_connections")
    .update({ credentials: updated as unknown as Record<string, unknown> })
    .eq("company_id", companyId)
    .eq("provider", "docusign");

  return updated;
}

export type DocusignTemplate = {
  templateId: string;
  name: string;
  created: string | null;
};

/**
 * Lists the templates that already exist in the company's own DocuSign
 * account (not templates built inside Ferro) — the starting point for
 * picking one to send a contract from.
 */
export async function listDocusignTemplates(companyId: string) {
  const { access_token, base_uri, account_id } =
    await getValidDocusignAccessToken(companyId);

  const url = new URL(`${base_uri}/restapi/v2.1/accounts/${account_id}/templates`);
  url.searchParams.set("order_by", "name");
  url.searchParams.set("order", "asc");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    throw new Error(`DocuSign templates list failed: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    envelopeTemplates?: { templateId: string; name: string; created?: string }[];
  };

  return (json.envelopeTemplates ?? []).map((t) => ({
    templateId: t.templateId,
    name: t.name,
    created: t.created ?? null,
  })) satisfies DocusignTemplate[];
}
