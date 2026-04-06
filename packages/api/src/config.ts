export const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, "");
