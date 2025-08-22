import { url } from "@/api/apiBase";

export const getKullanicilar = async (token: string) => {
  try {
    const response = await fetch(`${url}/Kullanici/Hepsi`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Kullanıcılar getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKullaniciById = async (token: string, id: any) => {
  try {
    const response = await fetch(`${url}/Kullanici/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Kullanici getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKullaniciByDenetciId = async (
  token: string,
  denetciId: any
) => {
  try {
    const response = await fetch(`${url}/Kullanici/Hepsi/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Kullanicilar getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKullaniciByDenetlenenYilRol = async (
  token: string,
  denetlenenId: number,
  yil: number,
  tip: string
) => {
  try {
    const response = await fetch(
      `${url}/Kullanici/DenetlenenYilRol?denetlenenId=${denetlenenId}&yil=${yil}&tip=${tip}`,
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

export const createKullanici = async (token: string, createdKullanici: any) => {
  try {
    const response = await fetch(`${url}/Kullanici`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdKullanici),
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

export const updatekullanici = async (
  token: string,
  id: any,
  updatedKullanici: any
) => {
  try {
    const response = await fetch(`${url}/Kullanici/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedKullanici),
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

export const deleteKullaniciById = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Kullanici/${id}`, {
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

export const getDenetciOdemeBilgileri = async (
  token: string,
  denetciId: number
) => {
  try {
    const response = await fetch(`${url}/Denetci/OdemeBilgileri/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetci Ödeme Bilgileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
