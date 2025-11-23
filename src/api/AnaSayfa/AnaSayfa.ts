// src/api/AuditLogs.ts
import { url,apiFetch } from "@/api/apiBase";

// src/api/AuditLogs.ts
export interface UserActionDto {
  id: number;
  userId?: string;
  userName?: string;
  httpMethod?: string;
  path?: string;
  controllerName?: string;
  actionName?: string;
  statusCode: number;
  isError: boolean;
  queryString?: string;
  createdAt: string;
  title?: string;
  subtitle?: string;
  friendlyTitle?: string;
  friendlyMessage?: string;
  clientUrl?: string;   // 🔹 yeni alan
}

export async function getUserRecentActions(
  token: string,
  userId:number,
  denetlenenId: number,
  yil: number,
  count: number
): Promise<UserActionDto[]> {
  const response = await apiFetch(
    `/Audit/UserRecentActions?userId=${userId}&count=${count}&denetlenenId=${denetlenenId}&yil=${yil}`,
    {
      method: "GET",
        headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Son işlemler alınırken hata oluştu.");
  }

  return response.json();
}
