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
      return false;
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
      return false;
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
export const createRole = async (token: string, createdRole: any) => {
  try {
    const response = await fetch(`${url}/GorevAtamalari/Role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdRole),
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
