import { apiFetch } from "@/api/apiBase";


export const getKullanicilar = async () => {
  try {
    const response = await apiFetch(`/Kullanici/Hepsi`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Kullanıcılar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKullaniciById = async (id: any) => {
  try {
    const response = await apiFetch(`/Kullanici/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Kullanici getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKullaniciByDenetciId = async (
  denetciId: any
) => {
  try {
    const response = await apiFetch(`/Kullanici/Hepsi/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Kullanicilar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKullaniciByDenetlenenYilRol = async (
  denetlenenId: number,
  yil: number,
  tip: string
) => {
  const normalizedTip = tip?.trim();
  if (!normalizedTip) {
    return [];
  }

  try {
    const response = await apiFetch(
      `/Kullanici/DenetlenenYilRol?denetlenenId=${denetlenenId}&yil=${yil}&tip=${encodeURIComponent(normalizedTip)}`,
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
      return [];
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return [];
  }
};

export const createKullanici = async (createdKullanici: any) => {
  try {
    const response = await apiFetch(`/Kullanici`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdKullanici),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return false;
  }
};

export const updateKullanici = async (
  id: any,
  updatedKullanici: any
) => {
  try {
    const response = await apiFetch(`/Kullanici/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedKullanici),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return false;
  }
};

export const updatekullaniciSifre = async (
  id: any,
  updatedPassdord: any
) => {
  try {
    const response = await apiFetch(`/Kullanici/Sifre/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPassdord),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return false;
  }
};

export const deleteKullaniciById = async (id: number) => {
  try {
    const response = await apiFetch(`/Kullanici/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
      },
    })
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return false;
  }
};
