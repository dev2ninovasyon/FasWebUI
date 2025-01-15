import { url } from "@/api/apiBase";

export const getFisListesiVerileri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Donusum/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Fiş İşlemleri verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getFisListesiVerileriByFisNo = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  yevmiyeNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Donusum/DonusumFisleriByFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&yevmiyeNo=${yevmiyeNo}`,
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
      console.error("Fiş Detayları verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createFisListesiVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  yevmiyeNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Donusum/DonusumFisleriNull?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&yevmiyeNo=${yevmiyeNo}`,
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

export const updateFisListesiVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  id: number,
  updatedFis: any
) => {
  try {
    const response = await fetch(
      `${url}/Donusum/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&id=${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFis),
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

export const updateFisDurumu = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  yevmiyeNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Donusum/DonusumFisDurumu?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&yevmiyeNo=${yevmiyeNo}`,
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

export const deleteFisListesiVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  ids: number[]
) => {
  try {
    const response = await fetch(
      `${url}/Donusum/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ids),
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
