"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type Ref } from "react";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";
import { CHAT_LIMITS, type ChatMessage, type ChatResponse, type ChatStatus } from "@/lib/ai/types";

export interface ContextIndex {
  slug: string;
  title: string;
  chapters: { slug: string; title: string }[];
}

export interface PageContext {
  courseSlug: string;
  chapterSlug?: string;
  label: string;
}

/** Derives "current course / chapter" from the URL using the slim title index. */
export function resolveContext(pathname: string, index: ContextIndex[]): PageContext | null {
  const m = pathname.match(/^\/courses\/([^/]+)(?:\/([^/]+))?/);
  if (!m) return null;
  const course = index.find((c) => c.slug === m[1]);
  if (!course) return null;
  const chapter = m[2] ? course.chapters.find((ch) => ch.slug === m[2]) : undefined;
  return {
    courseSlug: course.slug,
    chapterSlug: chapter?.slug,
    label: chapter ? chapter.title : course.title,
  };
}

type StatusState =
  | { phase: "loading" }
  | { phase: "ready"; status: ChatStatus }
  | { phase: "error" };

const CLIENT_TIMEOUT_MS = 45_000;
const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;

export function ChatPanel({
  id,
  titleId,
  statusState,
  onStatus,
  context,
  onClose,
  inputRef,
}: {
  id: string;
  titleId: string;
  statusState: StatusState;
  onStatus: (s: StatusState) => void;
  context: PageContext | null;
  onClose: () => void;
  inputRef: Ref<HTMLTextAreaElement>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useContext, setUseContext] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const enabled = statusState.phase === "ready" && statusState.status.enabled;

  // Keep the newest message in view (DOM sync only).
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending, error]);

  // Abort an in-flight request if the panel unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function request(history: ChatMessage[]) {
    setPending(true);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history.slice(-CHAT_LIMITS.maxMessages),
          context:
            useContext && context ? { courseSlug: context.courseSlug, chapterSlug: context.chapterSlug } : undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as ChatResponse | null;
      if (data?.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else if (data && !data.ok) {
        if (data.code === "AI_DISABLED") {
          onStatus({ phase: "ready", status: { enabled: false, provider: "unknown", reason: data.message } });
        }
        setError(data.message);
      } else {
        setError(`请求失败（${res.status}），请稍后重试。`);
      }
    } catch (e) {
      setError((e as Error).name === "AbortError" ? "请求超时，请稍后重试。" : "网络连接失败，请检查网络后重试。");
    } finally {
      clearTimeout(timer);
      setPending(false);
    }
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || pending || !enabled) return;
    const next = [...messages, { role: "user" as const, content: content.slice(0, CHAT_LIMITS.maxMessageChars) }];
    setMessages(next);
    setInput("");
    void request(next);
  }

  const suggestions = context?.chapterSlug
    ? ["用三句话总结本章要点", "本章最容易误解的概念是什么？", "给我出 3 道练习题"]
    : ["RAG 和 Fine-tuning 怎么选？", "解释一下 MCP 是什么", "推荐一条入门学习顺序"];

  return (
    <motion.div
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.94, transition: { duration: 0.18 } }}
      transition={spring}
      style={{ transformOrigin: "calc(100% - 24px) calc(100% + 36px)" }}
      className="fixed inset-x-3 bottom-[5.25rem] top-[3.75rem] flex flex-col overflow-hidden rounded-3xl border border-line bg-card/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:static sm:h-[min(640px,calc(100dvh-9rem))] sm:w-[400px]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white" aria-hidden>
          <SparkIcon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-[15px] font-semibold text-fg">
            AI 学习助手
          </h2>
          <p className="truncate text-xs text-muted">
            {statusState.phase === "loading"
              ? "正在检查服务状态…"
              : enabled
                ? "在线 · 回答可能有误，请核对"
                : "暂不可用"}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              abortRef.current?.abort();
              setMessages([]);
              setError(null);
            }}
            className="rounded-full px-2.5 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            清空
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭 AI 助手"
          className="-mr-2 grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5" role="log" aria-live="polite" aria-busy={pending}>
        {statusState.phase === "loading" && (
          <div className="space-y-3" aria-hidden>
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-surface" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-surface" />
          </div>
        )}

        {statusState.phase === "error" && (
          <Notice title="无法连接 AI 服务" text="检查服务状态失败，请稍后再试。课程、搜索与学习进度功能不受影响。" />
        )}

        {statusState.phase === "ready" && !statusState.status.enabled && (
          <Notice
            title="AI 助手暂未启用"
            text={`${statusState.status.reason ?? "AI 服务未配置。"} 为保证内容真实，这里不会提供模拟回答。课程、搜索与学习进度功能不受影响。`}
          >
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/search" onClick={onClose} className="rounded-full bg-card px-3 py-1.5 text-sm text-fg hover:bg-line">
                搜索文章
              </Link>
              <Link href="/courses" onClick={onClose} className="rounded-full bg-card px-3 py-1.5 text-sm text-fg hover:bg-line">
                浏览课程
              </Link>
            </div>
          </Notice>
        )}

        {enabled && messages.length === 0 && (
          <div>
            <p className="text-[15px] text-fg">你好！可以问我任何关于 AI 工程的问题。</p>
            <div className="mt-4 flex flex-col items-start gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-2xl bg-surface px-3.5 py-2 text-left text-sm text-fg transition-colors hover:bg-line"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-accent px-4 py-2.5 text-[15px] leading-6 text-white"
            >
              <span className="sr-only">你：</span>
              {m.content}
            </motion.div>
          ) : (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="group">
              <span className="sr-only">AI 助手：</span>
              <div className="text-fg">
                <Markdown source={m.content} />
              </div>
              <div className="mt-1 opacity-70 transition-opacity group-hover:opacity-100">
                <CopyButton text={m.content} label="复制回答" />
              </div>
            </motion.div>
          ),
        )}

        {pending && (
          <div className="flex items-center gap-1.5 py-1" role="status" aria-label="AI 正在回答">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="h-1.5 w-1.5 rounded-full bg-muted motion-safe:animate-bounce"
                style={{ animationDelay: `${d * 120}ms` }}
              />
            ))}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-2xl bg-red-500/[0.08] px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <p>{error}</p>
            {enabled && messages.at(-1)?.role === "user" && (
              <button type="button" onClick={() => request(messages)} className="mt-1.5 font-medium underline">
                重试
              </button>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        className="border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        {context && (
          <label className="mb-2 flex items-center gap-2 px-1 text-xs text-muted">
            <input
              type="checkbox"
              checked={useContext}
              onChange={(e) => setUseContext(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--accent)]"
            />
            <span className="truncate">
              结合当前内容：<span className="text-fg">{context.label}</span>
            </span>
          </label>
        )}
        <div className="flex items-end gap-2 rounded-3xl bg-surface p-1.5 pl-4">
          <label htmlFor={`${id}-input`} className="sr-only">
            输入问题
          </label>
          <textarea
            id={`${id}-input`}
            ref={inputRef}
            rows={1}
            value={input}
            disabled={!enabled}
            maxLength={CHAT_LIMITS.maxMessageChars}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={enabled ? "输入问题，Enter 发送，Shift+Enter 换行" : "AI 助手暂不可用"}
            className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 text-fg outline-none placeholder:text-muted disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!enabled || pending || !input.trim()}
            aria-label="发送"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white transition-opacity disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function Notice({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface p-5">
      <p className="font-semibold text-fg">{title}</p>
      <p className="mt-1.5 text-sm leading-6 text-muted">{text}</p>
      {children}
    </div>
  );
}

export function SparkIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5c.4 3.9 1.6 6.3 3.4 7.9 1.6 1.4 3.9 2.2 6.1 2.6-2.2.4-4.5 1.2-6.1 2.6-1.8 1.6-3 4-3.4 7.9-.4-3.9-1.6-6.3-3.4-7.9C7 14.2 4.7 13.4 2.5 13c2.2-.4 4.5-1.2 6.1-2.6C10.4 8.8 11.6 6.4 12 2.5Z" />
    </svg>
  );
}

export async function fetchChatStatus(): Promise<StatusState> {
  try {
    const res = await fetch("/api/chat", { cache: "no-store" });
    if (!res.ok) return { phase: "error" };
    return { phase: "ready", status: (await res.json()) as ChatStatus };
  } catch {
    return { phase: "error" };
  }
}

export type { StatusState };
