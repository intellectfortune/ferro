import { createServiceClient } from "@/lib/supabase/service";
import { getSiteUrl } from "@/lib/site-url";

const AUTHORIZE_URL = "https://auth.bouncie.com/dialog/authorize";
const TOKEN_URL = "https://auth.bouncie.com/oauth/token";
const API_BASE_URL = "https://api.bouncie.dev/v1";

type BouncieCredentials = {
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO timestamp
};

export function bouncieAuthorizeUrl(state: string) {
  const clientId = process.env.BOUNCIE_CLIENT_ID;
  if (!clientId) {
    throw new Error("BOUNCIE_CLIENT_ID is not set.");
  }
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${getSiteUrl()}/api/bouncie/callback`);
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Bouncie token request failed: ${await res.text()}`);
  }

  const json = (await res.json()) as TokenResponse;
  const credentials: BouncieCredentials = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: new Date(Date.now() + json.expires_in * 1000).toISOString(),
  };
  return credentials;
}

function clientCreds() {
  const clientId = process.env.BOUNCIE_CLIENT_ID;
  const clientSecret = process.env.BOUNCIE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Bouncie env vars are not fully set.");
  }
  return { clientId, clientSecret, redirectUri: `${getSiteUrl()}/api/bouncie/callback` };
}

/** Called once from /api/bouncie/callback with the code from the redirect. */
export async function connectBouncie(companyId: string, code: string) {
  const { clientId, clientSecret, redirectUri } = clientCreds();
  const credentials = await requestToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const supabase = createServiceClient();
  const { error } = await supabase.from("company_connections").upsert(
    {
      company_id: companyId,
      provider: "bouncie",
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
    .eq("provider", "bouncie")
    .single();

  if (!connection || connection.status !== "connected" || !connection.credentials) {
    return null;
  }
  return connection.credentials as unknown as BouncieCredentials;
}

async function refreshAndStore(companyId: string, refreshToken: string) {
  const { clientId, clientSecret } = clientCreds();
  const credentials = await requestToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const supabase = createServiceClient();
  await supabase
    .from("company_connections")
    .update({ credentials: credentials as unknown as Record<string, unknown> })
    .eq("company_id", companyId)
    .eq("provider", "bouncie");

  return credentials;
}

// A page render fires several Bouncie calls concurrently (Promise.all across
// vehicles/trips). Without this, each call independently checks-then-refreshes
// the token, so concurrent calls near expiry race: they can each refresh with
// the same (possibly single-use) refresh token, or use a token that expires
// between the check and the request actually reaching Bouncie — producing a
// 401 from the API itself. Sharing one in-flight refresh per company avoids
// the race; on slower connections the check-to-request gap is wider, making
// this more likely to surface there.
const inFlightRefresh = new Map<string, Promise<BouncieCredentials>>();

/**
 * Returns a valid access token for the company's Bouncie connection,
 * refreshing it first if it's expired or about to be. Returns null if
 * the company hasn't connected Bouncie.
 */
async function getValidAccessToken(companyId: string) {
  const existingRefresh = inFlightRefresh.get(companyId);
  if (existingRefresh) return (await existingRefresh).access_token;

  const credentials = await getStoredCredentials(companyId);
  if (!credentials) return null;

  const expiresInMs = new Date(credentials.expires_at).getTime() - Date.now();
  if (expiresInMs > 120_000) return credentials.access_token;

  const refreshPromise = refreshAndStore(companyId, credentials.refresh_token).finally(() => {
    inFlightRefresh.delete(companyId);
  });
  inFlightRefresh.set(companyId, refreshPromise);

  const refreshed = await refreshPromise;
  return refreshed.access_token;
}

/**
 * GET against the Bouncie REST API, authenticated for this company.
 * Returns null if the company hasn't connected Bouncie.
 */
async function bouncieGet<T>(companyId: string, path: string, params?: Record<string, string>) {
  const accessToken = await getValidAccessToken(companyId);
  if (!accessToken) return null;

  const url = new URL(`${API_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  // Per Bouncie's docs: the Authorization header is the raw access
  // token, no "Bearer" prefix — that's their #1 FAQ'd 401 cause.
  const res = await fetch(url, { headers: { Authorization: accessToken } });

  if (!res.ok) {
    throw new Error(`Bouncie API error (${res.status}): ${await res.text()}`);
  }

  return (await res.json()) as T;
}

/**
 * Confirmed against a real Bouncie account's live response (2026-08-24) —
 * these field names are verified, not guessed. Notably: model.name (not
 * .model), nickName (capital N), battery.status has no numeric level,
 * and mil (Malfunction Indicator Lamp = check engine light) carries the
 * diagnostic trouble code list.
 */
export type BouncieVehicle = {
  imei: string;
  vin?: string;
  nickName?: string;
  standardEngine?: string;
  model?: { year?: number; make?: string; name?: string };
  stats?: {
    location?: { lat?: number; lon?: number; heading?: number; address?: string };
    speed?: number;
    isRunning?: boolean;
    fuelLevel?: number;
    odometer?: number;
    battery?: { status?: string; lastUpdated?: string };
    mil?: { milOn?: boolean; lastUpdated?: string; qualifiedDtcList?: string[] };
    lastUpdated?: string;
  };
};

export type BouncieTrip = {
  transactionId: string;
  startTime: string;
  endTime: string;
  distance?: number;
  averageSpeed?: number;
  maxSpeed?: number;
  fuelConsumed?: number;
  hardBrakingCount?: number;
  hardAccelerationCount?: number;
};

/** All vehicles on the company's connected Bouncie account. */
export function listBouncieVehicles(companyId: string) {
  return bouncieGet<BouncieVehicle[]>(companyId, "/vehicles");
}

/** A single vehicle by its device IMEI, or null if not found/not connected. */
export async function getBouncieVehicle(companyId: string, imei: string) {
  const vehicles = await bouncieGet<BouncieVehicle[]>(companyId, "/vehicles", { imei });
  return vehicles?.[0] ?? null;
}

export function listBouncieTrips(companyId: string, imei: string) {
  return bouncieGet<BouncieTrip[]>(companyId, "/trips", { imei, "gps-format": "geojson" });
}
