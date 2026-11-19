import "server-only";

/**
 * Request guards for /api/chat: authentication hook, per-minute rate limit
 * and per-day quota.
 *
 * NOTE: the default limiter is in-memory, i.e. per server instance. On
 * serverless platforms each instance has its own counters, so before enabling
 * a real provider in production, swap `memoryLimiter` for a shared store
 * (e.g. Redis / Vercel KV) implementing the same `Limiter` interface.
 */

export interface Identity {
  /** Stable key used for rate limiting / quota (user id once auth exists, else IP). */
  key: string;
  authenticated: boolean;
}

export type AuthResult = { ok: true; identity: Identity } | { ok: false };

/** Authentication extension point. Replace with real session validation. */
export async function authenticate(req: Request, requireAuth: boolean): Promise<AuthResult> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";

  if (!requireAuth) return { ok: true, identity: { key: `ip:${ip}`, authenticated: false } };

  // TODO(auth): validate a session cookie / token here and return the user id.
  // Until an auth system exists, requiring auth rejects every request.
  return { ok: false };
}

export interface LimitResult {
  ok: boolean;
  reason?: "rate" | "quota";
  retryAfterSeconds?: number;
  remainingToday?: number;
}

export interface Limiter {
  check(key: string, opts: { perMinute: number; perDay: number }): Promise<LimitResult>;
}

interface Bucket {
  minute: number[]; // timestamps (ms) within the last 60s
  day: string;
  dayCount: number;
}

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

const utcDay = (t: number) => new Date(t).toISOString().slice(0, 10);

export const memoryLimiter: Limiter = {
  async check(key, { perMinute, perDay }) {
    const now = Date.now();
    const today = utcDay(now);

    let b = buckets.get(key);
    if (!b) {
      if (buckets.size >= MAX_KEYS) buckets.clear(); // crude memory cap
      b = { minute: [], day: today, dayCount: 0 };
      buckets.set(key, b);
    }
    if (b.day !== today) {
      b.day = today;
      b.dayCount = 0;
    }
    b.minute = b.minute.filter((t) => now - t < 60_000);

    if (b.dayCount >= perDay) {
      const tomorrow = Date.parse(`${today}T00:00:00Z`) + 86_400_000;
      return { ok: false, reason: "quota", retryAfterSeconds: Math.ceil((tomorrow - now) / 1000), remainingToday: 0 };
    }
    if (b.minute.length >= perMinute) {
      return { ok: false, reason: "rate", retryAfterSeconds: Math.ceil((60_000 - (now - b.minute[0])) / 1000) };
    }

    b.minute.push(now);
    b.dayCount += 1;
    return { ok: true, remainingToday: perDay - b.dayCount };
  },
};
