import { apiFetch } from "@/api/apiBase";


export const createKarsilastirmaliAnaliz = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/KarsilastirmaliAnalizOlustur?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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

export const getKarsilastirmaliAnaliz = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/KarsilastirmaliAnalizTablosu?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Karşılaştırmalı Analiz Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createDikeyAnaliz = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/DikeyAnalizOlustur?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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

export const getDikeyAnaliz = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/DikeyAnalizTablosu?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Dikey Analiz Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
export const getDikeyAnalizFinansalDurum = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/DikeyAnalizTablosuFinansalDurum?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Finansal Durum verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
export const getDikeyAnalizTablosuKarZarar = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/DikeyAnalizTablosuKarZarar?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Kar-Zarar verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
