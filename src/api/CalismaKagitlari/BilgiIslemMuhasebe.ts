import { apiFetch } from "@/api/apiBase";

export interface BilgiIslemMuhasebeRow {
  id: number;
  satirNo: number | null;
  sheetAdi: string | null;
  riskSeviyesi: string | null;
  islem: string | null;
  durum: string;
  tespit: string | null;
  evetIcerik: string | null;
  hayirIcerik: string | null;
  bdsReferansi: string | null;
  standartmi: boolean | null;
}

export interface BilgiIslemMuhasebeUpdateItem {
  id: number;
  durum: string;
  tespit: string | null;
}

export interface BilgiIslemMuhasebeKaydetDto {
  denetciId: number;
  denetlenenId: number;
  yil: number;
  satirlar: BilgiIslemMuhasebeUpdateItem[];
}

/**
 * Şirket + yıl bazında BilgiIslemMuhasebe verilerini getirir.
 * Kayıt yoksa şablondan otomatik oluşturulur.
 */
export const getBilgiIslemMuhasebeByDenetlenen = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<BilgiIslemMuhasebeRow[]> => {
  try {
    const response = await apiFetch(
      `/BilgiIslemMuhasebe?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      }
    );
    if (response.ok) {
      return response.json();
    }
    console.error("BilgiIslemMuhasebe verileri getirilemedi");
    return [];
  } catch (error) {
    console.error("BilgiIslemMuhasebe getirme hatası:", error);
    return [];
  }
};

/**
 * Tüm sayfayı toplu kaydeder (Evet/Hayır seçimleri + Tespit içerikleri)
 */
export const kaydetBilgiIslemMuhasebe = async (
  dto: BilgiIslemMuhasebeKaydetDto
): Promise<boolean> => {
  try {
    const response = await apiFetch(`/BilgiIslemMuhasebe/kaydet`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    return response.ok;
  } catch (error) {
    console.error("BilgiIslemMuhasebe kaydetme hatası:", error);
    return false;
  }
};

/**
 * Tek bir satırı günceller (anlık değişiklikler için)
 */
export const guncelleBilgiIslemMuhasebeRow = async (
  id: number,
  durum: string,
  tespit: string | null
): Promise<boolean> => {
  try {
    const response = await apiFetch(`/BilgiIslemMuhasebe/satir/${id}`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ islem: "", durum, tespit: tespit ?? "" }),
    });
    return response.ok;
  } catch (error) {
    console.error("BilgiIslemMuhasebe satır güncelleme hatası:", error);
    return false;
  }
};

/**
 * Varsayılan değerlere döner (kullanıcıya özgü tüm kayıtları siler)
 */
export const varsayilanaDonBilgiIslemMuhasebe = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `/BilgiIslemMuhasebe?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
        headers: { accept: "application/json" },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("BilgiIslemMuhasebe varsayılana dönme hatası:", error);
    return false;
  }
};
