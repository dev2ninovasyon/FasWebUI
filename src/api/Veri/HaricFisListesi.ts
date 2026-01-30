import { apiFetch } from "@/api/apiBase";


export const getYevmiyeFisNo = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/EDefter/HaricYevmiyeNolar?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&araDonemMi=false&donem=1`,
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
      console.log("Yevmiye Fiş No getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getStandartYevmiyeFisNo = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/EDefter/StandartFisleriGetir?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&araDonemMi=false&donem=1`,
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
      console.log("Standart Yevmiye Fiş No getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getStandartYevmiyeFisNoHaric = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/EDefter/StandartFisleriGetirHaric?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&araDonemMi=false&donem=1`,
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
      console.log("Standart Yevmiye Fiş No getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getFisListesi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  hesapNo: string,
  yevmiyeFisNo: string,
  baslangicTarihi: string,
  bitisTarihi: string,
  page?: number,
  pageSize?: number,
  searchTerm?: string
) => {
  try {
    const response = await apiFetch(`/EDefter/HaricFisleriGoster`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        denetciId,
        yil,
        denetlenenId,
        aradonemMi: false,
        donem: 1,
        hesapNo,
        yevmiyeFisNo,
        baslangicTarihi,
        bitisTarihi,
        page: page ?? 0,
        pageSize: pageSize ?? 20,
        searchTerm,
      }),
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Yevmiye Fiş No getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getFisListesiHaric = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  hesapNo: string,
  yevmiyeFisNo: string,
  baslangicTarihi: string,
  bitisTarihi: string,
  page?: number,
  pageSize?: number,
  searchTerm?: string
) => {
  try {
    const response = await apiFetch(`/EDefter/HaricFisleriGosterHaric`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        denetciId,
        yil,
        denetlenenId,
        aradonemMi: false,
        donem: 1,
        hesapNo,
        yevmiyeFisNo,
        baslangicTarihi,
        bitisTarihi,
        page: page ?? 0,
        pageSize: pageSize ?? 20,
        searchTerm,
      }),
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Yevmiye Fiş No getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const saveHaricFisListesi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  haricFisListe: any
) => {
  try {
    const response = await apiFetch(
      `/EDefter/HaricFisKaydet?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "PUT",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(haricFisListe),
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Hariç Fiş Listesi kaydedilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const saveHaricFisListesiHaric = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  haricFisListe: any
) => {
  try {
    const response = await apiFetch(
      `/EDefter/HaricFisKaydetHaric?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "PUT",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(haricFisListe),
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Hariç Fiş Listesi kaydedilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getYevmiyeFisNoHaric = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/EDefter/HaricYevmiyeNolarHaric?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&araDonemMi=false&donem=1`,
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
      console.log("Yevmiye Fiş No getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
