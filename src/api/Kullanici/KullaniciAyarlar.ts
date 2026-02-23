import { apiFetch } from "@/api/apiBase";

export const getKullaniciAyarlar = async (kullaniciId: number) => {
    try {
        const response = await apiFetch(`/KullaniciAyarlar/${kullaniciId}`, {
            method: "GET",
            headers: {}
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.log("KullaniciAyarlar API - getKullaniciAyarlar Hata:", error);
        return null;
    }
};

export const updateKullaniciAyarlar = async (kullaniciId: number, data: any) => {
    try {
        const response = await apiFetch(`/KullaniciAyarlar/${kullaniciId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.log("KullaniciAyarlar API - updateKullaniciAyarlar Hata:", error);
        throw error;
    }
};

export const updateKurulumAyarlari = async (kullaniciId: number, tamamlandi: boolean, adim: number, progress?: string) => {
    try {
        const response = await apiFetch(`/KullaniciAyarlar/Kurulum/${kullaniciId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                kurulumTamamlandi: tamamlandi,
                kurulumAdimi: adim,
                progress: progress
            })
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.log("KullaniciAyarlar API - updateKurulumAyarlari Hata:", error);
        throw error;
    }
};

export const updateSonSecilenAyarlari = async (kullaniciId: number, denetlenenId: number, yil: number) => {
    try {
        const response = await apiFetch(`/KullaniciAyarlar/SonSecilen/${kullaniciId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                denetlenenId,
                yil
            }),
            ignoreCustomHeaders: true
        });
        if (response.ok) {
            return await response.json();
        } else {
            const errorText = await response.text();
            console.log("KullaniciAyarlar API - Update failed:", response.status, errorText);
            throw new Error(`Update failed: ${response.status}`);
        }
    } catch (error) {
        console.log("KullaniciAyarlar API - Hata:", error);
        throw error;
    }
};

export const updateTurTamamlandi = async (kullaniciId: number, tamamlandi: boolean) => {
    try {
        const response = await apiFetch(`/KullaniciAyarlar/TurTamamlandi/${kullaniciId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                turTamamlandi: tamamlandi
            })
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.log("KullaniciAyarlar API - updateTurTamamlandi Hata:", error);
        throw error;
    }
};
