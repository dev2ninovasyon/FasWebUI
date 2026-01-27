import { apiFetch } from "@/api/apiBase";

export interface MdStokNetGerceklesebilirDeger {
    id: number;
    denetlenenId: number;
    yil: number;
    detayKodu: string;
    hesapAdi: string;
    maliyetDegeri: number;
    gercegeUygunDeger: number;
    tamamlamaMaliyeti: number;
    satisGiderleri: number;
    netGerceklesebilirDeger: number;
    degerDusukluguTutar: number;
}

export interface StoklarNetGerceklesebilirDegerResponseDto {
    stokVerileri: MdStokNetGerceklesebilirDeger[];
}

export const getStoklarNetGerceklesebilirDeger = async (
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/StoklarNetGerceklesebilirDeger/GetStoklarNetGerceklesebilirDeger?denetlenenId=${denetlenenId}&yil=${yil}`,
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
            console.error("Stoklar Net Gerçekleşebilir Değer verileri alınırken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.error("Stoklar Net Gerçekleşebilir Değer verileri alınırken hata oluştu:", error);
        throw error;
    }
};

export const stoklarNetGerceklesebilirDegerOlustur = async (
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/StoklarNetGerceklesebilirDeger/StoklarNetGerceklesebilirDegerOlustur?denetlenenId=${denetlenenId}&yil=${yil}`,
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                },
            }
        );

        if (response.ok) {
            return response.json();
        } else {
            console.error("Stoklar Net Gerçekleşebilir Değer oluşturulurken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.error("Stoklar Net Gerçekleşebilir Değer oluşturulurken hata oluştu:", error);
        throw error;
    }
};

export const stokNetGerceklesebilirDegerUpdate = async (dto: any) => {
    try {
        const response = await apiFetch(
            `/StoklarNetGerceklesebilirDeger/StokNetGerceklesebilirDegerUpdate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify(dto),
            }
        );

        if (response.ok) {
            return response.json();
        } else {
            console.error("Stok Net Gerçekleşebilir Değer güncellenirken hata oluştu:", response.status);
            throw new Error(`API Error: ${response.status}`);
        }
    } catch (error) {
        console.error("Stok Net Gerçekleşebilir Değer güncellenirken hata oluştu:", error);
        throw error;
    }
};
