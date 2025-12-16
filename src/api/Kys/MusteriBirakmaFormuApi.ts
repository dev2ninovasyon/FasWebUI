import { apiFetch } from "@/api/apiBase";

const controller = "MusteriBirakmaFormu";

export const getMusteriBirakmaFormu = async (
    token: string,
    denetlenenId: number,
    yil: number
) => {
    try {
        const response = await apiFetch(
            `/${controller}?denetlenenId=${denetlenenId}&yil=${yil}`,
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
        console.error("MusteriBirakmaFormu getirme hatası:", error);
        throw error;
    }
};

export const createMusteriBirakmaFormu = async (
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
        console.error("MusteriBirakmaFormu oluşturma hatası:", error);
        throw error;
    }
};

export const updateMusteriBirakmaFormu = async (
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
        return true;
    } catch (error) {
        console.error("MusteriBirakmaFormu güncelleme hatası:", error);
        throw error;
    }
};

export const deleteMusteriBirakmaFormu = async (
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
        return true;
    } catch (error) {
        console.error("MusteriBirakmaFormu silme hatası:", error);
        throw error;
    }
};
