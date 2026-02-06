import { apiFetch } from "@/api/apiBase";


export const getFisListesiVerileri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
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
      console.log("Fiş İşlemleri verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getFisListesiVerileriByFisNo = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumFisleriByFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}&konsolidasyonMu=${konsolidasyonMu}`,
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
      console.log("Fiş Detayları verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createFisListesiVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumFisleriNull?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
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
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&id=${id}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const updateFisDurumu = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumFisDurumu?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteFisListesiVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  ids: number[],
  konsolidasyonMu: boolean
) => {
  try {
    const response = await apiFetch(
      `/Donusum/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};
