import { apiFetch } from "@/api/apiBase";


export const getBenfordHesapKodlari = async (
  token: string,
  yil: number,
  denetlenenId: number
): Promise<number[] | undefined> => {
  try {
    const res =await apiFetch(
      `/Benford/HesapKodlari?yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) return;
    const data = await res.json();
    // BaseApiController wrapper'ınız SuccessDataResult döndürüyorsa:
    // return data?.data ?? data;
    return data?.data ?? data;
  } catch (e) {
    console.error(e);
  }
};

export const getBenfordDagilim = async (
  token: string,
  yil: number,
  denetlenenId: number,
  kebirKodu?: number
) => {
  const search = new URLSearchParams({
    yil: String(yil),
    denetlenenId: String(denetlenenId),
  });
  if (kebirKodu) search.append("kebirKodu", String(kebirKodu));

  try {
    const res =await apiFetch(`/Benford/Dagilim?${search.toString()}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return;
    const data = await res.json();
    return data?.data ?? data;
  } catch (e) {
    console.error(e);
  }
};
