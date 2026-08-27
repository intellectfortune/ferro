import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { connectPandaDoc } from "@/lib/pandadoc";
import { checkRateLimit } from "@/lib/rate-limit";

const STATE_COOKIE = "pandadoc_oauth_state";
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
    return redirectWithStatus(request, "error", `PandaDoc: ${oauthError}`);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithStatus(request, "error", "PandaDoc authorization failed (bad state).");
  }

  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    return redirectWithStatus(request, "error", "You don't have permission to connect PandaDoc.");
  }

  try {
    await connectPandaDoc(profile.company_id, code);
  } catch (err) {
    const message = err instanceof Error ? err.message : "PandaDoc connection failed.";
    return redirectWithStatus(request, "error", message);
  }

  return redirectWithStatus(request, "connected");
}

function redirectWithStatus(request: NextRequest, status: string, message?: string) {
  const url = new URL(CONNECTIONS_PATH, request.url);
  url.searchParams.set("pandadoc", status);
  if (message) url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}
