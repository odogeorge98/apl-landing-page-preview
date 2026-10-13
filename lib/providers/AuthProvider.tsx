
"use client";

import {
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import useAuthStore from "@/lib/store/auth";
import { useCurrentUser } from "../hooks/auth/use-current-user"; 
import {
  AUTH_ROUTES,
  PUBLIC_ROUTES,
  getRoutePermission,
  matchesRoute,
} from "@/lib/config/route-permissions";
import {
  getDashboardPath,
  getSafeRedirectPath,
} from "@/lib/utils/auth-redirect";



// function useAuthHydration() {
//   useEffect(() => {
//     const markHydrated = () => {
//       const state = useAuthStore.getState();

//       useAuthStore.setState({
//         isInitialized: true,
//         isAuthenticated: Boolean(state.authUser && state.token),
//       });
//     };

//     // If Zustand has already hydrated, synchronize immediately.
//     if (useAuthStore.persist.hasHydrated()) {
//       markHydrated();
//       return;
//     }

//     // Otherwise, wait for the actual hydration event.
//     const unsubscribe =
//       useAuthStore.persist.onFinishHydration(markHydrated);

//     // Handle hydration completing between the initial check
//     // and registering the listener.
//     if (useAuthStore.persist.hasHydrated()) {
//       markHydrated();
//     }

//     return unsubscribe;
//   }, []);
// }


function AuthGuard({ children }: { children: ReactNode }) {
  // useAuthHydration();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // const { isInitialized, isAuthenticated, authUser } = useAuthStore();
  const { isInitialized, isAuthenticated, user: authUser } = useCurrentUser();
  const role = authUser?.role;
  // Debugging logs to trace the state of authentication and routing
  useEffect(() => {
    console.log("[AuthGuard] Initialized:", isInitialized);
    console.log("[AuthGuard] Authenticated:", isAuthenticated);
    console.log("[AuthGuard] User:", authUser);
    console.log("[AuthGuard] Role:", authUser?.role);
    console.log("[AuthGuard] Role type:", typeof authUser?.role);
    console.log("[AuthGuard] Current path:", pathname);
  }, [isInitialized, isAuthenticated, authUser, pathname]);

  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setForceReady(true);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const role = authUser?.role;
    const dashboardPath = getDashboardPath(role);

    const isAuthRoute = AUTH_ROUTES.some((route) =>
      matchesRoute(pathname, route),
    );

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      matchesRoute(pathname, route),
    );

    const permission = getRoutePermission(pathname);

    // A configured protected route requires authentication.
    if (permission && !isAuthenticated) {
      const query = searchParams.toString();
      const requestedPath = `${pathname}${query ? `?${query}` : ""}`;

      router.replace(
        `/?redirect=${encodeURIComponent(requestedPath)}`,
      );
      return;
    }

    // Authenticated users cannot enter routes reserved for another role.
    if (permission && isAuthenticated) {
      if (!role || !permission.roles.includes(role)) {
        router.replace(dashboardPath);
        return;
      }
    }

    // Redirect authenticated users away from login/register pages.
    if (isAuthRoute && isAuthenticated) {
      const requestedRedirect = getSafeRedirectPath(
        searchParams.get("redirect"),
      );

      // Honor a requested destination only when that destination
      // is permitted for the current user's role.
      if (requestedRedirect) {
        const destinationPermission =
          getRoutePermission(requestedRedirect.split("?")[0]);

        const canAccessDestination =
          !destinationPermission ||
          (!!role && destinationPermission.roles.includes(role));

        router.replace(
          canAccessDestination ? requestedRedirect : dashboardPath,
        );
      } else {
        router.replace(dashboardPath);
      }

      return;
    }

    // Unauthenticated users visiting unknown non-public routes
    // must sign in first.
    if (
      !isAuthenticated &&
      !isPublicRoute &&
      !isAuthRoute &&
      pathname !== "/"
    ) {
      const query = searchParams.toString();
      const requestedPath = `${pathname}${query ? `?${query}` : ""}`;

      router.replace(
        `/?redirect=${encodeURIComponent(requestedPath)}`,
      );
    }
  }, [
    pathname,
    searchParams,
    isInitialized,
    forceReady,
    isAuthenticated,
    authUser?.role,
    router,
  ]);

  if (!isInitialized) {
    return null;
  }

  const permission = getRoutePermission(pathname);

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  const hasRouteAccess =
    !permission ||
    (!!authUser?.role && permission.roles.includes(authUser.role));

  if (!isInitialized) {
    return null;
  }

  if (
    (permission && (!isAuthenticated || !hasRouteAccess)) ||
    (isAuthRoute && isAuthenticated)
  ) {
    return null;
  }

  return <>{children}</>;
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}
