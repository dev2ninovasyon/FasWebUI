import { apiFetch } from "@/api/apiBase";

import { DonusumMizanKarsilastirmaItem } from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/VukMizanDonusumMizanKarsilastirma";

export const DonusumIslemiYap = async (
  token: string,
  denetlenenId: number,
  yil: number,
  denetimTuru: string,
  konsolidasyonMu: boolean
) => {
  try {
    const response =await apiFetch(
      `/Donusum/DonusumIslemiYap?denetlenenId=${denetlenenId}&yil=${yil}&denetimTuru=${denetimTuru}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "Post",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDonusumMizan = async (
  token: string,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response =await apiFetch(
      `/Donusum/DonusumMizan?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Donusum Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
export const getOzetDonusumMizan = async (
  token: string,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response =await apiFetch(
      `/Donusum/DonusumOzetMizan?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Donusum Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDonusumMizanKarsilastirma = async () => {
  const res =await apiFetch(
    "https://betaapi.fasmart.app/api/Mizan/VukMizanDonusumMizanKarsilastirma?denetciId=2&yil=2023&denetlenenId=1&tip=E-Defter",
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Veri alınamadı");
  }

  const data: DonusumMizanKarsilastirmaItem[] = await res.json();

  const finansalDurum = data
    .filter((item) => item.tabloAdi === "finansaldurum")
    .sort((a, b) => Number(a.sira ?? 0) - Number(b.sira ?? 0));

  const karZarar = data
    .filter((item) => item.tabloAdi === "karzarar")
    .sort((a, b) => Number(a.sira ?? 0) - Number(b.sira ?? 0));

  return [...finansalDurum, ...karZarar];
};

export const getTersBakiyeVerenProgramVukMizanHesaplari = async (
  token: string,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response =await apiFetch(
      `/Donusum/TersBakiyeVerenProgramVukMizanHesaplari?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Ters bakiye veren hesaplar getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getTersBakiyeVerenDonusumMizanHesaplari = async (
  token: string,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response =await apiFetch(
      `/Donusum/TersBakiyeVerenDonusumMizanHesaplari?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Ters bakiye veren hesaplar getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
