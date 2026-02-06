import { apiFetch } from "@/api/apiBase";


export const getTanimlamalar = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Konsolidasyon/Tanimlamalar?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Tanımlamalar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getTanimlamalarById = async (id: any) => {
  try {
    const response = await apiFetch(`/Konsolidasyon/Tanimlamalar/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Tanımlamalar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateTanimlamalar = async (
  id: any,
  updatedTanimlamalar: any
) => {
  try {
    const response = await apiFetch(`/Konsolidasyon/Tanimlamalar/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTanimlamalar),
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

export const createBirlestirilmisMizan = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  baslangicTarihi?: any,
  bitisTarihi?: any
) => {
  try {
    const response = await apiFetch(
      `/Konsolidasyon/MizanBirlestir?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Birleştirilmiş Mizan oluşturulamadı");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
