"use client";

import type { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : "Unknown error";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-neutral-600">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className="rounded border px-3 py-1.5 text-sm" onClick={resetErrorBoundary}>
            Try again
          </button>
          <a href="/" className="rounded border px-3 py-1.5 text-sm">
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}
