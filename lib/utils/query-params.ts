/**
 * Query Parameter Builder Utility
 * Builds URLSearchParams from an object, filtering out undefined, null, and empty values
 */
export const buildQueryParams = (params: Record<string, any>): URLSearchParams => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  return queryParams;
};
