import { createServiceClient } from "@/lib/supabase/service";
import { getSiteUrl } from "@/lib/site-url";

const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE_URL = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

const FETCH_TIMEOUT_MS = 10_000;

type GoogleCalendarCredentials = {
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO timestamp
};

function clientCreds() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar env vars are not fully set.");
  }
  return { clientId, clientSecret, redirectUri: `${getSiteUrl()}/api/google-calendar/callback` };
}

export function googleCalendarAuthorizeUrl(state: string) {
  const { clientId, redirectUri } = clientCreds();
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("state", state);
  // Without these two, Google only ever returns a refresh_token on the
  // very first authorization for this app+account combination — a
  // reconnect (e.g. after disconnecting) would silently get an
  // access_token with no way to refresh it later.
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  return url;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

async function requestToken(body: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Google Calendar token request failed: ${await res.text()}`);
  }

  return (await res.json()) as TokenResponse;
}

/** Called once from /api/google-calendar/callback with the code from the redirect. */
export async function connectGoogleCalendar(companyId: string, code: string) {
  const { clientId, clientSecret, redirectUri } = clientCreds();
  const json = await requestToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  if (!json.refresh_token) {
    throw new Error(
      "Google didn't return a refresh token — disconnect and reconnect to force a fresh consent screen."
    );
  }

  const credentials: GoogleCalendarCredentials = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: new Date(Date.now() + json.expires_in * 1000).toISOString(),
  };

  const supabase = createServiceClient();
  const { error } = await supabase.from("company_connections").upsert(
    {
      company_id: companyId,
      provider: "google_calendar",
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
    .eq("provider", "google_calendar")
    .single();

  if (!connection || connection.status !== "connected" || !connection.credentials) {
    return null;
  }
  return connection.credentials as unknown as GoogleCalendarCredentials;
}

async function refreshAndStore(companyId: string, refreshToken: string) {
  const { clientId, clientSecret } = clientCreds();
  const json = await requestToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  // Google's refresh response usually omits refresh_token entirely —
  // it's not being rotated, so keep the one we already have.
  const credentials: GoogleCalendarCredentials = {
    access_token: json.access_token,
    refresh_token: json.refresh_token ?? refreshToken,
    expires_at: new Date(Date.now() + json.expires_in * 1000).toISOString(),
  };

  const supabase = createServiceClient();
  await supabase
    .from("company_connections")
    .update({ credentials: credentials as unknown as Record<string, unknown> })
    .eq("company_id", companyId)
    .eq("provider", "google_calendar");

  return credentials;
}

// Same reasoning as bouncie.ts's inFlightRefresh: several bookings could
// sync concurrently (e.g. a bulk action), and a check-then-await-then-set
// gap here would let them race to refresh with the same refresh token.
// This closes that gap by registering the promise before any await.
const inFlightRefresh = new Map<string, Promise<string | null>>();

async function resolveAccessToken(companyId: string, forceRefresh: boolean) {
  const credentials = await getStoredCredentials(companyId);
  if (!credentials) return null;

  if (!forceRefresh) {
    const expiresInMs = new Date(credentials.expires_at).getTime() - Date.now();
    if (expiresInMs > 120_000) return credentials.access_token;
  }

  const refreshed = await refreshAndStore(companyId, credentials.refresh_token);
  return refreshed.access_token;
}

function getValidAccessToken(companyId: string, forceRefresh = false): Promise<string | null> {
  const existing = inFlightRefresh.get(companyId);
  if (existing) return existing;

  const promise = resolveAccessToken(companyId, forceRefresh).finally(() => {
    inFlightRefresh.delete(companyId);
  });
  inFlightRefresh.set(companyId, promise);
  return promise;
}

async function googleCalendarFetch<T>(
  companyId: string,
  path: string,
  init?: RequestInit,
  isRetry = false
): Promise<T | null> {
  const accessToken = await getValidAccessToken(companyId, isRetry);
  if (!accessToken) return null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (res.status === 401 && !isRetry) {
    return googleCalendarFetch<T>(companyId, path, init, true);
  }

  if (res.status === 404 || res.status === 410) {
    // Event already gone (or never existed) — not an error for our purposes.
    return null;
  }

  if (!res.ok) {
    throw new Error(`Google Calendar API error (${res.status}): ${await res.text()}`);
  }

  if (res.status === 204) return null;
  return (await res.json()) as T;
}

export type BookingCalendarDetails = {
  customerName: string;
  vehicleLabel: string;
  startAt: string;
  endAt: string;
  notes?: string | null;
};

function eventBody(details: BookingCalendarDetails) {
  return {
    summary: `${details.vehicleLabel} — ${details.customerName}`,
    description: details.notes ?? undefined,
    start: { dateTime: details.startAt },
    end: { dateTime: details.endAt },
  };
}

/** Returns the new event's id, or null if the company hasn't connected Google Calendar. */
export async function createGoogleCalendarEvent(
  companyId: string,
  details: BookingCalendarDetails
) {
  const event = await googleCalendarFetch<{ id: string }>(companyId, "/calendars/primary/events", {
    method: "POST",
    body: JSON.stringify(eventBody(details)),
  });
  return event?.id ?? null;
}

export async function updateGoogleCalendarEvent(
  companyId: string,
  eventId: string,
  details: BookingCalendarDetails
) {
  await googleCalendarFetch(companyId, `/calendars/primary/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(eventBody(details)),
  });
}

export async function deleteGoogleCalendarEvent(companyId: string, eventId: string) {
  await googleCalendarFetch(companyId, `/calendars/primary/events/${eventId}`, {
    method: "DELETE",
  });
}
