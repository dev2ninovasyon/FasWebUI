import { url } from "@/api/apiBase";

export const getYevmiyeFisNo = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/EDefter/HaricYevmiyeNolar?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&araDonemMi=false&donem=1`,
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
      console.error("Yevmiye Fiş No getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getStandartYevmiyeFisNo = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/EDefter/StandartFisleriGetir?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&araDonemMi=false&donem=1`,
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
      console.error("Standart Yevmiye Fiş No getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
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
  bitisTarihi: string
) => {
  try {
    const response = await fetch(`${url}/EDefter/HaricFisleriGoster`, {
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
      }),
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Yevmiye Fiş No getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
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
    const response = await fetch(
      `${url}/EDefter/HaricFisKaydet?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Hariç Fiş Listesi kaydedilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
