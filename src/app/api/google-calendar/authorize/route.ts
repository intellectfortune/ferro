import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { googleCalendarAuthorizeUrl } from "@/lib/google-calendar";

const STATE_COOKIE = "google_calendar_oauth_state";

export async function GET() {
  const rl = await checkRateLimit("general");
  if (!rl.ok) return NextResponse.json({ error: rl.error }, { status: 429 });

  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    return NextResponse.json(
      { error: "You don't have permission to connect Google Calendar." },
      { status: 403 }
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  try {
    return NextResponse.redirect(googleCalendarAuthorizeUrl(state));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google Calendar is not configured.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
