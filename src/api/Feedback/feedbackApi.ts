import { apiFetch } from "@/api/apiBase";
import type {
  FeedbackAdminFilter,
  FeedbackAdminSummary,
  FeedbackCreateRequest,
  FeedbackPageStats,
  FeedbackResponse,
  FeedbackStatus,
  PagedResult,
} from "./feedback.types";

const BASE = "/PageFeedback";

export const submitFeedback = async (
  dto: FeedbackCreateRequest
): Promise<FeedbackResponse> => {
  console.log("feedbackApi.submitFeedback REACHED with:", dto);
  const res = await apiFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return res.json();
};

export const getMyFeedback = async (
  pageKey: string
): Promise<FeedbackResponse | null> => {
  const res = await apiFetch(
    `${BASE}/my?pageKey=${encodeURIComponent(pageKey)}`,
    { suppressErrorLog: true } as Parameters<typeof apiFetch>[1]
  );
  if (!res.ok) return null;
  return res.json();
};

export const getPageStats = async (
  pageKey: string
): Promise<FeedbackPageStats | null> => {
  try {
    const res = await apiFetch(
      `${BASE}/stats?pageKey=${encodeURIComponent(pageKey)}`,
      { suppressErrorLog: true } as Parameters<typeof apiFetch>[1]
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAdminSummary = async (): Promise<FeedbackAdminSummary> => {
  const res = await apiFetch(`${BASE}/admin/summary`);
  return res.json();
};

export const getAdminList = async (
  filter: FeedbackAdminFilter
): Promise<PagedResult<FeedbackResponse>> => {
  const params = new URLSearchParams();
  if (filter.pageKey) params.set("pageKey", filter.pageKey);
  if (filter.route) params.set("route", filter.route);
  if (filter.moduleKey) params.set("moduleKey", filter.moduleKey);
  if (filter.feedbackType) params.set("feedbackType", filter.feedbackType);
  if (filter.sentiment) params.set("sentiment", String(filter.sentiment));
  if (filter.status) params.set("status", filter.status);
  if (filter.userId) params.set("userId", String(filter.userId));
  if (filter.dateFrom) params.set("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.set("dateTo", filter.dateTo);
  if (filter.wantsContact !== undefined)
    params.set("wantsContact", String(filter.wantsContact));
  params.set("page", String(filter.page ?? 1));
  params.set("pageSize", String(filter.pageSize ?? 50));

  const res = await apiFetch(`${BASE}/admin/list?${params.toString()}`);
  return res.json();
};

export const getAdminDetail = async (
  id: number
): Promise<FeedbackResponse | null> => {
  const res = await apiFetch(`${BASE}/admin/${id}`);
  if (!res.ok) return null;
  return res.json();
};

export const updateFeedbackStatus = async (
  id: number,
  status: FeedbackStatus
): Promise<void> => {
  await apiFetch(`${BASE}/admin/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
};

export const updateFeedbackNote = async (
  id: number,
  adminNote: string | null
): Promise<void> => {
  await apiFetch(`${BASE}/admin/${id}/note`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminNote }),
  });
};

export const deleteFeedback = async (id: number): Promise<void> => {
  await apiFetch(`${BASE}/admin/${id}`, { method: "DELETE" });
};
