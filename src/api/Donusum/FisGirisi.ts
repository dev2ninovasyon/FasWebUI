import { url } from "@/api/apiBase";

export const createFisGirisiVerisi = async (
  token: string,
  jsonData: any,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await fetch(
      `${url}/Donusum/DonusumFisleri?konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
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

export const getFisNo = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await fetch(
      `${url}/Donusum/DonusumFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
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
      console.error("Fiş No getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
