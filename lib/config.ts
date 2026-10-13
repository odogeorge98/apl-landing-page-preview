export const config = {
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_PEPPCRUISE_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://nugi-innovation-backend.onrender.com",
    websiteBaseUrl:
      process.env.NEXT_PUBLIC_PEPPCRUISE_WEBSITE_BASE_URL ||
      process.env.NEXT_PUBLIC_WEBSITE_BASE_URL ||
      "https://nugi-innovation-backend.onrender.com/websites",
  },
} as const;

// Type-safe configuration access
export type Config = typeof config;
