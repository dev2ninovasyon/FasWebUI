import { url } from "@/api/apiBase";

export const getFisIslemSayilari = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/FisIslemSayilari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Fiş İşlem Sayıları getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
