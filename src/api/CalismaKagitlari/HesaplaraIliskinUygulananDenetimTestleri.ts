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
    console.log("Geldi" + controller + dipnotNo + modelAdi)
    const response = await apiFetch(
      `/${controller}/GetByDenetlenen?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(
        dipnotNo
      )}&modelAdi=${encodeURIComponent(modelAdi)}`,
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
      console.error("Hesap testleri verileri getirilemedi");
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
