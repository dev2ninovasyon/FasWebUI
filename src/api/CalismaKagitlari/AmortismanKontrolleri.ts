import { apiFetch } from "@/api/apiBase";

export interface AmortismanKontrolleriResponseDto {
    donusumMizanBobi: any[];
    amortismanKontrolKayitlari: any[];
    amortismanHesaplamaKayitlari: any[];
    dipnotYorum: string;
}

export interface AmortismanKontrolSatirKaydetDto {
    id: number;
    hesapKodu: string;
    tahminiAmortismanGideri: number;
    denetlenenId: number;
    yil: number;
}

export async function fetchAmortismanKontrolleri(token: string, denetlenenId: number, yil: number, dn: string) {
    try {
        const response = await apiFetch(
            `/AmortismanKontrolleri/get-amortisman-kontrolleri?denetlenenId=${denetlenenId}&yil=${yil}&dn=${encodeURIComponent(dn)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            try {
                const errorData = await response.json();
                console.error("API Error Body:", errorData);
                return errorData;
            } catch {
                console.error("API Error:", response.statusText);
                return { success: false, message: "Veri çekilemedi." };
            }
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        return { success: false, message: "Bir hata oluştu." };
    }
}

export async function saveAmortismanKontrolSatir(token: string, dto: AmortismanKontrolSatirKaydetDto) {
    try {
        const response = await apiFetch(
            `/AmortismanKontrolleri/save-satir`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dto),
            }
        );
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error("API Error:", response.statusText);
            return { success: false, message: "Kaydedilemedi." };
        }
    } catch (error) {
        console.error("Save Error:", error);
        return { success: false, message: "Bir hata oluştu." };
    }
}
