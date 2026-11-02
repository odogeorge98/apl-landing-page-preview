/** A daily-reporting policy applied to a single programme. */
export interface CreateReportPolicyDto {
  programmeId: string;
  timezone: string;
  /** Weekday numbers accepted by the API: Sunday = 0, Monday = 1, … Saturday = 6. */
  requiredWeekdays: number[];
  /** Inclusive programme-local calendar date in YYYY-MM-DD form. */
  effectiveFrom: string;
  /** Inclusive end date, or null when the policy has no end date. */
  effectiveTo?: string | null;
}

/** The endpoint accepts several programme policies in a single request. */
export interface CreateReportPoliciesDto {
  policies: CreateReportPolicyDto[];
}

/** Standard API envelope. The create endpoint's data shape is not needed by this UI. */
export interface CreateReportPoliciesApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: unknown;
}

/** Programme option annotated with whether it already has an active policy. */
export interface ReportPolicyProgrammeOption {
  id: string;
  name: string;
  description: string;
  hours: number;
  hasActiveReportingPolicy: boolean;
}

export interface ReportPolicyProgrammeOptionsData {
  items: ReportPolicyProgrammeOption[];
  nextCursor: string | null;
}

export interface ReportPolicyProgrammeOptionsApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: ReportPolicyProgrammeOptionsData;
}

export interface GetReportPolicyProgrammeOptionsParams {
  cursor?: string | null;
}
