import { normalizeBaseUrl } from "./config";

export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => string | null;
};

export type RequestOptions = Omit<RequestInit, "body"> & {
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
};

const buildQuery = (query?: RequestOptions["query"]) => {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const createApiClient = ({ baseUrl, getToken }: ApiClientOptions) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  const request = async <T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    const { query, headers, body, ...rest } = options;
    const token = getToken?.();
    const queryString = buildQuery(query);

    const response = await fetch(`${normalizedBaseUrl}${path}${queryString}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.message ?? "Request failed";
      throw new Error(message);
    }

    return data as T;
  };

  return { request };
};
