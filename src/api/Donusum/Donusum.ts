import { apiFetch } from "@/api/apiBase";

import { DonusumMizanKarsilastirmaItem } from "@/app/(Uygulama)/components/DenetimKanitlari/DonusumMizanKontrol/VukMizanDonusumMizanKarsilastirma";

export const DonusumIslemiYap = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  denetimTuru: string,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumIslemiYap?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&denetimTuru=${denetimTuru}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "Post",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDonusumMizan = async (
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumMizan?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Donusum Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
export const getOzetDonusumMizan = async (
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumOzetMizan?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Donusum Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDonusumMizanKarsilastirma = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  tip: String,
) => {
  try {
    const response = await apiFetch(
      `/Mizan/VukMizanDonusumMizanKarsilastirma?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${tip}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Donusum Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};


export const getTersBakiyeVerenProgramVukMizanHesaplari = async (
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/TersBakiyeVerenProgramVukMizanHesaplari?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Ters bakiye veren hesaplar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getTersBakiyeVerenDonusumMizanHesaplari = async (
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/TersBakiyeVerenDonusumMizanHesaplari?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Ters bakiye veren hesaplar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
