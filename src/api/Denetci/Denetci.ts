import { apiFetch } from "@/api/apiBase";


export const getDenetciById = async (id: any) => {
  try {
    const response = await apiFetch(`/Denetci/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Denetci getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateDenetci = async (
  id: any,
  updatedDenetci: any
) => {
  try {
    const response = await apiFetch(`/Denetci/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDenetci),
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

export const getDenetciOdemeBilgileri = async (
  denetciId: any
) => {
  try {
    const response = await apiFetch(`/Denetci/OdemeBilgileri/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Denetci Ödeme Bilgileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDenetciKotaGecmisi = async (denetciId: any) => {
  try {
    const response = await apiFetch(`/Denetci/KotaGecmisi/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Denetci Kota Geçmişi getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getLogo = async (denetciId: any) => {
  try {
    const response = await apiFetch(`/Denetci/Logo/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const createLogo = async (
  denetciId: number,
  formData: FormData
) => {
  try {
    const response = await apiFetch(`/Denetci/Logo/${denetciId}`, {
      method: "POST",
      headers: {
        // Authorization removed
      },
      body: formData,
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
