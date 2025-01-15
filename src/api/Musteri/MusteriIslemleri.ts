import { url } from "@/api/apiBase";

export const createDenetlenen = async (token: string, createdMusteri: any) => {
  try {
    const response = await fetch(`${url}/Denetlenen`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdMusteri),
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

export const getDenetlenenByDenetciId = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Denetci/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetlenenler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDenetlenenById = async (token: string, id: any) => {
  try {
    const response = await fetch(`${url}/Denetlenen/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetlenen getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateDenetlenen = async (
  token: string,
  id: any,
  updatedDenetlenen: any
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedDenetlenen),
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

export const deleteDenetlenenById = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Denetlenen/${id}`, {
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
