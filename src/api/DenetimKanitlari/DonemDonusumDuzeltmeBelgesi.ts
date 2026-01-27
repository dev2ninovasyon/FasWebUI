 import { apiFetch } from "@/api/apiBase";


export const getDonemDonusumDuzeltmeBelgesiVerisi
 = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response =await apiFetch(
      `/Donusum/DonusumFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
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

export const getDonemDonusumDuzeltmeBelgesiVerisiByFisNo = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number,
  konsolidasyonMu: boolean
) => {
  try {
    const response =await apiFetch(
      `/Donusum/DonusumFisleriByFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}&konsolidasyonMu=${konsolidasyonMu}`,
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

