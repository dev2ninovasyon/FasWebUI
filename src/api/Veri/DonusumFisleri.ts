import { url } from "@/api/apiBase";

export const getDonusumFisleriVerileriByDenetciDenetlenenYil = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Dönüşüm Fişleri verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createDonusumFisleriVerisi = async (
  token: string,
  createdDonusumFisleri: any
) => {
  try {
    const response = await fetch(`${url}/Veri/DonusumFisleri`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdDonusumFisleri),
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

export const createMultipleDonusumFisleriVerisi = async (
  token: string,
  jsonData: any
) => {
  try {
    const response = await fetch(`${url}/Veri/DonusumFisleriMultiple`, {
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

export const createNullDonusumFisleriVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/DonusumFisleriNull?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
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

export const updateDonusumFisleriVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number,
  updatedDonusumFisleri: any
) => {
  try {
    const response = await fetch(
      `${url}/Veri/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedDonusumFisleri),
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

export const updateMultipleDonusumFisleriVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: any
) => {
  try {
    const response = await fetch(
      `${url}/Veri/DonusumFisleriMultiple?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&siraNo=${siraNo}`,
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

export const deleteDonusumFisleriVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  siraNo: number[]
) => {
  try {
    const response = await fetch(
      `${url}/Veri/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
