import "server-only";

/**
 * All AI settings come from server-side environment variables only.
 * Nothing here is ever sent to the browser (no NEXT_PUBLIC_ prefix).
 * See .env.example for the full list.
 */

export type ProviderId = "none" | "openai-compatible" | "mify";

export interface AiConfig {
  provider: ProviderId;
  timeoutMs: number;
  ratePerMinute: number;
  dailyQuota: number;
  requireAuth: boolean;
  openaiCompatible: { baseUrl?: string; apiKey?: string; model?: string };
  mify: { authorized: boolean; baseUrl?: string; apiKey?: string; model?: string };
}

const int = (v: string | undefined, fallback: number, min: number, max: number) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
};

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export function getAiConfig(): AiConfig {
  const env = process.env;
  const raw = (env.AI_PROVIDER ?? "none").trim().toLowerCase();
  const provider: ProviderId = raw === "openai-compatible" || raw === "mify" ? raw : "none";

  return {
    provider,
    timeoutMs: int(env.AI_TIMEOUT_MS, 30_000, 1_000, 120_000),
    ratePerMinute: int(env.AI_RATE_LIMIT_PER_MINUTE, 10, 1, 600),
    dailyQuota: int(env.AI_DAILY_QUOTA, 50, 1, 100_000),
    requireAuth: env.AI_REQUIRE_AUTH === "true",
    openaiCompatible: {
      baseUrl: clean(env.AI_BASE_URL),
      apiKey: clean(env.AI_API_KEY),
      model: clean(env.AI_MODEL),
    },
    mify: {
      // Must be explicitly flipped to "true" once public-use authorization is confirmed.
      authorized: env.MIFY_AUTHORIZED === "true",
      baseUrl: clean(env.MIFY_BASE_URL),
      apiKey: clean(env.MIFY_API_KEY),
      model: clean(env.MIFY_MODEL),
    },
  };
}
