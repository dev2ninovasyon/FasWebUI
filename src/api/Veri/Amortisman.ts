import { url } from "@/api/apiBase";

export const getAmortismanVerileriByDenetciDenetlenenYil = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/Amortisman?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Amortisman verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createAmortismanVerisi = async (
  token: string,
  createdAmortisman: any
) => {
  try {
    const response = await fetch(`${url}/Veri/Amortisman`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdAmortisman),
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

export const createMultipleAmortismanVerisi = async (
  token: string,
  jsonData: any
) => {
  try {
    const response = await fetch(`${url}/Veri/AmortismanMultiple`, {
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

export const createNullAmortismanVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/AmortismanNull?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
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

export const updateAmortismanVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number,
  updatedAmortisman: any
) => {
  try {
    const response = await fetch(
      `${url}/Veri/Amortisman?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedAmortisman),
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

export const updateMultipleAmortismanVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: any
) => {
  try {
    const response = await fetch(
      `${url}/Veri/AmortismanMultiple?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
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

export const deleteAmortismanVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number[]
) => {
  try {
    const response = await fetch(
      `${url}/Veri/Amortisman?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
