import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

let redis: Redis | null | undefined;

function getRedis() {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

/**
 * Tiers by sensitivity, not by feature — pick the tier that matches what
 * the endpoint actually risks (brute force, spam, spend) rather than one
 * per route.
 */
const TIER_CONFIG = {
  // Login/signup — brute force protection.
  auth: { limit: 5, window: "60 s" as const },
  // Unauthenticated, publicly reachable forms (contact form, waitlist).
  public: { limit: 15, window: "60 s" as const },
  // Authenticated but triggers real cost (Stripe calls) or external API spend.
  sensitive: { limit: 10, window: "60 s" as const },
  // Baseline for everything else worth covering.
  general: { limit: 60, window: "60 s" as const },
} as const;

export type RateLimitTier = keyof typeof TIER_CONFIG;

const limiters = new Map<RateLimitTier, Ratelimit>();

function getLimiter(tier: RateLimitTier) {
  const client = getRedis();
  if (!client) return null;

  let limiter = limiters.get(tier);
  if (!limiter) {
    const { limit, window } = TIER_CONFIG[tier];
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `ferro:rl:${tier}`,
    });
    limiters.set(tier, limiter);
  }
  return limiter;
}

async function clientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

let warnedMissingConfig = false;

// A rate-limit check exists to protect the app — it must never become the
// reason the app is unreachable. If Upstash is slow or down, fail open
// (same as missing config) rather than hang the request indefinitely:
// signIn() and every "sensitive"-tier action call this before doing
// anything else, so an unbounded await here blocks sign-in/sign-up/
// billing actions/etc. entirely with no error, just a permanent spinner.
const REDIS_TIMEOUT_MS = 3_000;

export type RateLimitResult = { ok: true } | { ok: false; error: string };

/**
 * Call at the top of a server action or route handler. `identifier`
 * should be the user id for authenticated endpoints, or omitted to fall
 * back to the caller's IP for public ones.
 *
 * Fails open (allows the request) if Upstash isn't configured, times out,
 * or errors — logging a one-time warning for missing config and every
 * failure otherwise. Once UPSTASH_REDIS_REST_URL/TOKEN are set, it
 * activates with no other code changes.
 */
export async function checkRateLimit(
  tier: RateLimitTier,
  identifier?: string
): Promise<RateLimitResult> {
  const limiter = getLimiter(tier);
  if (!limiter) {
    if (!warnedMissingConfig) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — requests are not being rate limited."
      );
      warnedMissingConfig = true;
    }
    return { ok: true };
  }

  const id = identifier ?? (await clientIp());

  try {
    const { success } = await Promise.race([
      limiter.limit(id),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Rate limit check timed out")), REDIS_TIMEOUT_MS)
      ),
    ]);

    if (!success) {
      return { ok: false, error: "Too many requests — please slow down and try again shortly." };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[rate-limit] Upstash check failed for tier "${tier}", failing open:`, err);
    return { ok: true };
  }
}
