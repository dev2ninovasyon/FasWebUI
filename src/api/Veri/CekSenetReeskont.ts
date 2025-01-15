import { url } from "@/api/apiBase";

export const getCekSenetReeskontVerileriByDenetciDenetlenenYil = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/CekSenetReeskont?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Çek Senet Reeskont verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createCekSenetReeskontVerisi = async (
  token: string,
  createdCekSenetReeskont: any
) => {
  try {
    const response = await fetch(`${url}/Veri/CekSenetReeskont`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdCekSenetReeskont),
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

export const createMultipleCekSenetReeskontVerisi = async (
  token: string,
  jsonData: any
) => {
  try {
    const response = await fetch(`${url}/Veri/CekSenetReeskontMultiple`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
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

export const createNullCekSenetReeskontVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/CekSenetReeskontNull?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateCekSenetReeskontVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number,
  updatedCekSenetReeskont: any
) => {
  try {
    const response = await fetch(
      `${url}/Veri/CekSenetReeskont?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedCekSenetReeskont),
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateMultipleCekSenetReeskontVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: any
) => {
  try {
    const response = await fetch(
      `${url}/Veri/CekSenetReeskontMultiple?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteCekSenetReeskontVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number[]
) => {
  try {
    const response = await fetch(
      `${url}/Veri/CekSenetReeskont?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siraNo),
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
