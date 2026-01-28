import { apiFetch } from "@/api/apiBase";

export const getDavaKarsiliklariVerileriByDenetciDenetlenenYil = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response =await apiFetch(
      `/Veri/DavaKarsiliklari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Dava Karşılıkları verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createDavaKarsiliklariVerisi = async (
  token: string,
  jsonData: any
) => {
  try {
    const response =await apiFetch(`/Veri/DavaKarsiliklari`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteDavaKarsiliklariVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response =await apiFetch(
      `/Veri/DavaKarsiliklari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
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
    console.log("Bir hata oluştu:", error);
  }
};
