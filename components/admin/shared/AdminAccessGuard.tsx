"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Loader2, ShieldAlert } from "lucide-react";

import { useCurrentUser } from "@/lib/hooks/auth/use-current-user";
import { hasPermission, type Permission } from "@/lib/utils/auth/role-access";
import { cardClass, darkButtonClass } from "./admin-ui";

type AdminAccessGuardProps = {
  /** Permission (from ROLE_PERMISSIONS) the current user must hold. */
  permission: Permission;
  /** Short name of the area being protected, used in the denial message. */
  areaLabel: string;
  children: ReactNode;
};

/**
 * Client-side gate for admin-only screens.
 *
 * IMPORTANT: this is a UX guard only. It hides admin tooling from users who
 * should not see it, but it is NOT a security boundary — anyone can edit
 * client code. Every admin action (create, grade, issue, revoke…) must also
 * be authorised by the backend when the API is wired in.
 *
 * Behaviour:
 *  1. While the persisted auth store is rehydrating we show a spinner, so
 *     admins never see a flash of the "access denied" panel on refresh.
 *  2. Once hydrated, users without the permission get a friendly
 *     restricted-access panel with a link back to their own dashboard.
 *  3. Authorised users see the page.
 */
export function AdminAccessGuard({
  permission,
  areaLabel,
  children,
}: AdminAccessGuardProps) {
  const { role, isInitialized } = useCurrentUser();

  if (!isInitialized) {
    return (
      <div
        role="status"
        className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-[#64718a]"
      >
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Checking your permissions…
      </div>
    );
  }

  if (!hasPermission(role, permission)) {
    return (
      <div className={`${cardClass} mx-auto mt-10 max-w-lg p-8 text-center`}>
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-[#c93636]">
          <ShieldAlert size={26} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-[#101d49]">
          Administrator access required
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#64718a]">
          {areaLabel} is only available to platform administrators. If you
          believe you should have access, contact your system administrator.
        </p>
        <Link href="/" className={`${darkButtonClass} mt-6`}>
          Return to my dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
