"use client";

import { useCallback, useEffect, useState } from "react";

/** Materials a student has saved, kept in this browser's localStorage. */
export const SAVED_MATERIALS_KEY = "nugi:student:saved-materials";

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_MATERIALS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function useSavedMaterials() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setSaved(read());
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_MATERIALS_KEY || event.key === null) setSaved(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      try {
        window.localStorage.setItem(SAVED_MATERIALS_KEY, JSON.stringify(next));
      } catch {
        // Storage can be blocked or full; the change still applies for this visit.
      }
      return next;
    });
  }, []);

  return { saved, isSaved: (id: string) => saved.includes(id), toggle };
}
