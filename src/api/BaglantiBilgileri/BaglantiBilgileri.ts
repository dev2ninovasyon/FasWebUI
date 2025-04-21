import { url } from "@/api/apiBase";

export const getBaglantiBilgileri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/BaglantiBilgileri/BaglantiBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}`,
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
      console.error("Bağlantı Bilgileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getBaglantiBilgileriByTip = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  tip: string
) => {
  try {
    const response = await fetch(
      `${url}/BaglantiBilgileri/BaglantiBilgileriByTip?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}&tip=${tip}`,
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
      console.error("Bağlantı Bilgileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getBaglantiBilgileriByLink = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  link: string
) => {
  try {
    const response = await fetch(
      `${url}/BaglantiBilgileri/BaglantiBilgileriByLink?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}&link=${link}`,
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
      console.error("Bağlantı Bilgileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createBaglantiBilgileri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  tip: string
) => {
  try {
    const response = await fetch(
      `${url}/BaglantiBilgileri/BaglantiBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}&tip=${tip}`,
      {
        method: "POST",
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

export const deleteBaglantiBilgileri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/BaglantiBilgileri/BaglantiBilgileri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}`,
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

export const deleteBaglantiBilgileriById = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number,
  id: number
) => {
  try {
    const response = await fetch(
      `${url}/BaglantiBilgileri/BaglantiBilgileriById?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}&id=${id}`,
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
