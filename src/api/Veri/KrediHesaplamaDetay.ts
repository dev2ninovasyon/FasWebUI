import { url } from "@/api/apiBase";

export const getKrediHesaplamaDetayVerileriByDenetciDenetlenenYil = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  krediNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/KrediHesaplamaDetay?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&krediNo=${krediNo}`,
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
      console.error("Kredi Hesaplama verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createKrediHesaplamaDetayVerisi = async (
  token: string,
  jsonData: any
) => {
  try {
    const response = await fetch(`${url}/Veri/KrediHesaplamaDetay`, {
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

export const deleteKrediHesaplamaDetayVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  krediNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/KrediHesaplamaDetay?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&krediNo=${krediNo}`,
      {
        method: "DELETE",
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
