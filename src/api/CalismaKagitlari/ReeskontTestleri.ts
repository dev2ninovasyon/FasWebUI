import { apiFetch } from "@/api/apiBase";

export interface ReeskontTestleriData {
    dipnotNo: string;
    cariYil: number;
    oncekiYil: number;
    dipnotAdi: string;
    hesaplamaKayitlari: any[];
    farklarKayitlari: any[];
    degerlerKayitlari: any[];
    donusumMizanBobi: any[];
    vukMizanKayitlari: any[];
    cekSenetReeskontKayitlari: any[];
    reeskontFaizLiborOranlari: any;
    referansTablosuListesi: any[];
}

const withAuth = (token: string) => ({
    accept: "application/json",
    Authorization: `Bearer ${token}`,
});

export async function getReeskontTestleri(
    controller: string,
    token: string,
    denetciId: number,
    yil: number,
    denetlenenId: number,
    dipnotNo: string,
    modelAdi: string
) {

    const response = await apiFetch(
        `/${controller}/GetReeskontTestleri?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(dipnotNo)}&modelAdi=${encodeURIComponent(modelAdi)}`,
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
        console.error("Veriler getirilemedi");
        return null;
    }
}
