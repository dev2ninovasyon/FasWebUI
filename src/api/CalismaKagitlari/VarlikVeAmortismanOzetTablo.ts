import { apiFetch } from "@/api/apiBase";

export interface VarlikVeAmortismanOzetTabloData {
    id: number;
    detayHesapKodu: string;
    hesapAdi: string;
    amortismanBaslangicTarihi: string;
    girisTutari: number;
    yenidenDegerlemeArtisi: number;
    iptalEdilecekYenidenDegerlemeTutari: number;
    kalintiDeger: number;
    amortismanBitisTarihi: string;
    bobiTfrsAmortismanOrani: number;
    vukCariYilAmortisman: number;
    bobiTfrsCariYilAmortisman: number;
    cariYilAmortismanFarki: number;
    vukDonemSonuBirikmisAmortisman: number;
    bobiTfrsDonemSonuBirikmisAmortisman: number;
    bobiTfrsVukBirikmisAmortismanFarki: number;
}

export async function fetchVarlikVeAmortismanOzetTablo(token: string, denetlenenId: number, yil: number, dn: string) {
    try {
        const response = await apiFetch(
            `/VarlikveAmortismanOzetTablo/get-ozet-tablo?denetlenenId=${denetlenenId}&yil=${yil}&dn=${encodeURIComponent(dn)}`,
            {
                method: "GET",
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log("API Response:", data);
            return data;
        } else {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);
            return { success: false, message: `Sunucu hatası: ${response.status}`, data: [] };
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return { success: false, message: "Bağlantı hatası oluştu.", data: [] };
    }
}
