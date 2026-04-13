import axios from "axios";
import { defaultAuthStorage, getApiBaseUrl } from "@workspace/api";

// Strip /api/v1 suffix so full paths like /api/v1/admin/clients work correctly
const baseURL = getApiBaseUrl().replace(/\/api\/v1\/?$/, "");

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = defaultAuthStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? "Request failed";
    return Promise.reject(new Error(message));
  },
);

export default api;
