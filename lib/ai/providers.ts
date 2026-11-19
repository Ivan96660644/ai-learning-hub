import "server-only";

import type { AiConfig } from "@/lib/ai/config";
import type { ChatErrorCode, ChatMessage } from "@/lib/ai/types";

export class ProviderError extends Error {
  constructor(
    public code: ChatErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export interface CompletionInput {
  system: string;
  messages: ChatMessage[];
  signal: AbortSignal;
}

/**
 * Provider Adapter: every backend implements the same two methods, so adding
 * a provider never touches the route handler or the UI.
 */
export interface ProviderAdapter {
  id: string;
  /** Cheap, synchronous check — no network. */
  availability(): { ok: true } | { ok: false; reason: string };
  complete(input: CompletionInput): Promise<string>;
}

/* ---------- none (default) ---------- */

const noneProvider: ProviderAdapter = {
  id: "none",
  availability: () => ({ ok: false, reason: "站点管理员尚未配置 AI 服务。" }),
  complete: async () => {
    throw new ProviderError("AI_DISABLED", "AI 服务未启用。", 503);
  },
};

/* ---------- OpenAI-compatible (/chat/completions) ---------- */

function openAICompatible(cfg: AiConfig["openaiCompatible"]): ProviderAdapter {
  return {
    id: "openai-compatible",
    availability: () =>
      cfg.baseUrl && cfg.apiKey && cfg.model
        ? { ok: true }
        : { ok: false, reason: "AI 服务配置不完整，请联系站点管理员。" },
    async complete({ system, messages, signal }) {
      const res = await fetch(`${cfg.baseUrl!.replace(/\/+$/, "")}/chat/completions`, {
        method: "POST",
        signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({
          model: cfg.model,
          messages: [{ role: "system", content: system }, ...messages],
          temperature: 0.3,
          max_tokens: 1200,
        }),
      });
      if (res.status === 429) throw new ProviderError("RATE_LIMITED", "上游服务繁忙，请稍后再试。", 429);
      if (!res.ok) {
        // Never forward upstream bodies (may contain internal details).
        throw new ProviderError("UPSTREAM_ERROR", `AI 服务返回错误（${res.status}）。`, 502);
      }
      const data = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
      const text = data.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) {
        throw new ProviderError("UPSTREAM_ERROR", "AI 服务返回了空结果。", 502);
      }
      return text;
    },
  };
}

/* ---------- Mify (disabled until authorization is confirmed) ---------- */

function mifyProvider(cfg: AiConfig["mify"]): ProviderAdapter {
  return {
    id: "mify",
    availability: () => {
      if (!cfg.authorized) {
        return { ok: false, reason: "Mify API 尚未确认公开使用授权，AI 助手暂不可用。" };
      }
      if (!cfg.baseUrl || !cfg.apiKey || !cfg.model) {
        return { ok: false, reason: "Mify 配置不完整，请联系站点管理员。" };
      }
      // Even when authorized, the request/response contract is not confirmed yet.
      return { ok: false, reason: "Mify 接口规范待确认，AI 助手暂不可用。" };
    },
    complete: async () => {
      // Deliberately not implemented: the endpoint format, auth scheme and usage
      // terms must be confirmed before any real call is made.
      throw new ProviderError("NOT_IMPLEMENTED", "Mify 接入尚未完成。", 501);
    },
  };
}

export function getProvider(config: AiConfig): ProviderAdapter {
  switch (config.provider) {
    case "openai-compatible":
      return openAICompatible(config.openaiCompatible);
    case "mify":
      return mifyProvider(config.mify);
    default:
      return noneProvider;
  }
}
