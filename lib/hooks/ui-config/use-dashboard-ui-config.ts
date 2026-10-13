
"use client";

import { useMemo, useEffect } from "react";
import { useCurrentUser } from "@/lib/hooks/auth/use-current-user";
import { DASHBOARD_UI_CONFIG } from "@/lib/config/dashboard/ui-config";
import { UserType } from "@/lib/types/users";
import { DashboardUIConfig } from "@/lib/interfaces/ui-config";

export function useDashboardUIConfig() {
  const { role, isInitialized } = useCurrentUser();

  const uiConfig = useMemo<DashboardUIConfig | null>(() => {
    if (!role) return null;

    if (
      role !== UserType.ADMIN &&
      role !== UserType.TUTOR &&
      role !== UserType.STUDENT
    ) {
      return null;
    }

    return DASHBOARD_UI_CONFIG[role];
  }, [role]);

  useEffect(() => {
    console.log("[DashboardUIConfig] Role:", role);
    console.log("[DashboardUIConfig] Valid role:", Object.values(UserType).includes(role as UserType));
    console.log("[DashboardUIConfig] UI config:", uiConfig);
    console.log("[DashboardUIConfig] Initialized:", isInitialized);
  }, [role, uiConfig, isInitialized]);

  return {
    uiConfig,
    role,
    isInitialized,
    isReady: isInitialized && Boolean(uiConfig),
  };
}
