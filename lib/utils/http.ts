import axios, {

  AxiosInstance,

  AxiosRequestConfig,

  AxiosResponse,

  AxiosError,

} from "axios";

import { config } from "@/lib/config";

import { getAuthToken } from "@/lib/utils/token";

import useAuthStore from "@/lib/store/auth";

// import { MOCK_PREVIEW_TOKEN } from "@/lib/dev/mock-admin-user";

type ApiNamespace =

  | "admin"

  | "public"

  | "mobile"

  | "website"

  | "none";

export interface HttpOptions extends AxiosRequestConfig {

  requiresAuth?: boolean;

  namespace?: ApiNamespace;

}

export interface HttpResponse<T = any> {

  data: T;

  status: number;

  statusText: string;

  headers?: any;

}

export class HttpError extends Error {

  status: number;

  response?: any;

  constructor(message: string, status: number, response?: any) {

    super(message);

    this.name = "HttpError";

    this.status = status;

    this.response = response;

  }

}

class HttpClient {

  private axiosInstance: AxiosInstance;

  constructor() {

    this.axiosInstance = axios.create({

      baseURL:

        typeof window !== "undefined"

          ? window.location.origin

          : config.api.baseUrl,

      timeout: 10000,

      headers: {

        "Content-Type": "application/json",

      },

      withCredentials: true,

    });

    this.setupInterceptors();

  }

  private getAuthToken(): string | null {

    return getAuthToken();

  }

  private setupInterceptors(): void {

    // ─── Request interceptor ─────────────────────────────────────────────────

    this.axiosInstance.interceptors.request.use(

      (config) => {

        const requiresAuth =

          (config as any).requiresAuth !== false;

        if (requiresAuth) {

          const token = this.getAuthToken();

          if (token) {

            config.headers.Authorization =

              `Bearer ${token}`;

          }

        }

        delete (config as any).requiresAuth;

        return config;

      },

      (error) => {

        return Promise.reject(error);

      }

    );

    // ─── Response interceptor ────────────────────────────────────────────────

    this.axiosInstance.interceptors.response.use(

      (response) => {

        return response;

      },

      (error: AxiosError) => {

        if (error.response) {

          const { data, status } = error.response;

          if (status === 401) {

            const responseMessage = (data as any)?.message;

            const message =

              typeof responseMessage === "string"

                ? responseMessage

                : "";

            const requestPath = (error.config?.url || "")

              .split("?")[0]

              .replace(/\/+$/, "");

            // The login endpoint is POST /auth (not /auth/login). Preserve

            // backend authentication errors instead of rewriting them as an

            // expired session or clearing an existing session on a bad login.

            const isAuthEndpoint =

              requestPath.endsWith("/auth") ||

              requestPath.includes("/auth/");

            const isOtpFlow = /otp/i.test(message);

            if (isAuthEndpoint || isOtpFlow) {

              throw new HttpError(

                message ||

                  (isOtpFlow ? "OTP required" : "Authentication failed."),

                status,

                data,

              );

            }

            const token = this.getAuthToken();

            if (token) {

              const { logout } =

                useAuthStore.getState();

              logout();

            }

            throw new HttpError(

              "Session expired. Please log in again.",

              status,

              data

            );

          }

          const message =

            (data as any)?.message ||

            (data as any)?.error ||

            error.message;

          throw new HttpError(

            message,

            status,

            data

          );

        }

        if (error.request) {

          throw new HttpError(

            "Network error. Please check your internet connection.",

            0

          );

        }

        throw new HttpError(

          error.message ||

            "An unexpected error occurred",

          500

        );

      }

    );

  }

  private async makeRequest<T>(

    method:

      | "GET"

      | "POST"

      | "PUT"

      | "PATCH"

      | "DELETE",

    endpoint: string,

    data?: any,

    options: HttpOptions = {}

  ): Promise<HttpResponse<T>> {

    try {

      const isInternalAPI =

        endpoint.startsWith("/api/");

      const namespace =

        options.namespace ?? "none";

      let baseUrl =

        config.api.baseUrl;

      let basePath = "";

      switch (namespace) {

        case "admin":

          baseUrl = config.api.baseUrl;

          basePath = "/admin";

          break;

        case "public":

          baseUrl = config.api.baseUrl;

          basePath = "/public";

          break;

        case "mobile":

          baseUrl = config.api.baseUrl;

          basePath = "/mobile";

          break;

        case "website":

          baseUrl =

            config.api.websiteBaseUrl;

          basePath = "/websites";

          break;

        case "none":

          // FIX: Fallback directly to your remote base URL instead of blank strings

          baseUrl = config.api.baseUrl;

          basePath = "";

          break;

      }

      const url = isInternalAPI

        ? endpoint

        : `${baseUrl}${basePath}${endpoint}`;

      console.log("Url: ", url);

      const response: AxiosResponse<T> =

        await this.axiosInstance.request({

          method,

          url,

          data,

          ...options,

        });

      console.log("response: ", response);

      return {

        data: response.data,

        status: response.status,

        statusText: response.statusText,

        headers: response.headers,

      };

    } catch (error) {

      if (error instanceof HttpError) {

        throw error;

      }

      throw new HttpError(

        "An unexpected error occurred",

        500

      );

    }

  }

