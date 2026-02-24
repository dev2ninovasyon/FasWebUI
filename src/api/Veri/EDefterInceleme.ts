import { apiFetch } from "@/api/apiBase";

const normalizeToKebirCodes = (value?: string): string => {
  if (!value) return "";

  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => {
      const digits = item.replace(/[^\d]/g, "");
      return digits.length >= 3 ? digits.slice(0, 3) : item;
    })
    .join(",");
};
export const getEDefterIncelemeVerileri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  detayKodu: string,
  baslangicTarihi: string,
  bitisTarihi: string
) => {
  try {
    const params = new URLSearchParams();
    params.set("denetciId", String(denetciId));
    params.set("yil", String(yil));
    params.set("denetlenenId", String(denetlenenId));
    params.set("hesapNo", detayKodu);
    params.set("detayKodu", detayKodu); // Backend varyant uyumluluğu
    params.set("baslangicTarihi", baslangicTarihi);
    params.set("bitisTarihi", bitisTarihi);

    const response = await apiFetch(
      `/Veri/EDefterInceleme?${params.toString()}`,
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
      console.log("E-Defter İnceleme verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getEDefterIncelemeVerileriPaged = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  detayKodu: string,
  baslangicTarihi: string,
  bitisTarihi: string,
  hesaplar?: string,
  iliskiliHesaplar?: string,
  yevmiyeNolar?: string,
  haricYevmiyeNo?: string,
  borcTutarindanFazla?: number,
  alacakTutarindanFazla?: number,
  aciklama?: string,
  pageNumber: number = 1,
  pageSize: number = 50
) => {
  try {
    const params = new URLSearchParams();
    params.set("denetciId", String(denetciId));
    params.set("yil", String(yil));
    params.set("denetlenenId", String(denetlenenId));
    params.set("hesapNo", detayKodu);
    params.set("detayKodu", detayKodu); // Backend varyant uyumluluğu
    params.set("baslangicTarihi", baslangicTarihi);
    params.set("bitisTarihi", bitisTarihi);

    if (hesaplar && hesaplar.trim() !== "") {
      params.set("hesaplar", hesaplar);
    }

    if (iliskiliHesaplar && iliskiliHesaplar.trim() !== "") {
      // Bazı endpointlerde farklı isimlendirme olabiliyor
      const iliskiliKebirKodlar = normalizeToKebirCodes(iliskiliHesaplar);
      params.set("iliskilihesaplar", iliskiliKebirKodlar);
      params.set("iliskiliHesaplar", iliskiliKebirKodlar);
    }

    if (yevmiyeNolar && yevmiyeNolar.trim() !== "") {
      params.set("yevmiyeNolar", yevmiyeNolar);
    }

    if (haricYevmiyeNo && haricYevmiyeNo.trim() !== "") {
      params.set("haricYevmiyeNo", haricYevmiyeNo);
    }

    if (borcTutarindanFazla !== undefined && borcTutarindanFazla !== null) {
      params.set("borcTutarindanFazla", String(borcTutarindanFazla));
    }

    if (alacakTutarindanFazla !== undefined && alacakTutarindanFazla !== null) {
      params.set("alacakTutarindanFazla", String(alacakTutarindanFazla));
    }

    if (aciklama && aciklama.trim() !== "") {
      params.set("aciklama", aciklama);
    }

    params.set("pageNumber", String(pageNumber));
    params.set("pageSize", String(pageSize));

    const response = await apiFetch(
      `/Veri/EDefterIncelemePaged?${params.toString()}`,
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
      console.log("E-Defter İnceleme paginated verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateEDefterIncelemeVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  id: string,
  updatedEDefterInceleme: any
) => {
  try {
    const response = await apiFetch(
      `/Veri/EDefterInceleme?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&id=${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const updateEDefterIncelemeListeVerisi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  ids: string[],
  updatedEDefterInceleme: any
) => {
  try {
    const response = await apiFetch(
      `/Veri/EDefterIncelemeListe?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&ids=${ids}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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
    console.log("Bir hata oluştu:", error);
  }
};

export const getEDefterIncelemeVerileriByFisNo = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  fisNo: number
) => {
  try {
    const response = await apiFetch(
      `/Veri/EDefterIncelemeByFisNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&fisNo=${fisNo}`,
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
      console.log("Fiş Detayları verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

