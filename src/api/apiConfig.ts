const LOCAL_API_URL = "http://localhost:5000/api";
const BETA_API_URL = "https://betaapi.fasmart.app/api";
const ENV_API_URL = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL?.trim() : undefined;

const normalizeApiBaseUrl = (baseUrl: string) =>
    (baseUrl || "").trim().replace(/\/+$/, "");

export const url = normalizeApiBaseUrl(
    ENV_API_URL ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "development" ? LOCAL_API_URL : BETA_API_URL)
);
