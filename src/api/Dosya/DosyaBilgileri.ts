import { url } from "@/api/apiBase";

export const getDosyaBilgileri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  tip: string
) => {
  try {
    const response = await fetch(
      `${url}/Veri/DosyaBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${tip}`,
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
      console.error("Dosya Bilgileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteDosyaBilgisiById = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Veri/DosyaBilgisi/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteDosyaBilgisiMultiple = async (
  token: string,
  selected: any
) => {
  try {
    const response = await fetch(`${url}/Veri/DosyaBilgisiMultiple`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selected),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDefterYuklemeLoglari = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Veri/EDefterYuklemeLoglari?id=${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response) {
      return response.json();
    } else {
      console.error("Defter Yükleme Logları getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
