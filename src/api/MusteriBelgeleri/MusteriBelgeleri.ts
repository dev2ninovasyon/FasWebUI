// src/api/MusteriBelgeleri/MusteriBelgeleri.ts
import { apiFetch } from "@/api/apiBase";

export interface CalismaKagidiEkBelgeDto {
  id: number;
  dosyaAdi: string;
  olusturulmaTarihi: string;
  durum?: string;
  formKodu?: string;
}
export interface EkBelgeDto {
  id: number;
  orijinalDosyaAdi: string;
  yuklemeTarihi: string;
  contentType: string;
  boyut?: number;
}
interface UploadMusteriBelgeParams {
  denetciId: number;
  denetlenenId: number;
  yil: number;
  formKodu: string;
  files: File[];
}

// EK BELGE YÜKLE (fetch)
export async function uploadMusteriBelgeFetch(
  token: string,
  params: UploadMusteriBelgeParams
): Promise<void> {
  const { denetciId, denetlenenId, yil, formKodu, files } = params;
console.log("de")
  const formData = new FormData();
  formData.append("DenetciId", denetciId.toString());
  formData.append("DenetlenenId", denetlenenId.toString());
  formData.append("Yil", yil.toString());
  formData.append("FormKodu", formKodu);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await apiFetch(
    `/ArsivIslemleri/upload-ek-belge`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // fetch + FormData'da Content-Type otomatik ayarlanır, elle vermiyoruz.
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Ek belge yükleme başarısız (status: ${res.status}) ${text}`
    );
  }
}

// EK BELGE LİSTESİ (fetch)
export async function getMusteriBelgeleriFetch(
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  formKodu: string
): Promise<EkBelgeDto[]> {
  const params = new URLSearchParams({
    denetciId: denetciId.toString(),
    denetlenenId: denetlenenId.toString(),
    yil: yil.toString(),
    formKodu: formKodu,
  });

  const res = await apiFetch(
    `/ArsivIslemleri/ek-belge-listesi?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Ek belge listesi alınamadı (status: ${res.status}) ${text}`
    );
  }

  const data = (await res.json()) as EkBelgeDto[];
  return data;
}
