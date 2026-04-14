import { apiFetch } from "@/api/apiBase";

export interface IsletmeyeIliskinIcKontrolTespitRow {
  id: number;
  satirNo: number | null;
  bolum: string | null;
  konu: string | null;
  islem: string | null;
  durum: string;
  tespit: string | null;
  evetRiskSeviyesi: string | null;
  evetIcerik: string | null;
  evetDenetimAksiyonu: string | null;
  hayirRiskSeviyesi: string | null;
  hayirIcerik: string | null;
  hayirDenetimAksiyonu: string | null;
  ilgiliBds: string | null;
  standartmi: boolean | null;
}

export interface IsletmeyeIliskinIcKontrolTespitSayfaRow {
  id: number;
  sheetKod: string | null;
  sheetAdi: string | null;
  sira: number | null;
  veriJson: string | null;
  standartmi: boolean | null;
}

export interface IsletmeyeIliskinIcKontrolTespitSatirDto {
  id: number;
  durum: string;
  islem: string | null;
  tespit: string | null;
  ilgiliBds: string | null;
}

export interface IsletmeyeIliskinIcKontrolTespitKaydetDto {
  denetciId: number;
  denetlenenId: number;
  yil: number;
  satirlar: IsletmeyeIliskinIcKontrolTespitSatirDto[];
}

export const getIsletmeyeIliskinIcKontrolTespitByDenetlenen = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<IsletmeyeIliskinIcKontrolTespitRow[]> => {
  try {
    const response = await apiFetch(
      `/IsletmeyeIliskinIcKontrolTespit?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      { method: "GET", headers: { accept: "application/json" } }
    );
    if (response.ok) return response.json();
    console.error("IsletmeyeIliskinIcKontrolTespit verileri getirilemedi");
    return [];
  } catch (error) {
    console.error("IsletmeyeIliskinIcKontrolTespit getirme hatası:", error);
    return [];
  }
};

export const kaydetIsletmeyeIliskinIcKontrolTespit = async (
  dto: IsletmeyeIliskinIcKontrolTespitKaydetDto
): Promise<boolean> => {
  try {
    const response = await apiFetch(`/IsletmeyeIliskinIcKontrolTespit/kaydet`, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    return response.ok;
  } catch (error) {
    console.error("IsletmeyeIliskinIcKontrolTespit kaydetme hatası:", error);
    return false;
  }
};

export const getIsletmeyeIliskinIcKontrolTespitSayfalariByDenetlenen = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<IsletmeyeIliskinIcKontrolTespitSayfaRow[]> => {
  try {
    const response = await apiFetch(
      `/IsletmeyeIliskinIcKontrolTespit/sayfalar?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      { method: "GET", headers: { accept: "application/json" } }
    );
    if (response.ok) return response.json();
    console.error("IsletmeyeIliskinIcKontrolTespit sayfa verileri getirilemedi");
    return [];
  } catch (error) {
    console.error("IsletmeyeIliskinIcKontrolTespit sayfa getirme hatası:", error);
    return [];
  }
};

export const varsayilanaDonIsletmeyeIliskinIcKontrolTespit = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
): Promise<boolean> => {
  try {
    const response = await apiFetch(
      `/IsletmeyeIliskinIcKontrolTespit?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      { method: "DELETE", headers: { accept: "application/json" } }
    );
    return response.ok;
  } catch (error) {
    console.error("IsletmeyeIliskinIcKontrolTespit varsayılana dönme hatası:", error);
    return false;
  }
};
