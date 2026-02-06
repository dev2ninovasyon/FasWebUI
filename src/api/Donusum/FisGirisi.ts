import { apiFetch } from "@/api/apiBase";


export const createFisGirisiVerisi = async (
  jsonData: any,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumFisleri?konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const getFisNo = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
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
      console.log("Fiş No getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
