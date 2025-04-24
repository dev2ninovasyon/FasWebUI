import { url } from "@/api/apiBase";

export const createAmortismanHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  hesaplamaYontemi: string
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/AmortismanHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&hesaplamaYontemi=${hesaplamaYontemi}`,
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

export const getAmortismanHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/AmortismanHesaplanmis?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Amortisman Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createKrediHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KrediHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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

export const getKrediHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KrediHesaplanmis?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Kredi Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKrediHesaplanmisDetay = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KrediHesaplanmisDetay?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Kredi Detay Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKrediHesaplanmisOrnekFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KrediHesaplanmisOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Kredi Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createDavaKarsiliklariHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  iskontoOrani: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/DavaKarsiliklariHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&iskontoOrani=${iskontoOrani}`,
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

export const getDavaKarsiliklariHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/DavaKarsiliklariHesaplanmis?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Dava Karşılıkları Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createYaslandirmaHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/YaslandirmaHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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

export const getYaslandirmaHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/Yaslandirma?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Yaşlandırma Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createKidemTazminatiHesapla = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KidemHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Kıdem Tazminatı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createKidemTazminatiBobiEkBilgi = async (
  token: string,
  createdKidemTazminatiBobiEkBilgiVerisi: any
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KidemTazminatiBobiEkBilgi`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createdKidemTazminatiBobiEkBilgiVerisi),
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

export const getKidemTazminatiBobiEkBilgi = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KidemTazminatiBobiEkBilgi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Kıdem Tazminatı Bobi Ek verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createKidemTazminatiBobiHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KidemTazminati(Bobi)Hesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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

export const createCekSenetReeskontHesapla = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/CekSenetReeskontHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Çek Senet Reeskont Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createCekSenetReeskontEkBilgi = async (
  token: string,
  createdCekSenetReeskontEkBilgiVerisi: any
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/CekSenetReeskontEkBilgi`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createdCekSenetReeskontEkBilgiVerisi),
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

