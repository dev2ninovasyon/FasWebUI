import { apiFetch } from "@/api/apiBase";


export const getTanimlamalar = async (
  token: string,
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
          Authorization: `Bearer ${token}`,
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

export const getTanimlamalarById = async (token: string, id: any) => {
  try {
    const response = await apiFetch(`/Konsolidasyon/Tanimlamalar/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
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
  token: string,
  id: any,
  updatedTanimlamalar: any
) => {
  try {
    const response = await apiFetch(`/Konsolidasyon/Tanimlamalar/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  baslangicTarihi?: any,
  bitisTarihi?: any
) => {
  try {
    let urlString = `/Konsolidasyon/MizanBirlestir?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`;
    if (baslangicTarihi) urlString += `&baslangicTarihi=${baslangicTarihi}`;
    if (bitisTarihi) urlString += `&bitisTarihi=${bitisTarihi}`;

    const response = await apiFetch(urlString, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
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
