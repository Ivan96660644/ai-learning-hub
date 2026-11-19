"use client";

import { useState } from "react";

export function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard unavailable
        }
      }}
      aria-label={copied ? "已复制" : label}
      className="rounded-full px-2.5 py-0.5 text-xs text-muted transition-colors hover:bg-line hover:text-fg"
    >
      <span aria-live="polite">{copied ? "已复制 ✓" : label}</span>
    </button>
  );
}
