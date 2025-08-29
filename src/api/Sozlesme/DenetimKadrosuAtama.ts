import { url } from "@/api/apiBase";

export const getGorevAtamalariByKullaniciId = async (
  token: string,
  kullaniciId: number
) => {
  try {
    const response = await fetch(
      `${url}/GorevAtamalari/Kullanici?kullaniciId=${kullaniciId}`,
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
      console.error("Görev Atamaları getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getGorevAtamalariByDenetlenenIdYil = async (
  token: string,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/GorevAtamalari/DenetlenenYil?denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Görev Atamaları getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getGorevAtamalariById = async (token: string, id: any) => {
  try {
    const response = await fetch(`${url}/GorevAtamalari/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Görev Atamaları getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createGorevAtamalari = async (
  token: string,
  createdGorevAtamalari: any
) => {
  try {
    const response = await fetch(`${url}/GorevAtamalari`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    console.error("Bir hata oluştu:", error);
  }
};

export const updateGorevAtamalari = async (
  token: string,
  id: any,
  updatedGorevAtamalari: any
) => {
  try {
    const response = await fetch(`${url}/GorevAtamalari/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteGorevAtamalariById = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/GorevAtamalari/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
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

export const getAllUnvanlar = async (token: string) => {
  try {
    const response = await fetch(`${url}/GorevAtamalari/Unvanlar`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Ünvan getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getRol = async (
  token: string,
  kullaniciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/GorevAtamalari/Roller?kullaniciId=${kullaniciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Rol getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKullaniciRol = async (
  token: string,
  kullaniciId: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/GorevAtamalari/KullaniciRol?kullaniciId=${kullaniciId}&denetlenenId=${denetlenenId}`,
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
      console.error("Kullanıcı Rol getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
