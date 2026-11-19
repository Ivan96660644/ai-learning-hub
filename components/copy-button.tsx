"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
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
      className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-slate-400 transition hover:border-cyan-400/50 hover:text-cyan-200"
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}
