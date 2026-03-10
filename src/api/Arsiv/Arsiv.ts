import { apiFetch } from "@/api/apiBase";


export const getArsivTumu = async (
  denetciId: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/ArsivIslemleri/GetirTumu?denetciId=${denetciId}&denetlenenId=${denetlenenId}`,
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
      console.log("Arşiv getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getArsiv = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/ArsivIslemleri/Getir?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Arşiv getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteArsiv = async (path: string) => {
  try {
    const response = await apiFetch(`/ArsivIslemleri/Sil?path=${path}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
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

export const deleteAllArsiv = async (paths: string[]) => {
  try {
    const response = await apiFetch(`/ArsivIslemleri/SilToplu?`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paths),
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
