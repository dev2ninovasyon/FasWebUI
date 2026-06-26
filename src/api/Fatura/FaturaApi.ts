import axios, { AxiosProgressEvent } from "axios";

import { apiFetch, url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";
import SecureTokenManager from "@/utils/SecureTokenManager";

export type Taraf = {
  id: string;
  ad?: string | null;
  vergiNo?: string | null;
  adres?: string | null;
  tip?: string | null;
};

export type Vergi = {
  id: string;
  vergiMatrahi: number;
  vergiTutari: number;
  oran: number;
  vergiTuru?: string | null;
  vergiKodu?: string | null;
  faturaId?: string | null;
};

export type FaturaDetay = {
  id: string;
  dosyaAdi?: string | null;
  durum?: string | null;
  durumMesaji?: string | null;
  embeddedMimeType?: string | null;
  embeddedDocumentFileName?: string | null;
  faturaId: string;
};

export type FaturaSatiri = {
  id: string;
  aciklama?: string | null;
  miktar: number;
  birimKodu?: string | null;
  birimFiyat: number;
  satirToplamTutar: number;
  faturaId: string;
  vergiId?: string | null;
  vergi?: Vergi | null;
};

export type Fatura = {
  id: string;
  faturaNumarasi?: string | null;
  faturaTarihi: string; // ISO
  paraBirimi?: string | null;
  odenecekTutar: number;

  tedarikciId?: string | null;
  tedarikci?: Taraf | null;

  aliciId?: string | null;
  alici?: Taraf | null;

  faturaDosyaId?: string | null;
  faturaDetay?: FaturaDetay | null;

  yuklemeIslemiId?: string | null;

  faturaSatirlari?: FaturaSatiri[];
  vergiler?: Vergi[];
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type FaturaListItem = {
  id: string;
  faturaNumarasi?: string | null;
  faturaTarihi: string;
  tedarikciAd?: string | null;
  aliciAd?: string | null;
  tedarikciVkn?: string | null;
  aliciVkn?: string | null;
  paraBirimi?: string | null;
  odenecekTutar: number;
};

// TAM grafik dönen endpoint
export async function fetchPagedFaturalarFull(
  denetciId: number,
  yil: number,
  denetlenenId: number,
  page: number,
  pageSize: number,
  tip: string, // "Alınan" | "Satis" vb.
  filters: Record<string, string[]> = {}
): Promise<PagedResult<Fatura>> {
  const apiurl =
    `/Invoices/FilteredPagedFull` +
    `?denetciId=${denetciId}&yil=${yil}` +
    `&denetlenenId=${denetlenenId}&page=${page}&pageSize=${pageSize}` +
    `&tip=${encodeURIComponent(tip)}`;

  const res = await apiFetch(apiurl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  return res.json();
}

export async function fetchPagedFaturalarLite(
  denetciId: number,
  yil: number,
  denetlenenId: number,
  page: number,
  pageSize: number,
  tip: string,
  filters: Record<string, string[]> = {}
): Promise<PagedResult<FaturaListItem>> {
  const apiurl =
    `/Invoices/FilteredPagedLite` +
    `?denetciId=${denetciId}&yil=${yil}` +
    `&denetlenenId=${denetlenenId}&page=${page}&pageSize=${pageSize}` +
    `&tip=${encodeURIComponent(tip)}`;

  const res = await apiFetch(apiurl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  return res.json();
}

export async function fetchFaturaDetail(
  denetciId: number,
  yil: number,
  denetlenenId: number,
  id: string
): Promise<Fatura> {
  const res = await apiFetch(
    `/Invoices/Detail/${id}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
    { headers: { accept: "application/json" } }
  );
  if (!res.ok) {
    throw new Error("Fatura detayı alınamadı");
  }
  return res.json();
}
export const uploadFaturaDosyalari = async (
  user: any,
  files: File[],
  tip: string,
  islemAdi: string,
  onUploadProgress?: (e: AxiosProgressEvent) => void
) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  const qs = `denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&tip=${encodeURIComponent(
    tip
  )}&islemAdi=${encodeURIComponent(islemAdi)}`;

  return axios.post(
    `${url}/Invoices/Upload?${qs}`,
    form,
    createAuthorizedAxiosConfig(
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      },
      user?.token
    )
  );
};

export const getYuklemeIslemleri = async (user: any) => {
  const cacheBust = Date.now();
  const r = await apiFetch(
    `/Invoices/GetYuklemeIslemleri?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&_=${cacheBust}`,
    {
      cache: "no-store",
      headers: {
        accept: "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    }
  );
  if (!r.ok) throw new Error("Yükleme işlemleri alınamadı");
  const json = await r.json();
  return Array.isArray(json) ? json : (json?.data ?? json?.Data ?? []);
};

export const getYuklemeDosyalari = async (user: any, yuklemeId: string) => {
  const r = await apiFetch(
    `/Invoices/GetYuklemeDosyalari?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&yuklemeId=${yuklemeId}`,
    { headers: { accept: "application/json" } }
  );
  if (!r.ok) throw new Error("Dosyalar alınamadı");
  return r.json();
};

export const previewFaturaHtmlNewTab = async (
  user: any,
  dosyaId: string
): Promise<Blob> => {
  const res = await apiFetch(`/Invoices/PreviewHtml/${dosyaId}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Sunucudan beklenen içerik tipi dönmedi");
  }

  return res.blob();
};


export const deleteYuklemeIslemleri = async (user: any, ids: string[]) => {
  const r = await apiFetch(`/Invoices/DeleteYuklemeIslemleri`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids)
  });
  if (!r.ok) throw new Error("Silinemedi");
  return true;
};

export type InvoiceYevmiyeRow = {
  invoiceId: string;
  invoiceDate?: string | null;
  invoiceNo?: string | null;
  amount: number;
  kdv: number;
  yevmiyeId?: string | null;
  yevmiyeDate?: string | null;
  yevmiyeNo?: number | null;
  matched: boolean;
  tip?: string;
};

export async function findInvoiceYevmiyeRowsByVkn(user: any, tip: string, vkn: string): Promise<InvoiceYevmiyeRow[]> {
  const qs = `denetciId=${user.denetciId}&denetlenenId=${user.denetlenenId}&yil=${user.yil}&tip=${encodeURIComponent(tip)}&vkn=${encodeURIComponent(vkn)}`;
  const r = await apiFetch(`/Invoices/FindInvoiceYevmiyeRowsByVkn?${qs}`, {
    headers: { accept: "application/json" }
  });
  if (!r.ok) throw new Error("Satırlar alınamadı");
  return r.json();
}

// opsiyonel: persist
export async function saveInvoiceYevmiyeMatches(user: any, rows: InvoiceYevmiyeRow[]) {
  const qs = `denetciId=${user.denetciId}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`;
  const r = await apiFetch(`/Invoices/SaveInvoiceYevmiyeMatches?${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows)
  });
  if (!r.ok) throw new Error("Eşleştirmeler kaydedilemedi");
  return true;
}
export type SentInvoiceMatchRow = {
  matchId: string;
  invoiceId: string;
  invoiceNo?: string | null;
  invoiceDate?: string | null;
  amount: number;
  kdv: number;
  yevmiyeId?: string | null;
  yevmiyeNo?: number | null;
  yevmiyeDate?: string | null;
  counterpartyVkn?: string | null;
  counterpartyName?: string | null;
}

export async function getSentInvoiceMatches(user: any): Promise<SentInvoiceMatchRow[]> {
  const qs = `denetciId=${user.denetciId}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`;
  const r = await apiFetch(`/Invoices/GetSentInvoiceMatches?${qs}`, {
    headers: { accept: "application/json" }
  });
  if (!r.ok) throw new Error("Eşleşmeler alınamadı");
  return r.json();
}
export type ReceivedInvoiceMatchRow = {
  matchId: string;
  invoiceNo?: string | null;
  invoiceDate?: string | null;
  counterpartyName?: string | null; // Tedarikçi
  counterpartyVkn?: string | null;  // Tedarikçi VKN
  amount?: number | null;
  kdv?: number | null;
  yevmiyeNo?: number | string | null;
  yevmiyeDate?: string | null;
};

export async function getReceivedInvoiceMatches(user: any): Promise<ReceivedInvoiceMatchRow[]> {
  const qs = `denetciId=${user.denetciId}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`;
  const r = await apiFetch(`/Invoices/GetReceivedInvoiceMatches?${qs}`, {
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Alınan eşleşmeleri alınamadı");
  return r.json();
}

export type FaturaYuklemeGecmisiDto = {
  uploadSessionId: string;
  islemAdi: string;
  tip: string;
  baslamaTarihi: string;
  dosyaSayisi: number;
  basariliDosyaSayisi: number;
  hataliDosyaSayisi: number;
  mukerrerDosyaSayisi: number;
  batchSayisi: number;
  durum: string;
  durumMesaji?: string;
};

export async function getGroupedYuklemeGecmisi(user: any): Promise<FaturaYuklemeGecmisiDto[]> {
  const cacheBust = Date.now();
  const r = await apiFetch(
    `/Invoices/GetGroupedYuklemeGecmisi?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&_=${cacheBust}`,
    { cache: "no-store", headers: { accept: "application/json", "Cache-Control": "no-cache", Pragma: "no-cache" } }
  );
  if (!r.ok) throw new Error("Gruplanmış yükleme geçmişi alınamadı");
  return r.json();
}

export type FaturaBatchDetayDto = {
  id: string;
  batchNo: number;
  toplamBatch: number;
  islemAdi: string;
  dosyaSayisi: number;
  basariliDosyaSayisi: number;
  hataliDosyaSayisi: number;
  durum: string;
  durumMesaji?: string;
  baslamaTarihi: string;
  bitisTarihi?: string;
};

export async function getBatchDetaylari(user: any, uploadSessionId: string): Promise<FaturaBatchDetayDto[]> {
  const r = await apiFetch(
    `/Invoices/GetBatchDetaylari?uploadSessionId=${encodeURIComponent(uploadSessionId)}&denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}`,
    { cache: "no-store", headers: { accept: "application/json" } }
  );
  if (!r.ok) throw new Error("Batch detayları alınamadı");
  return r.json();
}

export type UploadFaturaKayitDto = {
  id: string;
  xmlDosyaId: string;
  faturaNo?: string | null;
  ettn?: string | null;
  faturaTarihi?: string | null;
  saticiVkn?: string | null;
  saticiUnvan?: string | null;
  aliciVkn?: string | null;
  aliciUnvan?: string | null;
  invoiceTypeCode?: string | null;
  profileID?: string | null;
  matrah?: number | null;
  kdvTutari?: number | null;
  tevkifatKodu?: string | null;
  tevkifatTutari?: number | null;
  durum: string;
  hataMesaji?: string | null;
  dosyaAdi?: string | null;
  paketId: string;
  uploadSessionId: string;
};

export type UploadFaturaPagedResult = {
  items: UploadFaturaKayitDto[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export async function getUploadSessionFaturalar(
  user: any,
  uploadSessionId: string,
  page: number = 1,
  pageSize: number = 50,
  search?: string,
  durum?: string,
  invoiceTypeCode?: string
): Promise<UploadFaturaPagedResult> {
  const params = new URLSearchParams({
    uploadSessionId,
    denetciId: String(user.denetciId),
    yil: String(user.yil),
    denetlenenId: String(user.denetlenenId),
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set("search", search);
  if (durum) params.set("durum", durum);
  if (invoiceTypeCode) params.set("invoiceTypeCode", invoiceTypeCode);

  const r = await apiFetch(`/Invoices/GetUploadSessionFaturalar?${params}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Oturum faturaları alınamadı");
  return r.json();
}

export type EDefterEslesmeKaydi = {
  id: string;
  yevmiyeTarih?: string | null;
  yevmiyeNo?: number | null;
  kebirKodu?: number | null;
  hesapAdi?: string | null;
  aciklama?: string | null;
  borc: number;
  alacak: number;
  belgeTuru?: string | null;
  faturaNo?: string | null;
  faturaTarihi?: string | null;
  paraBirimi?: string | null;
  orjinalTutar?: number | null;
  orjinalParaBirimi?: string | null;
  orjinalDovizKuru?: number | null;
};

export type FaturaEdefterEslesmeItem = {
  faturaId: string;
  faturaDosyaId?: string | null;
  faturaNumarasi: string;
  faturaTarihi?: string | null;
  tarafAdi?: string | null;
  tarafVergiNo?: string | null;
  faturaTutari: number;
  paraBirimi?: string | null;
  defterBorcToplami: number;
  defterAlacakToplami: number;
  kontrolTutari: number;
  fark: number;
  durum: string;
  aciklama: string;
  defterKayitlari: EDefterEslesmeKaydi[];
};

export type FaturaEdefterEslesmeSummary = {
  faturaSayisi: number;
  defterKaydiSayisi: number;
  eslesenKayitSayisi: number;
  tutarUyumluSayisi: number;
  tutarFarkliSayisi: number;
  defterdeOlmayanFaturaSayisi: number;
  faturadaOlmayanDefterKaydiSayisi: number;
  mukerrerFaturaNoSayisi: number;
  mukerrerFaturaKaydiSayisi: number;
  toplamTutarFarki: number;
};

export type MukerrerFaturaNoGrubu = {
  faturaNumarasi: string;
  normalizeFaturaNumarasi: string;
  tekrarSayisi: number;
  toplamTutar: number;
  paraBirimi?: string | null;
  tarafAdlari?: string[];
  faturalar?: FaturaEdefterEslesmeItem[];
};

export type FaturaEdefterEslesmeAnalizi = {
  month: number;
  tip: string;
  durum: string;
  page: number;
  pageSize: number;
  totalCount: number;
  tolerance: number;
  summary: FaturaEdefterEslesmeSummary;
  items: FaturaEdefterEslesmeItem[];
  mukerrerFaturaGruplari: MukerrerFaturaNoGrubu[];
};

export async function getEdefterEslesmeAnalizi(
  user: any,
  month: number,
  tip: string = "Alınan",
  durum: string = "all",
  page: number = 1,
  pageSize: number = 100,
  tolerance: number = 1
): Promise<FaturaEdefterEslesmeAnalizi> {
  const qs = `denetciId=${user.denetciId}&denetlenenId=${user.denetlenenId}&yil=${user.yil}&month=${month}&tip=${encodeURIComponent(tip)}&durum=${encodeURIComponent(durum)}&page=${page}&pageSize=${pageSize}&tolerance=${tolerance}`;
  const r = await apiFetch(`/Invoices/EdefterEslesmeAnalizi?${qs}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("E-Defter eşleşme analizi alınamadı");
  return r.json();
}

