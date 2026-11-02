import { http } from "@/lib/utils/http";
import type {
  CreateReportPoliciesApiResponse,
  CreateReportPoliciesDto,
  GetReportPolicyProgrammeOptionsParams,
  ReportPolicyProgrammeOption,
  ReportPolicyProgrammeOptionsApiResponse,
  ReportPolicyProgrammeOptionsData,
} from "@/lib/interfaces/report-policies";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value: string): boolean {
  if (!DATE_KEY_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validateCreatePayload(payload: CreateReportPoliciesDto): void {
  if (!Array.isArray(payload.policies) || payload.policies.length === 0) {
    throw new Error("Select at least one programme to create a reporting policy.");
  }

  const programmeIds = new Set<string>();
  for (const policy of payload.policies) {
    if (!policy.programmeId.trim()) throw new Error("Every policy must have a programme.");
    if (programmeIds.has(policy.programmeId)) throw new Error("A programme can only appear once per request.");
    programmeIds.add(policy.programmeId);

    if (!policy.timezone.trim()) throw new Error("Choose a timezone for each policy.");
    if (!Array.isArray(policy.requiredWeekdays) || policy.requiredWeekdays.length === 0) {
      throw new Error("Choose at least one required weekday.");
    }
    if (policy.requiredWeekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
      throw new Error("Required weekdays must use weekday numbers from 0 to 6.");
    }
    if (!isCalendarDate(policy.effectiveFrom)) throw new Error("Choose a valid effective start date.");
    if (policy.effectiveTo != null) {
      if (!isCalendarDate(policy.effectiveTo)) throw new Error("Choose a valid effective end date.");
      if (policy.effectiveTo < policy.effectiveFrom) throw new Error("The end date cannot be earlier than the start date.");
    }
  }
}

function isReportPolicyProgrammeOption(value: unknown): value is ReportPolicyProgrammeOption {
  if (!value || typeof value !== "object") return false;

  const option = value as Record<string, unknown>;
  return (
    typeof option.id === "string" &&
    typeof option.name === "string" &&
    typeof option.description === "string" &&
    typeof option.hours === "number" &&
    Number.isFinite(option.hours) &&
    typeof option.hasActiveReportingPolicy === "boolean"
  );
}

/** POST /reports-policies — create one or more programme reporting policies. */
export const reportPoliciesApi = {
  /** GET /reports-policies/programmes — paginated options annotated with policy state. */
  listProgrammeOptions: async (
    params: GetReportPolicyProgrammeOptionsParams = {},
  ): Promise<ReportPolicyProgrammeOptionsData> => {
    const cursor = params.cursor?.trim();
    const queryParams: Record<string, string> = {};
    if (cursor) queryParams.cursor = cursor;

    const response = await http.get<ReportPolicyProgrammeOptionsApiResponse>(
      "/reports-policies/programmes",
      { params: queryParams },
    );

    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to retrieve programme policy options.");
    }

    const data = result.data;
    if (
      !data ||
      !Array.isArray(data.items) ||
      !(data.nextCursor === null || typeof data.nextCursor === "string") ||
      !data.items.every(isReportPolicyProgrammeOption)
    ) {
      throw new Error("The programme policy options response was incomplete or invalid.");
    }

    return data;
  },

  create: async (payload: CreateReportPoliciesDto): Promise<CreateReportPoliciesApiResponse> => {
    validateCreatePayload(payload);
    const response = await http.post<CreateReportPoliciesApiResponse>("/reports-policies", payload);
    const result = response.data;
    if (result.status !== "success") {
      throw new Error(result.message || "Unable to create the reporting policies.");
    }
    return result;
  },
};
