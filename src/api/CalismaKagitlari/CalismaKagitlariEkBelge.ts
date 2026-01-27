// /api/CalismaKagitlari/CalismaKagitlari.ts
import { apiFetch } from "@/api/apiBase";

export interface EkBelgeDto {
  id: number;
  orijinalDosyaAdi: string;
  yuklemeTarihi: string;
  contentType: string;
  boyut?: number;
}

export async function uploadEkBelge(
  token: string,
  formData: FormData
): Promise<boolean | { success: boolean; message?: string }> {
  try {
    const response = await apiFetch(
      `/ArsivIslemleri/upload-ek-belge`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (response.ok) {
      return true;
    }

    const data = await response.json().catch(() => null);

    return {
      success: false,
      message: data?.message || "Ek belge yüklenemedi.",
    };
  } catch (error) {
    console.error("uploadEkBelge hata:", error);
    return {
      success: false,
      message: "Sunucuya bağlanırken bir hata oluştu.",
    };
  }
}

export async function getEkBelgeler(
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  formKodu: string
): Promise<EkBelgeDto[]> {
  const params = new URLSearchParams({
    denetciId: String(denetciId),
    denetlenenId: String(denetlenenId),
    yil: String(yil),
    formKodu: formKodu,
  });

  const response = await apiFetch(
    `/ArsivIslemleri/ek-belge-listesi?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error("getEkBelgeler hata:", response.status);
    return [];
  }

  const data = await response.json();
  return data as EkBelgeDto[];
}

export async function downloadEkBelge(
  token: string,
  id: number
): Promise<{ blob: Blob; fileName: string | null }> {
  const response = await apiFetch(`/ArsivIslemleri/ek-belge-indir/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Ek belge indirilemedi.");
  }

  const blob = await response.blob();

  // Header'dan dosya adını çek
  const contentDisposition = response.headers.get("content-disposition");
  let fileName: string | null = null;

  if (contentDisposition) {
    // örn: attachment; filename="rapor.docx"
    const fileNameMatch = contentDisposition
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.toLowerCase().startsWith("filename="));

    if (fileNameMatch) {
      fileName = fileNameMatch.split("=")[1].trim().replace(/(^")|("$)/g, "");
    }
  }

  return { blob, fileName };
}
export async function deleteEkBelge(
  token: string,
  id: number
): Promise<boolean> {
  try {
    const response = await apiFetch(
      `/ArsivIslemleri/ek-belge-sil/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("deleteEkBelge hata:", error);
    return false;
  }
}
export async function deleteEkBelgelerSecilenler(
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  ids: number[]
): Promise<{ success: boolean; deleted: number }> {
  const res = await apiFetch(
    `/ArsivIslemleri/ek-belge-sil-secilenler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    }
  );

  if (!res.ok) {
    throw new Error("Seçili ek belgeler silinemedi.");
  }

  return await res.json();
}

// MaddiDogrulama specific functions
export async function uploadMaddiDogrulamaEkBelge(
  token: string,
  formData: FormData
): Promise<boolean | { success: boolean; message?: string }> {
  try {
    const response = await apiFetch(
      `/ArsivIslemleri/upload-ek-belge`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (response.ok) {
      return true;
    }

    const data = await response.json().catch(() => null);

    return {
      success: false,
      message: data?.message || "Ek belge yüklenemedi.",
    };
  } catch (error) {
    console.error("uploadMaddiDogrulamaEkBelge hata:", error);
    return {
      success: false,
      message: "Sunucuya bağlanırken bir hata oluştu.",
    };
  }
}

export async function getMaddiDogrulamaEkBelgeler(
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  belgeAdi: string
): Promise<EkBelgeDto[]> {
  const params = new URLSearchParams({
    denetciId: String(denetciId),
    denetlenenId: String(denetlenenId),
    yil: String(yil),
    belgeAdi: belgeAdi,
  });

  const response = await apiFetch(
    `/ArsivIslemleri/ek-belge-listesi?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error("getMaddiDogrulamaEkBelgeler hata:", response.status);
    return [];
  }

  const data = await response.json();
  return data as EkBelgeDto[];
}
