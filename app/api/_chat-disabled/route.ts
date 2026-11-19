import { connection, NextResponse } from "next/server";
import { getAiConfig } from "@/lib/ai/config";
import { buildSystemPrompt } from "@/lib/ai/context";
import { authenticate, memoryLimiter } from "@/lib/ai/guard";
import { getProvider, ProviderError } from "@/lib/ai/providers";
import {
  CHAT_LIMITS,
  type ChatContext,
  type ChatFailure,
  type ChatMessage,
  type ChatStatus,
  type ChatSuccess,
} from "@/lib/ai/types";

const noStore = { "cache-control": "no-store" };

function fail(status: number, body: Omit<ChatFailure, "ok">, headers: Record<string, string> = {}) {
  return NextResponse.json<ChatFailure>({ ok: false, ...body }, { status, headers: { ...noStore, ...headers } });
}

/** GET /api/chat → whether the assistant is available (no secrets, no URLs). */
export async function GET() {
  await connection(); // evaluate env at request time, not at build time
  const config = getAiConfig();
  const provider = getProvider(config);
  const a = provider.availability();
  const body: ChatStatus = a.ok
    ? { enabled: true, provider: provider.id }
    : { enabled: false, provider: provider.id, reason: a.reason };
  return NextResponse.json(body, { headers: noStore });
}

function parseBody(raw: unknown): { messages: ChatMessage[]; context?: ChatContext } | null {
  if (!raw || typeof raw !== "object") return null;
  const { messages, context } = raw as { messages?: unknown; context?: unknown };
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > CHAT_LIMITS.maxMessages) return null;

  const clean: ChatMessage[] = [];
  for (const m of messages) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text || text.length > CHAT_LIMITS.maxMessageChars) return null;
    clean.push({ role, content: text });
  }
  if (clean[clean.length - 1].role !== "user") return null;

  let ctx: ChatContext | undefined;
  if (context && typeof context === "object") {
    const { courseSlug, chapterSlug } = context as Record<string, unknown>;
    const slug = (v: unknown) => (typeof v === "string" && /^[a-z0-9-]{1,64}$/.test(v) ? v : undefined);
    ctx = { courseSlug: slug(courseSlug), chapterSlug: slug(chapterSlug) };
  }
  return { messages: clean, context: ctx };
}

/** POST /api/chat → { ok, reply } or { ok: false, code, message } */
export async function POST(req: Request) {
  const config = getAiConfig();
  const provider = getProvider(config);

  // 1. Disabled / unconfigured / unauthorized provider: refuse before doing any work.
  const availability = provider.availability();
  if (!availability.ok) return fail(503, { code: "AI_DISABLED", message: availability.reason });

  // 2. Authentication hook.
  const auth = await authenticate(req, config.requireAuth);
  if (!auth.ok) return fail(401, { code: "UNAUTHORIZED", message: "请先登录后再使用 AI 助手。" });

  // 3. Validate input.
  let parsed: ReturnType<typeof parseBody>;
  try {
    parsed = parseBody(await req.json());
  } catch {
    parsed = null;
  }
  if (!parsed) return fail(400, { code: "BAD_REQUEST", message: "请求格式不正确或内容过长。" });

  // 4. Rate limit + daily quota.
  const limit = await memoryLimiter.check(auth.identity.key, {
    perMinute: config.ratePerMinute,
    perDay: config.dailyQuota,
  });
  if (!limit.ok) {
    const retry = { "retry-after": String(limit.retryAfterSeconds ?? 60) };
    return limit.reason === "quota"
      ? fail(429, { code: "QUOTA_EXCEEDED", message: "今日提问次数已用完，明天再来吧。", retryAfterSeconds: limit.retryAfterSeconds }, retry)
      : fail(429, { code: "RATE_LIMITED", message: "提问太频繁了，请稍等片刻。", retryAfterSeconds: limit.retryAfterSeconds }, retry);
  }

  // 5. Call the provider with a hard timeout (also aborts if the client disconnects).
  const signal = AbortSignal.any([req.signal, AbortSignal.timeout(config.timeoutMs)]);
  try {
    const reply = await provider.complete({
      system: buildSystemPrompt(parsed.context),
      messages: parsed.messages,
      signal,
    });
    return NextResponse.json<ChatSuccess>({ ok: true, reply, remainingToday: limit.remainingToday }, { headers: noStore });
  } catch (err) {
    if (err instanceof ProviderError) return fail(err.status, { code: err.code, message: err.message });
    const name = (err as { name?: string })?.name;
    if (name === "TimeoutError" || (name === "AbortError" && !req.signal.aborted)) {
      return fail(504, { code: "TIMEOUT", message: "AI 服务响应超时，请稍后重试。" });
    }
    console.error("[api/chat] provider failure:", name ?? "unknown");
    return fail(502, { code: "UPSTREAM_ERROR", message: "AI 服务暂时不可用，请稍后重试。" });
  }
}
