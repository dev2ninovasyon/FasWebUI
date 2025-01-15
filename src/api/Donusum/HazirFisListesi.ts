import { url } from "@/api/apiBase";

export const getHazirFisListesiVerileri = async (
  token: string,
  denetimTuru: string
) => {
  try {
    const response = await fetch(
      `${url}/HazirFisler/HazirFisler?denetimTuru=${denetimTuru}`,
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
      console.error("Hazır Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createFisListesineHazirFis = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  denetimTuru: string,
  hazirFisId: number
) => {
  try {
    const response = await fetch(
      `${url}/HazirFisler/DonusumFis?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&denetimTuru=${denetimTuru}&hazirFisId=${hazirFisId}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
