"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Small motion helpers shared by the admin learning pages.
 *
 * Everything is driven by CSS transitions (Tailwind classes) rather than an
 * animation library, so no extra dependency ships to the browser. Users with
 * `prefers-reduced-motion` get instant changes via `motion-reduce:` classes
 * at the call sites.
 */

/**
 * Keeps an element mounted long enough to play an exit transition.
 *
 * - `mounted` → render the element at all
 * - `visible` → apply the "entered" classes (opacity-100, scale-100…)
 *
 * On open the element mounts in its hidden state, then flips to visible on
 * the next frame so the browser actually animates the change. On close it
 * flips to hidden and unmounts after `duration` ms.
 */
export function useMountTransition(open: boolean, duration = 200) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  // Mount synchronously during render so refs exist in the same commit.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
      let inner = 0;
      // Two frames: the first paints the hidden state, the second animates.
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), duration);
    return () => window.clearTimeout(timeout);
  }, [open, duration]);

  return { mounted: mounted || open, visible: open && visible };
}

/**
 * Remembers the last non-null value. Lets a dialog keep showing its content
 * while it animates out, after the parent has already cleared its state.
 */
export function useLastDefined<T>(value: T | null | undefined): T | null {
  const [last, setLast] = useState<T | null>(value ?? null);
  if (value != null && value !== last) setLast(value);
  return value ?? last;
}

/** Default pause between clicking a button and its dialog appearing. */
export const DIALOG_OPEN_DELAY_MS = 350;

/**
 * Adds a short, deliberate pause before an action (typically opening a
 * dialog). The triggering button shows a spinner meanwhile, which makes the
 * transition feel intentional and gives a natural place to prefetch data
 * once the API exists.
 *
 * Usage:
 *   const opener = useDelayedAction();
 *   <button onClick={() => opener.run("new", () => setOpen(true))}
 *           aria-busy={opener.isPending("new")}>…</button>
 *
 * Repeated clicks while a run is pending are ignored, so double-clicking
 * never opens two dialogs.
 */
export function useDelayedAction(delay = DIALOG_OPEN_DELAY_MS) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const run = useCallback(
    (key: string, action: () => void) => {
      if (pendingRef.current) return;
      pendingRef.current = key;
      setPendingKey(key);

      timeoutRef.current = window.setTimeout(() => {
        pendingRef.current = null;
        setPendingKey(null);
        action();
      }, delay);
    },
    [delay],
  );

  const isPending = useCallback((key: string) => pendingKey === key, [pendingKey]);

  return { run, isPending, busy: pendingKey !== null };
}
