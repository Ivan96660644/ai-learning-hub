"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { setTimerPanelOpen, TimerButton, TimerCard, useTimerPanelOpen } from "@/components/study-timer";
import { startStudyTimer } from "@/lib/study-time";

/*
 * AI assistant is temporarily taken offline (not shipped).
 * To restore: re-add the chat button + <ChatPanel> from components/ai-assistant.tsx,
 * pass `contextIndex` from app/layout.tsx again, and move
 * app/api/_chat-disabled → app/api/chat.
 */

const noopSubscribe = () => () => {};

/** One fixed dock in the bottom-right corner, mounted once in the root layout. */
export function FloatingDock() {
  // Render client-only (no SSR markup) → no hydration mismatch from local data.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const timerOpen = useTimerPanelOpen();

  const timerPanelId = useId();
  const timerBtnRef = useRef<HTMLButtonElement>(null);
  const timerCloseRef = useRef<HTMLButtonElement>(null);
  const focusAfter = useRef<"timer-close" | "timer-btn" | null>(null);

  // Single study-time engine for this tab (cleans up its interval + listeners).
  useEffect(() => startStudyTimer(), []);

  // Reserve page-end space on small screens while the card is shown.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.dataset.studyTimer = timerOpen ? "open" : "closed";
    return () => {
      delete root.dataset.studyTimer;
    };
  }, [mounted, timerOpen]);

  // Move focus only after an explicit user action (never on auto-open).
  useEffect(() => {
    const target = focusAfter.current;
    if (!target) return;
    focusAfter.current = null;
    const el = (target === "timer-close" ? timerCloseRef : timerBtnRef).current;
    // Wait a frame so AnimatePresence has mounted the panel.
    requestAnimationFrame(() => el?.focus());
  }, [timerOpen]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex flex-col items-end gap-3 print:hidden">
      <AnimatePresence initial>
        {timerOpen && (
          <TimerCard
            key="timer"
            id={timerPanelId}
            closeRef={timerCloseRef}
            onClose={() => {
              focusAfter.current = "timer-btn";
              setTimerPanelOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <TimerButton
        ref={timerBtnRef}
        expanded={timerOpen}
        controls={timerOpen ? timerPanelId : undefined}
        onClick={() => {
          focusAfter.current = timerOpen ? "timer-btn" : "timer-close";
          setTimerPanelOpen(!timerOpen);
        }}
      />
    </div>
  );
}
