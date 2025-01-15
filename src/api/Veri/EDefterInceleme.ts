import { url } from "@/api/apiBase";

export const getEDefterIncelemeVerileri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  hesapNo: string,
  baslangicTarihi: string,
  bitisTarihi: string
) => {
  try {
    const response = await fetch(
      `${url}/Veri/EDefterInceleme?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&hesapNo=${hesapNo}&baslangicTarihi=${baslangicTarihi}&bitisTarihi=${bitisTarihi}`,
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
      console.error("E-Defter İnceleme verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateEDefterIncelemeVerisi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  id: number,
  updatedEDefterInceleme: any
) => {
  try {
    const response = await fetch(
      `${url}/Veri/EDefterInceleme?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&id=${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedEDefterInceleme),
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

export const getEDefterIncelemeVerileriByFisNo = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Veri/EDefterIncelemeByFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}`,
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
