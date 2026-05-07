export interface RidersListResponse {
  status: string;
  statusCode: number;
  message: string;
  data: any;
}

export interface RidersKpiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: RidersKpi;
}

export interface RidersKpi {
  totalRiders: number,
  activeRiders: number,
  bannedRiders: number,
  newRidersThisMonth: number,
  riderWithDisputes?: number,
}