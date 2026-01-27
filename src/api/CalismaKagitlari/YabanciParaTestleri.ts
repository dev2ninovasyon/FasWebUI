import { apiFetch } from "@/api/apiBase";

export interface Denetlenen {
  id: number;
  unvan: string;
}

export type YabanciParaTestleriRow = {
  id: number;

  dipnotNo?: string | null;
  baslik?: string | null;

  hesapAdi: string;
  kebirKodu: string;
  detayKodu: string;

  mizanBakiye?: number | null;
  hesaplananBakiye?: number | null;

  degisimTl?: number | null; // Mizan Farkı

  onemlilik?: string | null;

  dovizBakiye?: number | null;
  kur?: number | null;

  dipnot?: string | null;
  paraBirimi?: string | null;

  denetlenen?: Denetlenen | null;

  modelAdi?: string | null;
};

const withAuth = (token: string) => ({
  accept: "application/json",
  Authorization: `Bearer ${token}`,
});


export const getYabanciParaTestleriByDenetlenen = async (
  controller: string,
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  dipnotNo: string,
  modelAdi: string
) => {
  const url =
    `/${controller}/GetByDenetlenen` +
    `?denetciId=${denetciId}` +
    `&yil=${yil}` +
    `&denetlenenId=${denetlenenId}` +
    `&dipnotNo=${encodeURIComponent(dipnotNo)}` +
    `&modelAdi=${encodeURIComponent(modelAdi)}`;

  const res = await apiFetch(url, {
    method: "GET",
    headers: withAuth(token),
  });

  if (res.status === 204) return [];

  if (!res.ok) {
    console.error("GetByDenetlenen başarısız:", res.status);
    return null;
  }

  return res.json();
};


export const updateYabanciParaTestleriRow = async (
  controller: string,
  token: string,
  id: number,
  payload: Partial<YabanciParaTestleriRow>
) => {
  // UI string geliyor; backend int/decimal bekliyorsa normalize et
  const normalizedPayload: any = {
    ...payload,
    onemlilik:
      payload.onemlilik === undefined || payload.onemlilik === null
        ? payload.onemlilik
        : Number(payload.onemlilik),
  };

  const res = await apiFetch(`/${controller}/${id}`, {
    method: "PUT",
    headers: {
      ...withAuth(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizedPayload),
  });

  if (!res.ok) {
    console.error("Update başarısız:", res.status);
    return null;
  }

  return res.json();
};

export const varsayilanaDon = async (
  controller: string,
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  dipnotNo: string
) => {
  const url =
    `/${controller}/VarsayilanaDon` +
    `?denetciId=${denetciId}` +
    `&yil=${yil}` +
    `&denetlenenId=${denetlenenId}` +
    `&dipnotNo=${encodeURIComponent(dipnotNo)}`;

  const res = await apiFetch(url, {
    method: "GET",
    headers: withAuth(token),
  });

  if (!res.ok) {
    console.error("Varsayılana dön başarısız:", res.status);
    return null;
  }

  return res.json();
};
