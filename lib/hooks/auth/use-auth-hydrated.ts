"use client";

import { useSyncExternalStore } from "react";
import useAuthStore from "@/lib/store/auth";

export function useAuthHydrated() {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false, // server snapshot
  );
}