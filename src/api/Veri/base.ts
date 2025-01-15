import { url } from "@/api/apiBase";

export const getFormat = async (token: string, name: string) => {
  try {
    const response = await fetch(`${url}/Format/ByAdi/${name}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Format verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
