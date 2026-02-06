import { apiFetch } from "@/api/apiBase";


export const getHazirFisListesiVerileri = async (
  denetimTuru: string
) => {
  try {
    const response = await apiFetch(
      `/HazirFisler/HazirFisler?denetimTuru=${denetimTuru}`,
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
      console.log("Hazır Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createFisListesineHazirFis = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  denetimTuru: string,
  hazirFisId: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/HazirFisler/DonusumFis?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&denetimTuru=${denetimTuru}&hazirFisId=${hazirFisId}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
