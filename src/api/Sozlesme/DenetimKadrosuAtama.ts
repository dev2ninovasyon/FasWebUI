import { apiFetch } from "@/api/apiBase";


export const getGorevAtamalariByKullaniciId = async (
  kullaniciId: number
) => {
  try {
    const response = await apiFetch(
      `/GorevAtamalari/Kullanici?kullaniciId=${kullaniciId}`,
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
      console.log("Görev Atamaları getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getGorevAtamalariByDenetlenenIdYil = async (
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/GorevAtamalari/DenetlenenYil?denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Görev Atamaları getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getGorevAtamalariById = async (id: any) => {
  try {
    const response = await apiFetch(`/GorevAtamalari/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Görev Atamaları getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createGorevAtamalari = async (
  createdGorevAtamalari: any
) => {
  try {
    const response = await apiFetch("/GorevAtamalari", {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdGorevAtamalari),
    });

    if (response.ok) {
      return true;
    } else {
      const contentType = response.headers.get("content-type");
      let message = "Hata Oluştu";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        message = errorData || message;
      } else {
        message = await response.text();
      }

      return { message };
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateGorevAtamalari = async (
  id: any,
  updatedGorevAtamalari: any
) => {
  try {
    const response = await apiFetch(`/GorevAtamalari/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedGorevAtamalari),
    });

    if (response.ok) {
      return true;
    } else {
      const contentType = response.headers.get("content-type");
      let message = "Hata Oluştu";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        message = errorData || message;
      } else {
        message = await response.text();
      }

      return { message };
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteGorevAtamalariById = async (id: number) => {
  try {
    const response = await apiFetch(`/GorevAtamalari/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
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

export const getAllUnvanlar = async () => {
  try {
    const response = await apiFetch(`/GorevAtamalari/Unvanlar`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Ünvan getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getRol = async (
  kullaniciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/GorevAtamalari/Rol/${kullaniciId}/${denetlenenId}/${yil}`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Rol getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKullaniciRol = async (
  kullaniciId: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/GorevAtamalari/KullaniciRol?kullaniciId=${kullaniciId}&denetlenenId=${denetlenenId}`,
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
      console.log("Kullanıcı Rol getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
