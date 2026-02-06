import { apiFetch } from "@/api/apiBase";


export const getSurekliEgitimBilgileriById = async (id: any) => {
  try {
    const response = await apiFetch(
      `/Kullanici/SurekliEgitimBilgileri/${id}`,
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
      console.log("Sürekli Eğitim Bilgileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getSurekliEgitimBilgileriByDenetciId = async (
  denetciId: any
) => {
  try {
    const response = await apiFetch(
      `/Kullanici/SurekliEgitimBilgileri/Denetci/${denetciId}`,
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
      console.log("Kullanicilar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createSurekliEgitimBilgileri = async (
  createdSurekliEgitimBilgileri: any
) => {
  try {
    const response = await apiFetch(`/Kullanici/SurekliEgitimBilgileri`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdSurekliEgitimBilgileri),
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

export const updateSurekliEgitimBilgileri = async (
  id: any,
  updatedSurekliEgitimBilgileri: any
) => {
  try {
    const response = await apiFetch(
      `/Kullanici/SurekliEgitimBilgileri/${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteSurekliEgitimBilgileriById = async (
  id: number
) => {
  try {
    const response = await apiFetch(
      `/Kullanici/SurekliEgitimBilgileri/${id}`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
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
