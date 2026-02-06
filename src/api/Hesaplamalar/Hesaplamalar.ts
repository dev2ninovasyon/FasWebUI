import { apiFetch } from "@/api/apiBase";


export const createAmortismanHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  hesaplamaYontemi: string
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/AmortismanHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&hesaplamaYontemi=${hesaplamaYontemi}`,
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

export const getAmortismanHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/AmortismanHesaplanmis?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Amortisman Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createKrediHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KrediHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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

export const getKrediHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KrediHesaplanmis?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Kredi Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKrediHesaplanmisDetay = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KrediHesaplanmisDetay?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Kredi Detay Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKrediHesaplanmisOrnekFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KrediHesaplanmisOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Kredi Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createDavaKarsiliklariHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  iskontoOrani: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/DavaKarsiliklariHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&iskontoOrani=${iskontoOrani}`,
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

export const getDavaKarsiliklariHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/DavaKarsiliklariHesaplanmis?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Dava Karşılıkları Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createYaslandirmaHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/YaslandirmaHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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

export const getYaslandirmaHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/Yaslandirma?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Yaşlandırma Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createKidemTazminatiBobiHesapla = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KidemHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Kıdem Tazminatı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createKidemTazminatiTfrsHesapla = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KidemHesaplaAktueryal?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Kıdem Tazminatı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createKidemTazminatiBobiEkBilgi = async (
  createdKidemTazminatiBobiEkBilgiVerisi: any
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KidemTazminatiBobiEkBilgi`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const getKidemTazminatiBobiEkBilgi = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KidemTazminatiBobiEkBilgi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.status == 200) {
      return response.json();
    } else {
      console.log("Kıdem Tazminatı Bobi Ek verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createKidemTazminatiTfrsEkBilgi = async (
  createdKidemTazminatiTfrsEkBilgiVerisi: any
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KidemTazminatiTfrsEkBilgi`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createdKidemTazminatiTfrsEkBilgiVerisi),
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

