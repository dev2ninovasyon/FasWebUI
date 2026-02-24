import { apiFetch } from "@/api/apiBase";

export const createFisGirisiVerisi = async (
  jsonData: any,
  _konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(`/Donusum/DonusumEnflasyonFisleri`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    return response.ok;
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getFisNo = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  _konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumEnflasyonFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return response.json();
    }

    console.log("Fiş No getirilemedi");
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
