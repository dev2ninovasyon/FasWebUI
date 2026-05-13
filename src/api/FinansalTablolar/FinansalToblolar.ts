import { apiFetch } from "@/api/apiBase";


export const getFinansalDurumTablosu = async (
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

export const exportFinansalDurumTablosuEnflasyonKgkExcel = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/FinansalDurumTablosuEnflasyonKgkExcelAtma?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
      }
    );
    if (response.ok) {
      return response.blob();
    } else {
      console.log("KGK Excel verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const exportFinansalDurumTablosuKgkExcel = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolidasyonMu: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/FinansalDurumTablosuKgkExcelAtma?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
      { method: "GET" }
    );
    if (response.ok) return response.blob();
    else console.log("KGK Excel verileri getirilemedi");
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const exportKarZararTablosuKgkExcel = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolidasyonMu: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/KarZararTablosuKgkExcelAtma?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
      { method: "GET" }
    );
    if (response.ok) return response.blob();
    else console.log("KGK KarZarar Excel verileri getirilemedi");
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const exportNakitAkisTablosuKgkExcel = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolidasyonMu: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/NakitAkisTablosuKgkExcelAtma?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
      { method: "GET" }
    );
    if (response.ok) return response.blob();
    else console.log("KGK NakitAkis Excel verileri getirilemedi");
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const exportOzkaynakTablosuKgkExcel = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolidasyonMu: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/FinansalTablolar/OzkaynakTablosuKgkExcelAtma?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konsolidasyonMu=${konsolidasyonMu}`,
      { method: "GET" }
    );
    if (response.ok) return response.blob();
    else console.log("KGK Özkaynak Excel verileri getirilemedi");
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
