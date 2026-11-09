import axios from "axios";
import { config } from "@/lib/config";
import useAuthStore from "@/lib/store/auth";

export const http = axios.create({
  baseURL: config.api.baseUrl,
});

http.interceptors.request.use((request) => {
  const token = useAuthStore.getState().token;
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});
