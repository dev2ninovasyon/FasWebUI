import { url } from "@/api/apiBase";

export const getRaporDipnot = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  denetimTuru: string
) => {
  try {
    const response = await fetch(
      `${url}/Rapor/RaporDipnot?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&tur=${denetimTuru}`,
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
      console.error("Dipnot verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getFaaliyetRaporDipnot = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  denetimTuru: string
) => {
  try {
    const response = await fetch(
      `${url}/Rapor/FaaliyetRaporDipnot?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&tur=${denetimTuru}`,
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
      console.error("Dipnot verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateRaporDipnot = async (
  token: string,
  updatedRaporDipnot: any
) => {
  try {
    const response = await fetch(`${url}/Rapor/RaporDipnot`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedRaporDipnot),
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

export const getRaporGorus = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  denetimTuru: string,
  tip: string
) => {
  try {
    const response = await fetch(
      `${url}/Rapor/RaporGorus?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&tur=${denetimTuru}&tip=${tip}`,
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
      console.error("Görüş verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateRaporGorus = async (
  token: string,
  updatedRaporGorus: any
) => {
  try {
    const response = await fetch(`${url}/Rapor/RaporGorus`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedRaporGorus),
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

export const deleteAllRaporDipnotVerileri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  tip: string
) => {
  try {
    const response = await fetch(
      `${url}/Rapor/RaporDipnot?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${tip}`,
      {
        method: "DELETE",
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
    console.error("Bir hata oluştu:", error);
  }
};

export const getDipnot25 = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Rapor/Dipnot25?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Dipnot 25 getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDipnot34 = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Rapor/Dipnot34?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Dipnot 34 getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDipnotAnaHesaplar = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  tur: string
) => {
  try {
    const response = await fetch(
      `${url}/Rapor/TumDipnotHesaplariniGetirRapor?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tur=${tur}`,
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
      console.error("Dipnot Ana Hesaplar getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
