export const config = {
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL,
    websiteBaseUrl:
      process.env.NEXT_PUBLIC_WEBSITE_BASE_URL,
  },
} as const;

// Type-safe configuration access
export type Config = typeof config;
