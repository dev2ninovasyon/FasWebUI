import { apiFetch } from "@/api/apiBase";

export const getFisListesiVerileri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  _konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumEnflasyonFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    }

    console.log("Fiş İşlemleri verileri getirilemedi");
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getFisListesiVerileriByFisNo = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number,
  _konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumEnflasyonFisleriByFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    }

    console.log("Fiş Detayları verileri getirilemedi");
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createFisListesiVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number,
  _konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumEnflasyonFisleriNull?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateFisListesiVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  id: number,
  updatedFis: any,
  _konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumEnflasyonFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&id=${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFis),
      }
    );

    return response.ok;
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateFisDurumu = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number,
  _konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumEnflasyonFisDurumu?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteFisListesiVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  ids: number[],
  _konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumEnflasyonFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      }
    );

    return response.ok;
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
