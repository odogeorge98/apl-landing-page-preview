/**
 * Generic parameter builder that filters out undefined, null, and empty values
 * @param params - The parameters object to filter
 * @returns Filtered parameters object
 */
export const buildParams = <T extends Record<string, any>>(params: T): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  );
};

export interface InvitationParams {
  page?: number;
  limit?: number;
  status?: string;
  month?: number;
  year?: number;
  search?: string;
}

/**
 * Specific wrapper for invitation parameters (uses generic buildParams internally)
 * @param params - The invitation parameters object to filter
 * @returns Filtered parameters object
 */
export const buildInvitationParams = (params: InvitationParams): Record<string, any> => {
  return buildParams(params);
};
