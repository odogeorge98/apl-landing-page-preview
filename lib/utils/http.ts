import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { config } from "@/lib/config";
import { getAuthToken } from "@/lib/utils/token";
import useAuthStore from "@/lib/store/auth";
import { MOCK_PREVIEW_TOKEN } from "@/lib/dev/mock-admin-user";

export interface HttpOptions extends AxiosRequestConfig {
  requiresAuth?: boolean;
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
          
          if (status === 401) {
            const token =
              typeof window !== "undefined"
                ? localStorage.getItem("auth_token")
                : null;
            if (token !== MOCK_PREVIEW_TOKEN) {
              const { logout } = useAuthStore.getState();
              logout();

              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
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
      const isInternalAPI = endpoint.startsWith("/api/");
      const url = isInternalAPI
        ? endpoint
        : `${config.api.baseUrl}/admin${endpoint}`;

      console.log('Url: ', url);
      const response: AxiosResponse<T> = await this.axiosInstance.request({
        method,
        url,
        data,
        ...options,
      });

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
} = http;