export const getCekSenetReeskontEkBilgi = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/CekSenetReeskontEkBilgi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Çek Senet Reeskont Ek verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getCekSenetReeskontIskontoOranlari = async (
  token: string,
  oranAdi: string,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/CekSenetReeskontIskontoOranlari?oranAdi=${oranAdi}&yil=${yil}`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status == 200) {
      return response.json();
    } else {
      console.error("Çek Senet Reeskont Iskonto Oranı verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getCekSenetReeskontHesaplama = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/CekSenetReeskontHesaplama?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Çek Senet Reeskont Hesaplama verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getCekSenetReeskontDuzeltmeFarklari = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/CekSenetReeskontDuzeltmeFarklari?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error(
        "Çek Senet Reeskont Düzeltme Farkları verileri getirilemedi"
      );
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getCekSenetReeskontHesaplamadaKullanilanDegerler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/CekSenetReeskontHesaplamadaKullanilanDegerler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error(
        "Çek Senet Reeskont Hesaplamada Kullanılan veriler getirilemedi"
      );
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createBeklenenKrediZarariHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  oran: number,
  beklenenBugunkiDegerOrani: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/BeklenenKrediZarariHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&oran=${oran}&beklenenBugunkiDegerOrani=${beklenenBugunkiDegerOrani}`,
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

export const getBeklenenKrediZarariHesaplanmis = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/BeklenenKrediZarari?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Beklenen Kredi Zararı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getIskontoOrani = async (token: string) => {
  try {
    const response = await fetch(`${url}/Hesaplamalar/IskontoOrani`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("İskonto Oranı getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createVergiVarligiVeYukumlulugu = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  vergiOrani: number,
  maliZararVeBenzeriIndirimler: number,
  vergiAvantajVeBenzerleri: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VergiVarligiVeYukumluluguHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&vergiOrani=${vergiOrani}&maliZararVeBenzeriIndirimler=${maliZararVeBenzeriIndirimler}&vergiAvantajVeBenzerleri=${vergiAvantajVeBenzerleri}`,
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

export const getVergiVarligiVeYukumluluguOzet = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VergiVarligiVeYukumluluguOzet?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error(
        "Ertelenmiş Vergi Hesabı Özet Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getVergiVarligi = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VergiVarligi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Vergi Varlığı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getVergiYukumlulugu = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VergiYukumlulugu?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Vergi Yükümlülüğü Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getVergiVarligiVeYukumluluguOrnekFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VergiVarligiVeYukumluluguOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Ertelenmiş Vergi Hesabı Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getIliskiliTarafSiniflamaHesaplar = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/IliskiliTarafSiniflamaHesaplar?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("İlişkili Taraf Sınıflama Hesap verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getIliskiliTarafSiniflama = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  hesap: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/IliskiliTarafSiniflama?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&hesap=${hesap}`,
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
      console.error("İlişkili Taraf Sınıflama verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getIliskiliTarafSiniflamaOrnekFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  json: any,
  kebirKodu: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/IliskiliTarafSiniflamaOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&kebirKodu=${kebirKodu}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(json),
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("İlişkili Taraf Sınıflama Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createVadeliBankaMevduatiOtomatikSiniflama = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VadeliBankaMevduatiOtomatikSiniflamaHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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

export const createVadeliBankaMevduatOtomatikSiniflama = async (
  token: string,
  createdVadeliBankaMevduat: any
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VadeliBankaMevduatOtomatikSiniflama`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createdVadeliBankaMevduat),
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

export const getVadeliBankaMevduatiOtomatikSiniflama = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VadeliBankaMevduatiOtomatikSiniflama?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Vadeli Banka Mevduatı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getVadeliBankaMevduatiOtomatikSiniflamaOrnekFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VadeliBankaMevduatiOtomatikSiniflamaOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Vadeli Banka Mevduatı Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteVadeliBankaMevduatiOtomatikSiniflamaById = async (
  token: string,
  id: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VadeliBankaMevduatiOtomatikSiniflama?id=${id}`,
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

export const getVadeliBankaMevduatiManuelSiniflama = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VadeliBankaMevduatiManuelSiniflama?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Vadeli Banka Mevduatı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getVadeliBankaMevduatiManuelSiniflamaOrnekFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  json: any
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VadeliBankaMevduatiManuelSiniflamaOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(json),
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Vadeli Banka Mevduatı Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createVadeliBankaMevduatiFaizTahakkuk = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  json: any
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VadeliBankaMevduatiFaizTahakkukHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(json),
      }
    );
    if (response.ok) {
      return true;
    } else {
      console.error("Vadeli Banka Mevduatı Faiz Tahakkuk getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getVadeliBankaMevduatiFaizTahakkuk = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/VadeliBankaMevduatiFaizTahakkuk?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error(
        "Vadeli Banka Mevduatı Faiz Tahakkuk Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createHareketsizTicariAlacaklar = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  acilisFisNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizTicariAlacaklarHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&acilisFisNo=${acilisFisNo}`,
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

export const createHareketsizTicariAlacak = async (
  token: string,
  createdHareketsizTicariAlacak: any
) => {
  try {
    const response = await fetch(`${url}/Hesaplamalar/HareketsizTicariAlacak`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdHareketsizTicariAlacak),
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

export const getHareketsizTicariAlacaklar = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizTicariAlacaklar?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error(
        "Hareketsiz Ticari Alacaklar Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getHareketsizTicariAlacaklarOzet = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizTicariAlacaklarOzet?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error(
        "Hareketsiz Ticari Alacaklar Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getHareketsizTicariAlacaklarOrnekFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizTicariAlacaklarOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Hareketsiz Ticari Alacaklar Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteHareketsizTicariAlacaklarById = async (
  token: string,
  id: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizTicariAlacaklar?id=${id}`,
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

export const createHareketsizStoklar = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  acilisFisNo: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizStoklarHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&acilisFisNo=${acilisFisNo}`,
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

export const createHareketsizStok = async (
  token: string,
  createdHareketsizStok: any
) => {
  try {
    const response = await fetch(`${url}/Hesaplamalar/HareketsizStok`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdHareketsizStok),
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

export const getHareketsizStoklar = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizStoklar?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Hareketsiz Stoklar Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getHareketsizStoklarOzet = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizStoklarOzet?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Hareketsiz Stoklar Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getHareketsizStoklarOrnekFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizStoklarOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Hareketsiz Stoklar Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteHareketsizStoklarById = async (
  token: string,
  id: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/HareketsizStoklar?id=${id}`,
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

export const getGecmisYilKarZararKontrol = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/GecmisYilKarZararKontrol?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error(
        "Geçmiş Yıl Kar Zarar Kontrol Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getGecmisYilKarZararKontrolOrnekFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/GecmisYilKarZararKontrolOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Geçmiş Yıl Kar Zarar Kontrol Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKurFarki = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KurFarki?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Kur Farkı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKurFarkiKontrolleriOzet = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  hesap: number,
  hesapNo: string,
  baslangicTarihi: string,
  bitisTarihi: string
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KurFarkiKontrolleriOzet?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&hesap=${hesap}&hesapNo=${hesapNo}&baslangicTarihi=${baslangicTarihi}&bitisTarihi=${bitisTarihi}`,
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
      console.error("Kur Farkı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKurFarkiKontrolleriFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  hesap: number,
  hesapNo: string,
  baslangicTarihi: string,
  bitisTarihi: string
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KurFarkiKontrolleriFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&hesap=${hesap}&hesapNo=${hesapNo}&baslangicTarihi=${baslangicTarihi}&bitisTarihi=${bitisTarihi}`,
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
      console.error("Kur Farkı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKurFarkiOrnekFisler = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Hesaplamalar/KurFarkiOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.error("Kur Farkı Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDovizKurlariOtuzBirAralik = async (token: string) => {
  try {
    const response = await fetch(`${url}/Evds/DovizKurlariOtuzBirAralik`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("31 Aralık verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
