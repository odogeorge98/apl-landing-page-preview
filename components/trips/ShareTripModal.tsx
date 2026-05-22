"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Link2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareTripModalProps {
  url: string;
  onClose: () => void;
}

export function ShareTripModal({ url, onClose }: ShareTripModalProps) {
  const [copied,  setCopied]  = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Graceful fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = url;
      el.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share trip link"
        className={cn(
          "relative z-10 w-full max-w-[440px]",
          "rounded-2xl border border-white/[0.08] bg-[#161222]",
          "p-6 shadow-[0_32px_80px_rgba(0,0,0,0.7)]",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#8247E5]/20 text-[#c084fc]">
              <Link2 className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">Share Trip</h3>
              <p className="mt-0.5 text-xs text-white/40">
                Anyone with this link can view the trip details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        {/* URL display */}
        <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.04]">
          <p
            className="block truncate px-4 py-3 font-mono text-[11.5px] text-white/50"
            title={url}
          >
            {url}
          </p>
        </div>

        {/* Copied confirmation */}
        {copied && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <Check className="size-3.5" strokeWidth={2.5} />
            Link copied to clipboard
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] text-white/25">Link expires in 7 days</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            >
              Done
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                copied
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-[#8247E5] text-white hover:bg-[#7c3aed]",
              )}
            >
              {copied ? (
                <>
                  <Check className="size-4" strokeWidth={2.5} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4" strokeWidth={1.75} />
                  Copy link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}