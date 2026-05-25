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
    // Get token from Zustand store
    return getAuthToken();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const requiresAuth = (config as any).requiresAuth !== false;

        if (requiresAuth) {
          const token = this.getAuthToken();

          // Add Authorization header for all requests that need auth
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Remove custom property from config
        delete (config as any).requiresAuth;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          const { data, status } = error.response;
          
          // Replace this entire if(status === 401) block:
          if (status === 401) {
            const message = (data as any)?.message || "";
            const url = error.config?.url || "";

            const isAuthEndpoint =
              url.includes("/auth/login-otp") ||
              url.includes("/auth/verify-otp") ||
              url.includes("/auth/login");

            const isOtpFlow =
              message.toLowerCase().includes("otp") ||
              message.toLowerCase().includes("otp_required");

            if (isAuthEndpoint || isOtpFlow) {
              throw new HttpError(message || "OTP required", status, data);
            }

            // ── Only logout if the user was actually authenticated ─────────────────
            // Do NOT use window.location.href — it creates a race condition where
            // localStorage hasn't been updated by Zustand persist yet, causing the
            // expired token to survive the reload and triggering a redirect loop.
            // AuthProvider reacts to isAuthenticated → false and redirects safely.
            const token = this.getAuthToken();
            if (token) {
              const { logout } = useAuthStore.getState();
              logout(); // Zustand persist writes to localStorage synchronously,
                        // then AuthProvider's useEffect fires and redirects to "/"
            }

            throw new HttpError("Session expired. Please log in again.", status, data);
          }
          
          const message =
            (data as any)?.message || (data as any)?.error || error.message;
          throw new HttpError(message, status, data);
        } else if (error.request) {
          throw new HttpError(
            "Network error. Please check your internet connection.",
            0
          );
        } else {
          throw new HttpError(
            error.message || "An unexpected error occurred",
            500
          );
        }
      }
    );
  }

  private async makeRequest<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    data?: any,
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> {
    try {
      const isInternalAPI =
        endpoint.startsWith("/api/");

      const namespace =
        options.namespace ?? "admin";

      let basePath = "";

      switch (namespace) {
        case "admin":
          basePath = "/admin";
          break;

        case "public":
          basePath = "/public";
          break;

        case "mobile":
          basePath = "/mobile";
          break;

        case "none":
          basePath = "";
          break;
      }

      const url = isInternalAPI
        ? endpoint
        : `${config.api.baseUrl}${basePath}${endpoint}`;
      // const isInternalAPI = endpoint.startsWith("/api/");
      // const url = isInternalAPI
      //   ? endpoint
      //   : `${config.api.baseUrl}/admin${endpoint}`;

      console.log('Url: ', url);
      const response: AxiosResponse<T> = await this.axiosInstance.request({
        method,
        url,
        data,
        ...options,
      });

      
      console.log('response: ', response);
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
      throw new HttpError("An unexpected error occurred", 500);
    }
  }

  async get<T>(
    endpoint: string,
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>("GET", endpoint, undefined, options);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>("POST", endpoint, data, options);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>("PUT", endpoint, data, options);
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>("PATCH", endpoint, data, options);
  }

  async delete<T>(
    endpoint: string,
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>("DELETE", endpoint, undefined, options);
  }

  // Utility method for file uploads
  async upload<T>(
    endpoint: string,
    file: File,
    options: HttpOptions & { fieldName?: string } = {}
  ): Promise<HttpResponse<T>> {
    const { fieldName = "file", ...restOptions } = options;

    const formData = new FormData();
    formData.append(fieldName, file);

    return this.makeRequest<T>("POST", endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...restOptions,
    });
  }

  // Utility method for requests without authentication
  async publicRequest<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    data?: any,
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(method, endpoint, data, {
      requiresAuth: false,
      ...options,
    });
  }

  /**
   * Makes a public (unauthenticated) request and attaches the
   * `x-client-device-token` header.
   *
   * Used by auth flows that need a device fingerprint before a Bearer token
   * exists — login and verify-OTP. Builds on `makeRequest` so all existing
   * interceptors (error normalisation, 401 redirect, etc.) remain in effect.
   *
   * Any additional headers passed via `options.headers` are merged and will
   * not override the device token.
   */
  async deviceRequest<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    deviceToken: string,
    data?: any,
    options: HttpOptions = {},
  ): Promise<HttpResponse<T>> {
    const { headers: callerHeaders, ...restOptions } = options;

    // console.log('Device token: ', deviceToken);
    return this.makeRequest<T>(method, endpoint, data, {
      requiresAuth: false,
      headers: {
        // Caller-supplied headers first so the device token always wins
        ...(callerHeaders as Record<string, string> | undefined),
        "x-client-device-token": deviceToken,
      },
      ...restOptions,
    });
  }
}

export const http = new HttpClient();

export const {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  publicRequest,
  deviceRequest,
} = http;
