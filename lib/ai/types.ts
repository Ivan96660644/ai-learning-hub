/** Shared between the /api/chat route and the client panel (no secrets here). */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatContext {
  courseSlug?: string;
  chapterSlug?: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  context?: ChatContext;
}

export type ChatErrorCode =
  | "AI_DISABLED"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "BAD_REQUEST"
  | "TIMEOUT"
  | "UPSTREAM_ERROR"
  | "NOT_IMPLEMENTED";

export interface ChatSuccess {
  ok: true;
  reply: string;
  remainingToday?: number;
}

export interface ChatFailure {
  ok: false;
  code: ChatErrorCode;
  message: string;
  retryAfterSeconds?: number;
}

export type ChatResponse = ChatSuccess | ChatFailure;

export interface ChatStatus {
  enabled: boolean;
  provider: string;
  /** Human-readable reason when disabled. Never contains URLs or keys. */
  reason?: string;
}

export const CHAT_LIMITS = {
  maxMessages: 20,
  maxMessageChars: 4000,
} as const;