export const getKidemTazminatiTfrsEkBilgi = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KidemTazminatiTfrsEkBilgi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.status == 200) {
      return response.json();
    } else {
      console.log("Kıdem Tazminatı Tfrs Ek verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createCekSenetReeskontHesapla = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/CekSenetReeskontHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Çek Senet Reeskont Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createCekSenetReeskontEkBilgi = async (
  createdCekSenetReeskontEkBilgiVerisi: any
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/CekSenetReeskontEkBilgi`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const getCekSenetReeskontEkBilgi = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/CekSenetReeskontEkBilgi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.status == 200) {
      return response.json();
    } else {
      console.log("Çek Senet Reeskont Ek verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getCekSenetReeskontIskontoOranlari = async (
  oranAdi: string,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/CekSenetReeskontIskontoOranlari?oranAdi=${oranAdi}&yil=${yil}`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status == 200) {
      return response.json();
    } else {
      console.log("Çek Senet Reeskont Iskonto Oranı verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getCekSenetReeskontHesaplama = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/CekSenetReeskontHesaplama?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Çek Senet Reeskont Hesaplama verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getCekSenetReeskontDuzeltmeFarklari = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/CekSenetReeskontDuzeltmeFarklari?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log(
        "Çek Senet Reeskont Düzeltme Farkları verileri getirilemedi"
      );
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getCekSenetReeskontHesaplamadaKullanilanDegerler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/CekSenetReeskontHesaplamadaKullanilanDegerler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log(
        "Çek Senet Reeskont Hesaplamada Kullanılan veriler getirilemedi"
      );
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createBeklenenKrediZarariHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  oran: number,
  beklenenBugunkiDegerOrani: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/BeklenenKrediZarariHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&oran=${oran}&beklenenBugunkiDegerOrani=${beklenenBugunkiDegerOrani}`,
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

export const getBeklenenKrediZarariHesaplanmis = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/BeklenenKrediZarari?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Beklenen Kredi Zararı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getEnflasyonOrani = async (yil: number) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/EnflasyonOrani?yil=${yil}`,
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
      console.log("Enflasyon Oranı getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getFaizOrani = async (yil: number) => {
  try {
    const response = await apiFetch(`/Hesaplamalar/FaizOrani?yil=${yil}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Faiz Oranı getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getIskontoOrani = async (yil: number) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/IskontoOrani?yil=${yil}`,
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
      console.log("İskonto Oranı getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createVergiVarligiVeYukumlulugu = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  vergiOrani: number,
  maliZararVeBenzeriIndirimler: number,
  vergiAvantajVeBenzerleri: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VergiVarligiVeYukumluluguHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&vergiOrani=${vergiOrani}&maliZararVeBenzeriIndirimler=${maliZararVeBenzeriIndirimler}&vergiAvantajVeBenzerleri=${vergiAvantajVeBenzerleri}`,
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

export const getVergiVarligiVeYukumluluguOzet = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VergiVarligiVeYukumluluguOzet?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log(
        "Ertelenmiş Vergi Hesabı Özet Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getVergiVarligi = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VergiVarligi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log("Vergi Varlığı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getVergiYukumlulugu = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VergiYukumlulugu?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log("Vergi Yükümlülüğü Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getVergiVarligiVeYukumluluguOrnekFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VergiVarligiVeYukumluluguOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Ertelenmiş Vergi Hesabı Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getIliskiliTarafSiniflamaHesaplar = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/IliskiliTarafSiniflamaHesaplar?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("İlişkili Taraf Sınıflama Hesap verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getIliskiliTarafSiniflama = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  hesap: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/IliskiliTarafSiniflama?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&hesap=${hesap}&konsolide=${konsolide}`,
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
      console.log("İlişkili Taraf Sınıflama verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getIliskiliTarafSiniflamaOrnekFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  json: any,
  kebirKodu: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/IliskiliTarafSiniflamaOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&kebirKodu=${kebirKodu}&konsolide=${konsolide}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("İlişkili Taraf Sınıflama Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createVadeliBankaMevduatiOtomatikSiniflama = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VadeliBankaMevduatiOtomatikSiniflamaHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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

export const createVadeliBankaMevduatOtomatikSiniflama = async (
  createdVadeliBankaMevduat: any,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VadeliBankaMevduatOtomatikSiniflama?konsolide=${konsolide}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const getVadeliBankaMevduatiOtomatikSiniflama = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VadeliBankaMevduatiOtomatikSiniflama?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log("Vadeli Banka Mevduatı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getVadeliBankaMevduatiOtomatikSiniflamaOrnekFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VadeliBankaMevduatiOtomatikSiniflamaOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log("Vadeli Banka Mevduatı Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteVadeliBankaMevduatiOtomatikSiniflamaById = async (
  id: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VadeliBankaMevduatiOtomatikSiniflama?id=${id}&konsolide=${konsolide}`,
      {
        method: "DELETE",
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

export const getVadeliBankaMevduatiManuelSiniflama = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VadeliBankaMevduatiManuelSiniflama?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log("Vadeli Banka Mevduatı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getVadeliBankaMevduatiManuelSiniflamaOrnekFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  json: any,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VadeliBankaMevduatiManuelSiniflamaOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Vadeli Banka Mevduatı Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createVadeliBankaMevduatiFaizTahakkuk = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  json: any,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VadeliBankaMevduatiFaizTahakkukHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      }
    );
    if (response.ok) {
      return true;
    } else {
      console.log("Vadeli Banka Mevduatı Faiz Tahakkuk getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getVadeliBankaMevduatiFaizTahakkuk = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/VadeliBankaMevduatiFaizTahakkuk?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log(
        "Vadeli Banka Mevduatı Faiz Tahakkuk Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createHareketsizTicariAlacaklar = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  acilisFisNo: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizTicariAlacaklarHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&acilisFisNo=${acilisFisNo}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createHareketsizTicariAlacak = async (
  createdHareketsizTicariAlacak: any
) => {
  try {
    const response = await apiFetch(`/Hesaplamalar/HareketsizTicariAlacak`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdHareketsizTicariAlacak),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getHareketsizTicariAlacaklar = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizTicariAlacaklar?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log(
        "Hareketsiz Ticari Alacaklar Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getHareketsizTicariAlacaklarOzet = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizTicariAlacaklarOzet?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log(
        "Hareketsiz Ticari Alacaklar Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getHareketsizTicariAlacaklarOrnekFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizTicariAlacaklarOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log("Hareketsiz Ticari Alacaklar Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteHareketsizTicariAlacaklarById = async (
  id: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizTicariAlacaklar?id=${id}&konsolide=${konsolide}`,
      {
        method: "DELETE",
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

export const createHareketsizStoklar = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  acilisFisNo: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizStoklarHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&acilisFisNo=${acilisFisNo}&konsolide=${konsolide}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createHareketsizStok = async (
  createdHareketsizStok: any,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizStok?konsolide=${konsolide}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createdHareketsizStok),
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

export const getHareketsizStoklar = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizStoklar?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log("Hareketsiz Stoklar Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getHareketsizStoklarOzet = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizStoklarOzet?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log("Hareketsiz Stoklar Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getHareketsizStoklarOrnekFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizStoklarOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=${konsolide}`,
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
      console.log("Hareketsiz Stoklar Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteHareketsizStoklarById = async (
  id: number,
  konsolide: boolean = false
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/HareketsizStoklar?id=${id}&konsolide=${konsolide}`,
      {
        method: "DELETE",
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

export const getGecmisYilKarZararKontrol = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/GecmisYilKarZararKontrol?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log(
        "Geçmiş Yıl Kar Zarar Kontrol Tablosu verileri getirilemedi"
      );
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getGecmisYilKarZararKontrolOrnekFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/GecmisYilKarZararKontrolOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=true`,
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
      console.log("Geçmiş Yıl Kar Zarar Kontrol Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKurFarki = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KurFarki?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
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
      console.log("Kur Farkı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKurFarkiKontrolleriOzet = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  hesap: number,
  hesapNo: string,
  baslangicTarihi: string,
  bitisTarihi: string
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KurFarkiKontrolleriOzet?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&hesap=${hesap}&hesapNo=${hesapNo}&baslangicTarihi=${baslangicTarihi}&bitisTarihi=${bitisTarihi}&konsolide=true`,
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
      console.log("Kur Farkı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKurFarkiKontrolleriFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number,
  hesap: number,
  hesapNo: string,
  baslangicTarihi: string,
  bitisTarihi: string
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KurFarkiKontrolleriFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&hesap=${hesap}&hesapNo=${hesapNo}&baslangicTarihi=${baslangicTarihi}&bitisTarihi=${bitisTarihi}&konsolide=true`,
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
      console.log("Kur Farkı Tablosu verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKurFarkiOrnekFisler = async (
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Hesaplamalar/KurFarkiOrnekFisler?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&konsolide=true`,
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
      console.log("Kur Farkı Örnek Fişler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDovizKurlariOtuzBirAralik = async () => {
  try {
    const response = await apiFetch(`/Evds/DovizKurlariOtuzBirAralik`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("31 Aralık verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
