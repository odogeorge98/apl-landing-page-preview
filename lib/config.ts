export const config = {
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_PEPPCRUISE_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://api.peppcruise.com/api/v1",
    /** Sent as `x-product-key` on server API calls (matches ppserver `PEPPCRUISE_API_KEY`). */
    productKey: process.env.NEXT_PUBLIC_PEPPCRUISE_PRODUCT_KEY || "",
  },
} as const;

// Type-safe configuration access
export type Config = typeof config;
