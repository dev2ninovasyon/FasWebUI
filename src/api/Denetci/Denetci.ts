import { url } from "@/api/apiBase";

export const getDenetciById = async (token: string, id: any) => {
  try {
    const response = await fetch(`${url}/Denetci/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetci getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateDenetci = async (
  token: string,
  id: any,
  updatedDenetci: any
) => {
  try {
    const response = await fetch(`${url}/Denetci/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedDenetci),
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
  denetciId: any
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

export const getDenetciKotaGecmisi = async (token: string, denetciId: any) => {
  try {
    const response = await fetch(`${url}/Denetci/KotaGecmisi/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetci Kota Geçmişi getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getLogo = async (token: string, denetciId: any) => {
  try {
    const response = await fetch(`${url}/Denetci/Logo/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
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

export const createLogo = async (
  token: string,
  denetciId: number,
  formData: FormData
) => {
  try {
    const response = await fetch(`${url}/Denetci/Logo/${denetciId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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
