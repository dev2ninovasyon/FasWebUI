import { url } from "@/api/apiBase";

export const getSurekliEgitimBilgileriById = async (token: string, id: any) => {
  try {
    const response = await fetch(
      `${url}/Kullanici/SurekliEgitimBilgileri/${id}`,
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
      console.error("Sürekli Eğitim Bilgileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getSurekliEgitimBilgileriByDenetciId = async (
  token: string,
  denetciId: any
) => {
  try {
    const response = await fetch(
      `${url}/Kullanici/SurekliEgitimBilgileri/${denetciId}`,
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
      console.error("Kullanicilar getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createSurekliEgitimBilgileri = async (
  token: string,
  createdSurekliEgitimBilgileri: any
) => {
  try {
    const response = await fetch(`${url}/Kullanici/SurekliEgitimBilgileri`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdSurekliEgitimBilgileri),
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

export const updateSurekliEgitimBilgileri = async (
  token: string,
  id: any,
  updatedSurekliEgitimBilgileri: any
) => {
  try {
    const response = await fetch(
      `${url}/Kullanici/SurekliEgitimBilgileri/${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSurekliEgitimBilgileri),
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

export const deleteSurekliEgitimBilgileriById = async (
  token: string,
  id: number
) => {
  try {
    const response = await fetch(
      `${url}/Kullanici/SurekliEgitimBilgileri/${id}`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
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
