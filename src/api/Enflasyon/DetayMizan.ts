import { apiFetch } from "@/api/apiBase";

export const getEnflasyonDetayMizan = async (
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Enflasyon/DetayMizan?denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Enflasyon Detay Mizan verileri getirilemedi");
      return [];
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return [];
  }
};
