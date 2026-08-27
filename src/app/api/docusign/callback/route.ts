import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { exchangeDocusignCode } from "@/lib/docusign";
import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit } from "@/lib/rate-limit";

const STATE_COOKIE = "docusign_oauth_state";
const CONNECTIONS_PATH = "/dashboard/settings";

export async function GET(request: NextRequest) {
  const rl = await checkRateLimit("general");
  if (!rl.ok) return redirectWithStatus(request, "error", rl.error);

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (oauthError) {
    return redirectWithStatus(request, "error", `DocuSign: ${oauthError}`);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithStatus(request, "error", "DocuSign authorization failed (bad state).");
  }

  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    return redirectWithStatus(request, "error", "You don't have permission to connect DocuSign.");
  }

  try {
    const credentials = await exchangeDocusignCode(code);

    const supabase = createServiceClient();
    const { error } = await supabase.from("company_connections").upsert(
      {
        company_id: profile.company_id,
        provider: "docusign",
        status: "connected",
        credentials: credentials as unknown as Record<string, unknown>,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "company_id,provider" }
    );

    if (error) {
      return redirectWithStatus(request, "error", error.message);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "DocuSign connection failed.";
    return redirectWithStatus(request, "error", message);
  }

  return redirectWithStatus(request, "connected");
}

function redirectWithStatus(request: NextRequest, status: string, message?: string) {
  const url = new URL(CONNECTIONS_PATH, request.url);
  url.searchParams.set("docusign", status);
  if (message) url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}
