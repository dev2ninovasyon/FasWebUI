import { apiFetch } from "@/api/apiBase";

export const getYorum = async (
    token: string,
    denetlenenId: number,
    yil: number,
    belgeAdi: string
) => {
    try {
        const response = await apiFetch(
            `/MaddiDogrulamaProsedurleriYorum?denetlenenId=${denetlenenId}&yil=${yil}&belgeAdi=${belgeAdi}`,
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
            console.error("Yorum getirilemedi");
            return null;
        }
    } catch (error) {
        console.error("Bir hata oluştu:", error);
        return null;
    }
};

export const saveYorum = async (
    token: string,
    denetlenenId: number,
    yil: number,
    belgeAdi: string,
    icerik: string
) => {
    try {
        const response = await apiFetch(`/MaddiDogrulamaProsedurleriYorum`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                denetlenenId,
                yil,
                belgeAdi,
                icerik,
            }),
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error("Yorum kaydedilemedi");
            return null;
        }
    } catch (error) {
        console.error("Bir hata oluştu:", error);
        return null;
    }
};
