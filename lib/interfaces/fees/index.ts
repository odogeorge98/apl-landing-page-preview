export type CarType = "PUBLIC" | "PRIVATE";

export interface FeeItem {
  id:               string;
  className:        string;
  baseFee:          string;
  piBaseFee:        string;
  peppCoinBaseFee:  string;
  description:      string;
  vehicleImage:     string;
  vehicleSeaters:   number;
  carType:          CarType;
  createdAt:        string;
  updatedAt:        string;
}

// ─── Response wrappers ────────────────────────────────────────────────────────

export interface FeesListData {
  data: FeeItem[];
  nextCursor: string | null;
}

export interface FeeListResponse {
  status: string;
  statusCode: number;
  message: string;
  data: FeesListData;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export interface UpdateFeePayload {
  baseFee?:         number;
  piBaseFee?:       number;
  peppCoinBaseFee?: number;
}

export interface UpdateFeeResponse {
  status:     string;
  statusCode: number;
  message:    string;
  data:       number;    // rows affected
}