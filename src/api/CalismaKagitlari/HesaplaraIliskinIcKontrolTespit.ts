import { apiFetch } from "@/api/apiBase";

export interface HesaplaraIliskinIcKontrolTespitRow {
  id: number;
  satirNo: number | null;
  bolumBasligi: string | null;
  hesapGrubu: string | null;
  konu: string | null;
  hesapAdi: string | null;
  islem: string | null;
  standartReferans: string | null;
  riskBoyutu: string | null;
  yuksekRiskTetikleyici: string | null;
  yuksekRiskSkoru: number | null;
  onerilenProsedur: string | null;
  durum: string | null;
  tespit: string | null;
  standartmi: boolean | null;
}

export interface HesaplaraIliskinIcKontrolTespitKaydetSatirDto {
  id: number;
  durum: string | null;
  tespit: string | null;
}

export interface HesaplaraIliskinIcKontrolTespitKaydetDto {
  denetciId: number;
  denetlenenId: number;
  yil: number;
  satirlar: HesaplaraIliskinIcKontrolTespitKaydetSatirDto[];
}

/**
 * Risk skoru hesaplama (Excel formülü: =IF(Durum=Tetikleyici, YuksekSkor, IF(Durum="Kapsam Dışı", 0, 1)))
 */
export function hesaplaRiskSkoru(
  durum: string | null,
  tetikleyici: string | null,
  yuksekSkoru: number | null
): number {
  if (!durum) return 1;
  if (durum === "Kapsam Dışı") return 0;
  if (tetikleyici && durum === tetikleyici) return yuksekSkoru ?? 3;
  return 1;
}

/**
 * Risk seviyesi hesaplama (Excel formülü: =IF(Skor=0,"Kapsam Dışı",IF(Skor>=3,"Yüksek",IF(Skor>=2,"Orta","Düşük"))))
 */
export function hesaplaRiskSeviyesi(riskSkoru: number): string {
  if (riskSkoru === 0) return "Kapsam Dışı";
  if (riskSkoru >= 3) return "Yüksek";
  if (riskSkoru >= 2) return "Orta";
  return "Düşük";
}

/**
 * Takip gerekli hesaplama (Excel formülü: =IF(OR(Seviye="Yüksek",Seviye="Orta"),"Evet","Hayır"))
 */
export function hesaplaTakipGerekli(riskSeviyesi: string): string {
  return riskSeviyesi === "Yüksek" || riskSeviyesi === "Orta" ? "Evet" : "Hayır";
}

/**
 * Şirket + yıl bazında tüm İç Kontrol Tespit verilerini getirir.
 * Kayıt yoksa standart verilerden otomatik oluşturulur.
 */
export const getHesaplaraIliskinIcKontrolTespitByDenetlenen = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<HesaplaraIliskinIcKontrolTespitRow[]> => {
  try {
    const response = await apiFetch(
      `/HesaplaraIliskinIcKontrolTespit?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      }
    );
    if (response.ok) {
      return response.json();
    }
    console.error("HesaplaraIliskinIcKontrolTespit verileri getirilemedi");
    return [];
  } catch (error) {
    console.error("HesaplaraIliskinIcKontrolTespit getirme hatası:", error);
    return [];
  }
};

/**
 * Tüm sayfayı toplu kaydeder (Evet/Hayır/Kapsam Dışı seçimleri + Tespit notları)
 */
export const kaydetHesaplaraIliskinIcKontrolTespit = async (
  dto: HesaplaraIliskinIcKontrolTespitKaydetDto
): Promise<boolean> => {
  try {
    const payload = {
      DenetciId: dto.denetciId,
      DenetlenenId: dto.denetlenenId,
      Yil: dto.yil,
      Satirlar: dto.satirlar.map((s) => ({
        Id: s.id,
        Durum: s.durum,
        Tespit: s.tespit,
      })),
    };

    const response = await apiFetch(`/HesaplaraIliskinIcKontrolTespit/kaydet`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    console.error("HesaplaraIliskinIcKontrolTespit kaydetme hatası:", error);
    return false;
  }
};

/**
 * Tek satırı günceller (anlık değişiklik için)
 */
export const guncelleHesaplaraIliskinIcKontrolTespitSatir = async (
  id: number,
  durum: string | null,
  tespit: string | null
): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `/HesaplaraIliskinIcKontrolTespit/satir/${id}`,
      {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hesapAdi: "",
          islem: "",
          durum: durum ?? "",
          tespit: tespit ?? "",
        }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error("HesaplaraIliskinIcKontrolTespit satır güncelleme hatası:", error);
    return false;
  }
};

/**
 * Varsayılan değerlere döner (kullanıcıya özgü tüm kayıtları siler)
 */
export const varsayilanaDonHesaplaraIliskinIcKontrolTespit = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `/HesaplaraIliskinIcKontrolTespit?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
        headers: { accept: "application/json" },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("HesaplaraIliskinIcKontrolTespit varsayılana dönme hatası:", error);
    return false;
  }
};