  async get<T>(

    endpoint: string,

    options: HttpOptions = {}

  ): Promise<HttpResponse<T>> {

    return this.makeRequest<T>(

      "GET",

      endpoint,

      undefined,

      options

    );

  }

  async post<T>(

    endpoint: string,

    data?: any,

    options: HttpOptions = {}

  ): Promise<HttpResponse<T>> {

    return this.makeRequest<T>(

      "POST",

      endpoint,

      data,

      options

    );

  }

  async put<T>(

    endpoint: string,

    data?: any,

    options: HttpOptions = {}

  ): Promise<HttpResponse<T>> {

    return this.makeRequest<T>(

      "PUT",

      endpoint,

      data,

      options

    );

  }

  async patch<T>(

    endpoint: string,

    data?: any,

    options: HttpOptions = {}

  ): Promise<HttpResponse<T>> {

    return this.makeRequest<T>(

      "PATCH",

      endpoint,

      data,

      options

    );

  }

  async delete<T>(

    endpoint: string,

    options: HttpOptions = {}

  ): Promise<HttpResponse<T>> {

    return this.makeRequest<T>(

      "DELETE",

      endpoint,

      undefined,

      options

    );

  }

  // ─── File upload ──────────────────────────────────────────────────────────

  async upload<T>(

    endpoint: string,

    file: File,

    options: HttpOptions & {

      fieldName?: string;

    } = {}

  ): Promise<HttpResponse<T>> {

    const {

      fieldName = "file",

      ...restOptions

    } = options;

    const formData = new FormData();

    formData.append(

      fieldName,

      file

    );

    return this.makeRequest<T>(

      "POST",

      endpoint,

      formData,

      {

        headers: {

          "Content-Type":

            "multipart/form-data",

        },

        ...restOptions,

      }

    );

  }

  // ─── Public request ────────────────────────────────────────────────────────

  async publicRequest<T>(

    method:

      | "GET"

      | "POST"

      | "PUT"

      | "PATCH"

      | "DELETE",

    endpoint: string,

    data?: any,

    options: HttpOptions = {}

  ): Promise<HttpResponse<T>> {

    return this.makeRequest<T>(

      method,

      endpoint,

      data,

      {

        requiresAuth: false,

        ...options,

      }

    );

  }

  // ─── Device request ────────────────────────────────────────────────────────

  async deviceRequest<T>(

    method:

      | "GET"

      | "POST"

      | "PUT"

      | "PATCH"

      | "DELETE",

    endpoint: string,

    deviceToken: string,

    data?: any,

    options: HttpOptions = {},

  ): Promise<HttpResponse<T>> {

    const {

      headers: callerHeaders,

      ...restOptions

    } = options;

    return this.makeRequest<T>(

      method,

      endpoint,

      data,

      {

        requiresAuth: false,

        headers: {

          ...(callerHeaders as Record<

            string,

            string

          > | undefined),

          "x-client-device-token":

            deviceToken,

        },

        ...restOptions,

      }

    );

  }

}

export const http =

  new HttpClient();

// Bind methods so standalone imports retain the HttpClient context.
export const get = http.get.bind(http);
export const post = http.post.bind(http);
export const put = http.put.bind(http);
export const patch = http.patch.bind(http);
export const del = http.delete.bind(http);
export const upload = http.upload.bind(http);
export const publicRequest = http.publicRequest.bind(http);
export const deviceRequest = http.deviceRequest.bind(http);

// certificate Http

export interface ApiResponse<T> {

  status: string;

  statusCode: number;

  message: string;

  data: T;

}

export interface CertificateDashboard {

  activeCertificates: number;

  revokedCertificates: number;

  awaitingIssuance: number;

  programmesRepresented: number;

  recordedVerifications: number;

}

export interface AdminCertificateQuery {

  search?: string;

  programmeId?: string;

  type?: string;

  status?: string;

  issueDateFrom?: string;

  issueDateTo?: string;

  limit?: number;

  cursor?: string;

}

export interface AdminCertificateRecord {

  id: string;

  certificateNumber: string;

  studentId: string;

  programmeId: string;

  templateId: string;

  type: string;

  status: string;

  issuedAt: string;

  expiresAt: string | null;

  scorePercent: string | null;

  documentUrl: string | null;

  issuedByUserId: string;

  revokedAt: string | null;

  revocationReason: string | null;

  createdAt: string;

  updatedAt: string;

  student: {

    id: string;

    name: string;

    user: {

      id: string;

      email: string;

    };

  };

  programme: {

    id: string;

    name: string;

  };

  issuedBy: {

    id: string;

    email: string;

    role: string;

  };

}

export interface AdminCertificatesData {

  items: AdminCertificateRecord[];

  nextCursor: string | null;

}

export const certificatesApi = {

  getDashboard: async (): Promise<CertificateDashboard> => {

    const response = await http.get<ApiResponse<CertificateDashboard>>(

      "/certificates/admin/dashboard"

    );

    return response.data.data;

  },

  getAdminCertificates: async (
    params: AdminCertificateQuery = {},
  ): Promise<AdminCertificatesData> => {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

      if (value !== undefined && value !== null && value !== "") {

        query.set(key, String(value));

      }

    });

    const endpoint = `/certificates/admin${

      query.toString() ? `?${query.toString()}` : ""

    }`;

    const response = await http.get<ApiResponse<AdminCertificatesData>>(

      endpoint

    );

    return response.data.data;

  },

};
