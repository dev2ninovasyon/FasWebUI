import { apiFetch } from "@/api/apiBase";


export const getFormat = async (name: string) => {
  try {
    const response = await apiFetch(`/Format/ByAdi/${name}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Format verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
