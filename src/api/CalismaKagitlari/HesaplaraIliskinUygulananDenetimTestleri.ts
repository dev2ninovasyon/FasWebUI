// src/api/CalismaKagitlari/HesaplaraIliskinUygulananDenetimTestleri.ts

import { apiFetch } from "@/api/apiBase";
export type HesapTestRow = {
  id: number;

  dipnotNo?: string | null;
  baslik?: string | null;

  hesapAdi: string;
  kebirKodu: string;
  detayKodu: string;

  oncekiDonemBakiye?: number | null;
  cariDonemBakiye?: number | null;
  degisimTl?: number | null;
  degisimYuzde?: number | null;

  onemlilik: string;
  dipnot: string;
  paraBirimi: string;

  modelAdi?: string;
};

/**
 * GET: /{controller}?denetciId=...&yil=...&denetlenenId=...&dipnotNo=...&modelAdi=...
 */
export const getHesapTestleriByDenetlenen = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnotNo: string,
  modelAdi: string
) => {
  try {
    const url = `/${controller}/GetByDenetlenen?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(
      dipnotNo
    )}&modelAdi=${encodeURIComponent(modelAdi)}`;
    console.log(token)
    console.log("=== API CALL DEBUG ===");
    console.log("URL:", url);
    console.log("Params:", { denetciId, yil, denetlenenId, dipnotNo, modelAdi });

    const response = await apiFetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response OK:", response.ok);

    // 204 No Content durumunu handle et
    if (response.status === 204) {
      console.warn("Backend 204 No Content döndü - veri bulunamadı");
      return [];
    }

    if (response.ok) {
      const text = await response.text();
      console.log("Response Text:", text);

      // Boş response kontrolü
      if (!text || text.trim() === "") {
        console.warn("Backend boş response döndü");
        return [];
      }

      const data = JSON.parse(text);
      console.log("Parsed Data:", data);

      // Backend'den gelen verinin yapısını kontrol et (Array mi, { data: ... } mı?)
      const rawList = Array.isArray(data) ? data : (data?.data || []);

      // PascalCase -> camelCase mapping
      const mappedList = rawList.map((item: any) => ({
        id: item.id ?? item.Id,
        dipnotNo: item.dipnotNo ?? item.DipnotNo,
        baslik: item.baslik ?? item.Baslik,
        hesapAdi: item.hesapAdi ?? item.HesapAdi,
        kebirKodu: item.kebirKodu ?? item.KebirKodu,
        detayKodu: item.detayKodu ?? item.DetayKodu,
        oncekiDonemBakiye: item.oncekiDonemBakiye ?? item.OncekiDonemBakiye,
        cariDonemBakiye: item.cariDonemBakiye ?? item.CariDonemBakiye,
        degisimTl: item.degisimTl ?? item.DegisimTl,
        degisimYuzde: item.degisimYuzde ?? item.DegisimYuzde,
        onemlilik: item.onemlilik ?? item.Onemlilik,
        dipnot: item.dipnot ?? item.Dipnot,
        paraBirimi: item.paraBirimi ?? item.ParaBirimi,
        modelAdi: item.modelAdi ?? item.ModelAdi,
      }));

      console.log("Mapped List:", mappedList);
      return mappedList;
    } else {
      console.error("Hesap testleri verileri getirilemedi, Status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

/**
 * PUT: /{controller}/{id}
 */
export const updateHesapTestRow = async (
  controller: string,
  token: string,
  id: number,
  payload: Partial<HesapTestRow>
) => {
  try {
    const response = await apiFetch(`/${controller}/${id}`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return response.json(); // BaseApiController result dönüyorsa
    } else {
      console.error("Hesap testi güncellenemedi");
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

/**
 * DELETE: /{controller}/VarsayilanaDon?denetciId=...&yil=...&denetlenenId=...&dipnotNo=...
 * (Backend'de route fix'li haliyle)
 */
export const varsayilanaDon = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnotNo: string
) => {
  try {
    const response = await apiFetch(
      `/${controller}/VarsayilanaDon?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(
        dipnotNo
      )}`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      console.error("Varsayılana dönme işlemi başarısız");
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};
