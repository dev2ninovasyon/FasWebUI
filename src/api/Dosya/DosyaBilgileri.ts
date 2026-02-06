import { apiFetch } from "@/api/apiBase";


export const getDosyaBilgileri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  tip: string
) => {
  try {
    const response = await apiFetch(
      `/Veri/DosyaBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${tip}`,
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
      console.log("Dosya Bilgileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteDosyaBilgisiById = async (id: number) => {
  try {
    const response = await apiFetch(`/Veri/DosyaBilgisi/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
      },
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

export const deleteDosyaBilgisiMultiple = async (
  selected: any
) => {
  try {
    const response = await apiFetch(`/Veri/DosyaBilgisiMultiple`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const getDefterYuklemeLoglari = async (id: number) => {
  try {
    const response = await apiFetch(`/Veri/EDefterYuklemeLoglari?id=${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Defter Yükleme Logları getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
