import { url } from "@/api/apiBase";

export const DonusumIslemiYap = async (
  token: string,
  denetlenenId: number,
  yil: number,
  denetimTuru: string,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await fetch(
      `${url}/Donusum/DonusumIslemiYap?denetlenenId=${denetlenenId}&yil=${yil}&denetimTuru=${denetimTuru}&konsolidasyonMu=${konsolidasyonMu}`,
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
    const response = await fetch(
      `${url}/Donusum/DonusumMizan?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
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
    const response = await fetch(
      `${url}/Donusum/TersBakiyeVerenProgramVukMizanHesaplari?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
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
    const response = await fetch(
      `${url}/Donusum/TersBakiyeVerenDonusumMizanHesaplari?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
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
