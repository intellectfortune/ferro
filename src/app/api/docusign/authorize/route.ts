import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";

const STATE_COOKIE = "docusign_oauth_state";

export async function GET() {
  const rl = await checkRateLimit("general");
  if (!rl.ok) return NextResponse.json({ error: rl.error }, { status: 429 });

  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    return NextResponse.json(
      { error: "You don't have permission to connect DocuSign." },
      { status: 403 }
    );
  }

  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const authServerHost = process.env.DOCUSIGN_AUTH_SERVER;
  if (!integrationKey || !authServerHost) {
    return NextResponse.json(
      { error: "DocuSign is not configured." },
      { status: 500 }
    );
  }
  const redirectUri = `${getSiteUrl()}/api/docusign/callback`;

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  const authorizeUrl = new URL(`https://${authServerHost}/oauth/auth`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "signature");
  authorizeUrl.searchParams.set("client_id", integrationKey);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl);
}
