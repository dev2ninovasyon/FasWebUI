import { apiFetch } from "@/api/apiBase";

export const getYorum = async (
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
                },
            }
        );
        if (response.ok) {
            return response.json();
        } else {
            console.log("Yorum getirilemedi");
            return null;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return null;
    }
};

export const saveYorum = async (
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
            console.log("Yorum kaydedilemedi");
            return null;
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
        return null;
    }
};
