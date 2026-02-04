import { apiFetch } from "@/api/apiBase";


export const getFinansalDurumTablosu = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolidasyonMu: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/FinansalDurumTablosu?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
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
      console.log("Finansal Durum Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKarZararTablosu = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolidasyonMu: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/KarZararTablosu?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
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
      console.log("Kar Zarar Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getNakitAkisTablosu = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolidasyonMu: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/NakitAkisTablosu?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
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
      console.log("Nakit Akış Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getOzkaynakTablosu = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolidasyonMu: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/OzkaynakTablosu?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`,
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
      console.log("Özkaynak Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const FinansalTabloOlustur = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  nakitAkisType: string,
  konsolidasyonMu: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/FinansalTablolariOlustur?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&nakitAkisYontemi=${nakitAkisType}&konsolidasyonMu=${konsolidasyonMu}`,
      {
        method: "Post",
        headers: {
          accept: "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};
