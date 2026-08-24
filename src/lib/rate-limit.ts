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

export type RateLimitResult = { ok: true } | { ok: false; error: string };

/**
 * Call at the top of a server action or route handler. `identifier`
 * should be the user id for authenticated endpoints, or omitted to fall
 * back to the caller's IP for public ones.
 *
 * Fails open (allows the request) if Upstash isn't configured, logging a
 * one-time warning — same "degrade, don't crash" pattern as the rest of
 * this app's optional integrations. Once UPSTASH_REDIS_REST_URL/TOKEN are
 * set, it activates with no other code changes.
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
  const { success } = await limiter.limit(id);

  if (!success) {
    return { ok: false, error: "Too many requests — please slow down and try again shortly." };
  }
  return { ok: true };
}
