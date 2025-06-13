import { url } from "@/api/apiBase";

export const getFisIslemSayilari = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/FisIslemSayilari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Fiş İşlem Sayıları getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createOrneklem = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  guvenilirlikDuzeyi: number,
  hataPayi: number,
  listelemeTuru: string
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/OrneklemHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&guvenilirlikDuzeyi=${guvenilirlikDuzeyi}&hataPayi=${hataPayi}&listelemeTuru=${listelemeTuru}`,
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

export const getOrneklem = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/Orneklem?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Örneklem getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateOrneklem = async (token: string, json: any) => {
  try {
    const response = await fetch(`${url}/DenetimKanitlari/Orneklem`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(json),
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

export const getOrneklemFisleri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  kebirKodu: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/OrneklemFisleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kebirKodu=${kebirKodu}`,
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
      console.error("Örneklem Fişleri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getOrneklemFisleriDetay = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/OrneklemFisleriDetay?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}`,
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
      console.error("Örneklem Fişleri Detay getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getOnemlilikSeviyesi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/OnemlilikSeviyesi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Önemlilik Seviyesi getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createOnemlilik = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/Onemlilik?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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

export const getOnemlilik = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/Onemlilik?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Önemlilik getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateOnemlilik = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  id: number,
  updatedOnemlilik: any
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/Onemlilik?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&id=${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedOnemlilik),
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

export const createOnemlilikHesaplamaBazi = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  json: any
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/OnemlilikHesaplamaBazi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(json),
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

export const getOnemlilikHesaplamaBazi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/OnemlilikHesaplamaBazi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status == 200) {
      return response.json();
    } else {
      console.error("Önemlilik Hesaplama Bazı getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateOnemlilikHesaplamaBazi = async (
  token: string,
  json: any
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/OnemlilikHesaplamaBazi`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(json),
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

export const getMutabakat = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  grupKodu: string,
  hesapAdi: string
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/Mutabakat?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&grupKodu=${grupKodu}&hesapAdi=${hesapAdi}`,
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
      console.error("Mutabakat getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateMutabakat = async (token: string, json: any) => {
  try {
    const response = await fetch(`${url}/DenetimKanitlari/Mutabakat`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(json),
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

export const deleteMutabakat = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/Mutabakat?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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

export const getMutabakatDogrulamaMektubu = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  detayKodu: string
) => {
  try {
    const response = await fetch(
      `${url}/DenetimKanitlari/MutabakatDogrulamaMektubu?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&detayKodu=${detayKodu}`,
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
      console.error("Mutabakat Dogrulama Mektubu getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
