import { url } from "@/api/apiBase";

export const getKrediHesaplamaVerileriByDenetciDenetlenenYil = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/KrediHesaplama?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Kredi Hesaplama verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createKrediHesaplamaVerisi = async (
  token: string,
  createdKrediHesaplama: any
) => {
  try {
    const response = await fetch(`${url}/Veri/KrediHesaplama`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdKrediHesaplama),
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

export const createMultipleKrediHesaplamaVerisi = async (
  token: string,
  jsonData: any
) => {
  try {
    const response = await fetch(`${url}/Veri/KrediHesaplamaMultiple`, {
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

export const createNullKrediHesaplamaVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/KrediHesaplamaNull?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
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

export const updateKrediHesaplamaVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number,
  updatedKrediHesaplama: any
) => {
  try {
    const response = await fetch(
      `${url}/Veri/KrediHesaplama?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedKrediHesaplama),
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

export const updateMultipleKrediHesaplamaVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: any
) => {
  try {
    const response = await fetch(
      `${url}/Veri/KrediHesaplamaMultiple?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
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

export const deleteKrediHesaplamaVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number[]
) => {
  try {
    const response = await fetch(
      `${url}/Veri/KrediHesaplama?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
