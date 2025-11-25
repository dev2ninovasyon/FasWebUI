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

export const getDonusumMizanKarsilastirma =  async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  tip: String,
) => {
  try {
    const response =await apiFetch(
      `/Mizan/VukMizanDonusumMizanKarsilastirma?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${tip}`,
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
