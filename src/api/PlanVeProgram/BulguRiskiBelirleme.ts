import { apiFetch } from "@/api/apiBase";

export interface MizanVerisiRequest {
  netSatislar: number | null;
  toplamAktif: number | null;
  ticariAlacaklar: number | null;
  stokToplam: number | null;
  maddiDuranVarliklarNet: number | null;
  bankaKasa: number | null;
  ticariBorc: number | null;
  donemKarZarar: number | null;
  netSatislarOncekiDonem: number | null;
  değişimYuzde: number | null;
}

export interface DoğalRiskPuanRequest {
  sektorRiskiPuani: number | null;
  musteriCesitlilikPuani: number | null;
  iliskiliTarafYogunluguPuani: number | null;
  oncerikiBulgPuani: number | null;
  yönetimDurustlukuPuani: number | null;
  btSistemKarmasiklikPuani: number | null;
  olaguandisiIslemYogunluguPuani: number | null;
  hukukiDavaPuani: number | null;
  isletmeKulturesuPuani: number | null;
  muhasebePersonelIstikrariPuani: number | null;
}

export interface KontrolRiskiSatiriRequest {
  satirNumarasi: number;
  surecAlani: string | null;
  kontrolTanımı: string | null;
  puani: number | null;
  agirlik: number | null;
  bdsKaynagi: string | null;
}

export interface SaveBulguRiskiRequest {
  denetciId: number;
  denetlenenId: number;
  yil: number;
  mizanVerisi: MizanVerisiRequest | null;
  onemlilik_PM: number | null;
  onemlilik_OM: number | null;
  onemlilik_Esik: number | null;
  doğalRiskPuan: DoğalRiskPuanRequest | null;
  dogalRisk: number | null;
  dogalRiskSeviyesi: string | null;
  kontrolRiskiSatirlari: KontrolRiskiSatiriRequest[] | null;
  kontrolRiski: number | null;
  kontrolRiskiSeviyesi: string | null;
  kabulEdilDenetimRiski: number | null;
  ortayaCikaramama_OR: number | null;
  onerilen_DenetimProseduru: string | null;
  orneklemeOrani: number | null;
  kanitYogunlugu?: string | null;
  aktifSatir?: string | null;
  sonucMetni: string | null;
  tamamMi: boolean;
}

export const hesaplaOnemlilik = async (netSatislar: number) => {
  try {
    const res = await apiFetch(`/BulguRiskiBelirlemeBelge/HesaplaOnemlilik?netSatislar=${netSatislar}`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    const result = await res.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const hesaplaDogalRisk = async (denetimId: number, sirketId: number, faktorler: any[]) => {
  try {
    const res = await apiFetch(`/BulguRiskiBelirlemeBelge/HesaplaDoğalRisk?denetimId=${denetimId}&sirketId=${sirketId}`, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(faktorler),
    });
    const result = await res.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const hesaplaKontrolRiski = async (denetimId: number, sirketId: number, kontroller: any[]) => {
  try {
    const res = await apiFetch(`/BulguRiskiBelirlemeBelge/HesaplaKontrolRiski?denetimId=${denetimId}&sirketId=${sirketId}`, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(kontroller),
    });
    const result = await res.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const hesaplaOrVeProsedur = async (dr: number, kr: number, kdr: number = 0.05) => {
  try {
    const res = await apiFetch(`/BulguRiskiBelirlemeBelge/HesaplaOrVeProsedur?dr=${dr}&kr=${kr}&kdr=${kdr}`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    const result = await res.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const saveBulguRiskiBelirleme = async (request: SaveBulguRiskiRequest) => {
  try {
    const res = await apiFetch(`/BulguRiskiBelirlemeBelge/SaveBulguRiskiBelirleme`, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const result = await res.json();
    return result.success;
  } catch {
    return false;
  }
};

export const getBulguRiskiBelirleme = async (denetciId: number, denetlenenId: number, yil: number) => {
  try {
    const res = await apiFetch(`/BulguRiskiBelirlemeBelge/GetBulguRiskiBelirleme?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    const result = await res.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};
