// src/api/AuditLogs.ts
import { url, apiFetch } from "@/api/apiBase";


export interface UserActionDto {
  id: number;
  userId: number;
  userName?: string;
  httpMethod?: string;
  path?: string;
  controllerName?: string;
  actionName?: string;
  statusCode: number;
  isError: boolean;
  queryString?: string;
  createdAt: string;
  clientUrl?: string;

  title?: string;
  subtitle?: string;
  friendlyTitle?: string;
  friendlyMessage?: string;

  // ğŸ”¹ Backend'de eklediğimiz alanlar:
  denetlenenId?: number | null;
  denetlenenUnvani?: string | null;
}


export async function getUserRecentActions(
  userId: number,
  denetlenenId: number,
  yil: number,
  count: number
): Promise<UserActionDto[]> {

  const response = await apiFetch(
    `/Audit/UserRecentActions?userId=${userId}&count=${count}&denetlenenId=${denetlenenId}&yil=${yil}`,
    {
      method: "GET",
      headers: {
        // Authorization header removed - handled by apiFetch
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Son işlemler alınırken hata oluştu.");
  }

  return response.json();
}
// src/api/AnaSayfa/Dashboard.ts
export interface SirketArsivOzetItemDto {
  denetlenenId: number;
  sirketUnvani: string;
  yil: number;
  dosyaSayisi: number;
  toplamBoyutByte: number;
  toplamBoyutMb: number;
}

export interface SirketArsivOzetDto {
  kullaniciId: number;
  toplamSirketSayisi: number;
  toplamBoyutByte: number;
  toplamBoyutMb: number;
  sirketler: SirketArsivOzetItemDto[];
}

export async function getSirketArsivOzet(
  kullaniciId: number,
  denetciId: number
): Promise<SirketArsivOzetDto> {
  const res = await apiFetch(
    `/Audit/sirket-arsiv-ozet?denetciId=${denetciId}&kullaniciId=${kullaniciId}`,
    {
      headers: {
        // Authorization header removed - handled by apiFetch
      },
      next: { revalidate: 0 },
    }
  );

  if (!res.ok) {
    throw new Error("Şirket arşiv özeti alınamadı.");
  }

  return res.json();
}
