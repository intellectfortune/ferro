import { createServiceClient } from "@/lib/supabase/service";

const AUTHORIZE_URL = "https://app.pandadoc.com/oauth2/authorize";
const TOKEN_URL = "https://api.pandadoc.com/oauth2/access_token";
const API_BASE_URL = "https://api.pandadoc.com/public/v1";

type PandaDocCredentials = {
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO timestamp
};

function clientCreds() {
  const clientId = process.env.PANDADOC_CLIENT_ID;
  const clientSecret = process.env.PANDADOC_CLIENT_SECRET;
  const redirectUri = process.env.PANDADOC_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("PandaDoc env vars are not fully set.");
  }
  return { clientId, clientSecret, redirectUri };
}

export function pandadocAuthorizeUrl(state: string) {
  const { clientId, redirectUri } = clientCreds();
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "read+write");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

async function requestToken(body: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });

  if (!res.ok) {
    throw new Error(`PandaDoc token request failed: ${await res.text()}`);
  }

  const json = (await res.json()) as TokenResponse;
  const credentials: PandaDocCredentials = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: new Date(Date.now() + json.expires_in * 1000).toISOString(),
  };
  return credentials;
}

/** Called once from /api/pandadoc/callback with the code from the redirect. */
export async function connectPandaDoc(companyId: string, code: string) {
  const { clientId, clientSecret } = clientCreds();
  const credentials = await requestToken({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    scope: "read+write",
  });

  const supabase = createServiceClient();
  const { error } = await supabase.from("company_connections").upsert(
    {
      company_id: companyId,
      provider: "pandadoc",
      status: "connected",
      credentials: credentials as unknown as Record<string, unknown>,
      connected_at: new Date().toISOString(),
    },
    { onConflict: "company_id,provider" }
  );
  if (error) throw new Error(error.message);
}

async function getStoredCredentials(companyId: string) {
  const supabase = createServiceClient();
  const { data: connection } = await supabase
    .from("company_connections")
    .select("credentials, status")
    .eq("company_id", companyId)
    .eq("provider", "pandadoc")
    .single();

  if (!connection || connection.status !== "connected" || !connection.credentials) {
    return null;
  }
  return connection.credentials as unknown as PandaDocCredentials;
}

async function refreshAndStore(companyId: string, refreshToken: string) {
  const { clientId, clientSecret } = clientCreds();
  const credentials = await requestToken({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const supabase = createServiceClient();
  await supabase
    .from("company_connections")
    .update({ credentials: credentials as unknown as Record<string, unknown> })
    .eq("company_id", companyId)
    .eq("provider", "pandadoc");

  return credentials;
}

/**
 * Returns a valid access token for the company's PandaDoc connection,
 * refreshing it first if it's expired or about to be (PandaDoc tokens
 * last ~1 year, but this still checks every call so a stale connection
 * self-heals). Returns null if the company hasn't connected PandaDoc.
 */
async function getValidAccessToken(companyId: string) {
  const credentials = await getStoredCredentials(companyId);
  if (!credentials) return null;

  const expiresInMs = new Date(credentials.expires_at).getTime() - Date.now();
  if (expiresInMs > 60_000) return credentials.access_token;

  const refreshed = await refreshAndStore(companyId, credentials.refresh_token);
  return refreshed.access_token;
}

async function pandadocFetch<T>(
  companyId: string,
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const accessToken = await getValidAccessToken(companyId);
  if (!accessToken) return null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`PandaDoc API error (${res.status}): ${await res.text()}`);
  }

  return (await res.json()) as T;
}

export type PandaDocTemplate = {
  id: string;
  name: string;
  dateCreated: string | null;
  dateModified: string | null;
};

/** Templates that already exist in the company's own PandaDoc account. */
export async function listPandaDocTemplates(companyId: string) {
  const json = await pandadocFetch<{
    results?: { id: string; name: string; date_created?: string; date_modified?: string }[];
  }>(companyId, "/templates?count=100");

  if (!json) return null;

  return (json.results ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    dateCreated: t.date_created ?? null,
    dateModified: t.date_modified ?? null,
  })) satisfies PandaDocTemplate[];
}
