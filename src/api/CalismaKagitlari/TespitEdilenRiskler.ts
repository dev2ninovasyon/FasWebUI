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

export interface TespitEdilenRisklerAddSatirDto {
  denetciId: number;
  denetlenenId: number;
  yil: number;
  islem: string;
  tespit: string;
  gerceklik: boolean;
  tamOlma: boolean;
  varOlma: boolean;
  dogrulukDonemsellik: boolean;
  degerleme: boolean;
  siniflama: boolean;
  uygulananDenetimTeknikleri: string | null;
  ilgiliBdsStandart: string | null;
}

export interface TespitEdilenRisklerUpdateSatirDto {
  islem: string;
  tespit: string;
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
 * Yeni satır ekler
 */
export const addSatirTespitEdilenRiskler = async (
  dto: TespitEdilenRisklerAddSatirDto
): Promise<boolean> => {
  try {
    const response = await apiFetch(`/TespitEdilenRiskler`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        DenetciId: dto.denetciId,
        DenetlenenId: dto.denetlenenId,
        Yil: dto.yil,
        Islem: dto.islem,
        Tespit: dto.tespit,
        Gerceklik: dto.gerceklik,
        TamOlma: dto.tamOlma,
        VarOlma: dto.varOlma,
        DogrulukDonemsellik: dto.dogrulukDonemsellik,
        Degerleme: dto.degerleme,
        Siniflama: dto.siniflama,
        UygulananDenetimTeknikleri: dto.uygulananDenetimTeknikleri,
        IlgiliBdsStandart: dto.ilgiliBdsStandart,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("TespitEdilenRiskler satır ekleme hatası:", error);
    return false;
  }
};

/**
 * Tek satırı günceller
 */
export const updateSatirTespitEdilenRiskler = async (
  id: number,
  dto: TespitEdilenRisklerUpdateSatirDto
): Promise<boolean> => {
  try {
    const response = await apiFetch(`/TespitEdilenRiskler/satir/${id}`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Islem: dto.islem,
        Tespit: dto.tespit,
        Gerceklik: dto.gerceklik,
        TamOlma: dto.tamOlma,
        VarOlma: dto.varOlma,
        DogrulukDonemsellik: dto.dogrulukDonemsellik,
        Degerleme: dto.degerleme,
        Siniflama: dto.siniflama,
        UygulananDenetimTeknikleri: dto.uygulananDenetimTeknikleri,
        IlgiliBdsStandart: dto.ilgiliBdsStandart,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("TespitEdilenRiskler satır güncelleme hatası:", error);
    return false;
  }
};

/**
 * Tek satırı siler
 */
export const deleteSatirTespitEdilenRiskler = async (id: number): Promise<boolean> => {
  try {
    const response = await apiFetch(`/TespitEdilenRiskler/${id}`, {
      method: "DELETE",
      headers: { accept: "application/json" },
    });
    return response.ok;
  } catch (error) {
    console.error("TespitEdilenRiskler satır silme hatası:", error);
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
