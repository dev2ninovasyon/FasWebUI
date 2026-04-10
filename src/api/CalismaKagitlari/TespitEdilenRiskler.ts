import { apiFetch } from "@/api/apiBase";

export interface TespitEdilenRisklerRow {
  id: number;
  satirNo: number | null;
  islem: string | null;
  tespit: string | null;
  gerceklik: boolean | null;
  tamOlma: boolean | null;
  varOlma: boolean | null;
  dogrulukDonemsellik: boolean | null;
  degerleme: boolean | null;
  siniflama: boolean | null;
  uygulananDenetimTeknikleri: string | null;
  ilgiliBdsStandart: string | null;
  standartmi: boolean | null;
}

export interface TespitEdilenRisklerSatirDto {
  id: number;
  gerceklik: boolean;
  tamOlma: boolean;
  varOlma: boolean;
  dogrulukDonemsellik: boolean;
  degerleme: boolean;
  siniflama: boolean;
  uygulananDenetimTeknikleri: string | null;
  ilgiliBdsStandart: string | null;
}

export interface TespitEdilenRisklerKaydetDto {
  denetciId: number;
  denetlenenId: number;
  yil: number;
  satirlar: TespitEdilenRisklerSatirDto[];
}

/**
 * Şirket + yıl bazında TespitEdilenRiskler verilerini getirir.
 * Kayıt yoksa şablondan otomatik oluşturulur.
 */
export const getTespitEdilenRisklerByDenetlenen = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<TespitEdilenRisklerRow[]> => {
  try {
    const response = await apiFetch(
      `/TespitEdilenRiskler?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      }
    );
    if (response.ok) {
      return response.json();
    }
    console.error("TespitEdilenRiskler verileri getirilemedi");
    return [];
  } catch (error) {
    console.error("TespitEdilenRiskler getirme hatası:", error);
    return [];
  }
};

/**
 * Tüm sayfayı toplu kaydeder
 */
export const kaydetTespitEdilenRiskler = async (
  dto: TespitEdilenRisklerKaydetDto
): Promise<boolean> => {
  try {
    const response = await apiFetch(`/TespitEdilenRiskler/kaydet`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    return response.ok;
  } catch (error) {
    console.error("TespitEdilenRiskler kaydetme hatası:", error);
    return false;
  }
};

/**
 * Varsayılan değerlere döner (kullanıcıya özgü tüm kayıtları siler)
 */
export const varsayilanaDonTespitEdilenRiskler = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `/TespitEdilenRiskler?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
        headers: { accept: "application/json" },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("TespitEdilenRiskler varsayılana dönme hatası:", error);
    return false;
  }
};
