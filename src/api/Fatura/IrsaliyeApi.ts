import axios, { AxiosProgressEvent } from "axios";
import { apiFetch, url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";

export type IrsaliyeTipi = "Alınan" | "Gönderilen";

export interface IrsaliyeKalemiDto {
  id: string;
  aciklama: string;
  miktar: number;
  birimKodu: string;
  birimFiyat: number;
  satirToplamTutar: number;
  satirNo?: string | null;
  sellerItemCode?: string | null;
  buyerItemCode?: string | null;
  gtip?: string | null;
  lotNo?: string | null;
  seriNo?: string | null;
  paketBilgisi?: string | null;
  urunKodu?: string | null;
  ureticiKodu?: string | null;
  menseUlke?: string | null;
  eksikMiktar?: number | null;
  fazlaMiktar?: number | null;
  siparisSatirNo?: string | null;
}

export interface IrsaliyeTarafDto {
  ad: string;
  vergiNo: string;
  adres?: string | null;
  vergiDairesi?: string | null;
  telefon?: string | null;
  ePosta?: string | null;
  webSitesi?: string | null;
  ulke?: string | null;
  il?: string | null;
  ilce?: string | null;
  postaKodu?: string | null;
}

export interface IrsaliyeVerisiDto {
  id: string;
  irsaliyeNumarasi: string;
  irsaliyeTarihi: string;
  paraBirimi: string;
  tedarikci?: IrsaliyeTarafDto | null;
  alici?: IrsaliyeTarafDto | null;
  gondericiVkn?: string | null;
  aliciVkn?: string | null;
  toplamMiktar: number;
  kalemler: IrsaliyeKalemiDto[];
}

export interface IrsaliyeXmlDosyasiDto {
  id: string;
  dosyaAdi: string;
  durum: string;
  durumMesaji?: string | null;
  xmlIcerigi?: string | null;
  embeddedDocument?: string | null;
  embeddedDocumentFileName?: string | null;
  embeddedMimeType?: string | null;
  irsaliyeYuklemePaketiId?: string | null;
  yuklemeTarihi: string;
  irsaliyeVerisi?: IrsaliyeVerisiDto | null;
}

export interface IrsaliyeYuklemeIslemiDto {
  id: string;
  islemAdi: string;
  tip: string;
  islemTarihi: string;
  klasorYolu?: string | null;
  dosyaSayisi: number;
  basariliDosyaSayisi: number;
  hataliDosyaSayisi?: number | null;
  dosyalar: IrsaliyeXmlDosyasiDto[];
}

export interface UploadIrsaliyeResponse {
  success: boolean;
  message: string;
  islemId?: string;
  dosyaSayisi?: number;
  basariliDosyaSayisi?: number;
  hataliDosyaSayisi?: number;
  dosyalar?: IrsaliyeXmlDosyasiDto[];
}

export interface IrsaliyeKarsilastirmaItem {
  irsaliyeId: string;
  irsaliyeNumarasi: string;
  irsaliyeTarihi: string;
  tedarikciAd: string;
  tedarikciVkn: string;
  toplamKalem: number;
  eslesenKalem: number;
  eslesmeyenKalem: number;
  kalemler: IrsaliyeKarsilastirmaKalem[];
}

export interface IrsaliyeKarsilastirmaKalem {
  irsaliyeKalemiId: string;
  aciklama: string;
  miktar: number;
  birimKodu: string;
  eslesenFaturaKalemiId?: string | null;
  eslesenFaturaNo?: string | null;
  durum: string;
}

export const uploadIrsaliyeDosyalari = async (
  user: any,
  files: File[],
  tip: string,
  islemAdi: string,
  onUploadProgress?: (e: AxiosProgressEvent) => void
) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  form.append("islemAdi", islemAdi);
  form.append("tip", tip);
  form.append("denetciId", String(user.denetciId));
  form.append("denetlenenId", String(user.denetlenenId));
  form.append("yil", String(user.yil));

  return axios.post(
    `${url}/Irsaliye/UploadIrsaliyeDosyalari`,
    form,
    createAuthorizedAxiosConfig(
      { headers: { "Content-Type": "multipart/form-data" }, onUploadProgress },
      user?.token
    )
  );
};

export const getIrsaliyeYuklemeIslemleri = async (user: any): Promise<IrsaliyeYuklemeIslemiDto[]> => {
  const cacheBust = Date.now();
  const r = await apiFetch(
    `/Irsaliye/GetIrsaliyeYuklemeIslemleri?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&_=${cacheBust}`,
    { cache: "no-store", headers: { accept: "application/json", "Cache-Control": "no-cache", Pragma: "no-cache" } }
  );
  if (!r.ok) throw new Error("İrsaliye yükleme işlemleri alınamadı");
  return r.json();
};

export const getIrsaliyeDetay = async (user: any, dosyaId: string): Promise<IrsaliyeXmlDosyasiDto> => {
  const r = await apiFetch(
    `/Irsaliye/GetIrsaliyeXmlDosyasiDetay?dosyaId=${dosyaId}&denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}`,
    { headers: { accept: "application/json" } }
  );
  if (!r.ok) throw new Error("İrsaliye detayı alınamadı");
  return r.json();
};

export const deleteIrsaliyeIslemleri = async (user: any, ids: string[]) => {
  const r = await apiFetch(`/Irsaliye/DeleteIrsaliyeIslemleri`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
  });
  if (!r.ok) throw new Error("Silinemedi");
  return true;
};

export const previewIrsaliyeDosyasi = async (user: any, dosyaId: string): Promise<Blob> => {
  const r = await apiFetch(`/Irsaliye/PreviewHtml/${dosyaId}`, { method: "GET" });
  if (!r.ok) throw new Error("Önizleme alınamadı");
  return r.blob();
};

export const downloadIrsaliyeDosyasi = async (
  user: any,
  dosyaId: string,
  format: string = "xml"
): Promise<Blob> => {
  const r = await apiFetch(
    `/Irsaliye/DownloadIrsaliyeDosyasi?dosyaId=${dosyaId}&format=${format}&denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}`
  );
  if (!r.ok) throw new Error("Dosya indirilemedi");
  return r.blob();
};

export const getIrsaliyeKarsilastirma = async (
  user: any,
  page: number = 1,
  pageSize: number = 100
): Promise<{ items: IrsaliyeKarsilastirmaItem[]; totalCount: number }> => {
  const r = await apiFetch(
    `/Irsaliye/GetIrsaliyeKarsilastirma?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&page=${page}&pageSize=${pageSize}`,
    { headers: { accept: "application/json" } }
  );
  if (!r.ok) throw new Error("Karşılaştırma verileri alınamadı");
  const data = await r.json();
  return {
    items: data.items ?? data.Items ?? data ?? [],
    totalCount: Number(data.totalCount ?? data.TotalCount ?? 0),
  };
};
