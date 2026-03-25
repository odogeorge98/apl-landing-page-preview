/**
 * When true (or in development), the app seeds a mock admin session so the
 * dashboard layout can be used without a real backend login.
 * Set NEXT_PUBLIC_BYPASS_AUTH=false in production when the API is required.
 */
export const dashboardAuthBypass =
  process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' ||
  process.env.NODE_ENV === 'development';
