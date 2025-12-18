import { apiFetch } from "@/api/apiBase";

const controller = "KysBelgeLerUcSutunlu";

export const getKysBelgeler = async (
    token: string,
    formKodu: string,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/${controller}/GetByFormKodu?formKodu=${formKodu}&denetlenenId=${denetlenenId}&yil=${yil}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("KysBelgeler getirme hatası:", error);
        throw error;
    }
};

export const createKysBelge = async (
    token: string,
    data: any
) => {
    try {
        const response = await apiFetch(`/${controller}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("KysBelge oluşturma hatası:", error);
        throw error;
    }
};

export const updateKysBelge = async (
    token: string,
    id: number,
    data: any
) => {
    try {
        const response = await apiFetch(`/${controller}/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("KysBelge güncelleme hatası:", error);
        throw error;
    }
};

export const deleteKysBelge = async (
    token: string,
    id: number
) => {
    try {
        const response = await apiFetch(`/${controller}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("KysBelge silme hatası:", error);
        throw error;
    }
};
