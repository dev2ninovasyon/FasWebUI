import { apiFetch } from "@/api/apiBase";

export interface SupheliAlacakTestleriData {
    id: number;
    dipnotNo: string;
    baslik: string;
    hesapNo: string;
    hesapAdi: string;
    oncekiDonemBakiye: number;
    cariDonemBakiye: number;
    degisimTl: number;
    avukatMektubu: string;
}

export async function getSupheliAlacakTestleri(
    token: string,
    denetciId: number,
    yil: number,
    denetlenenId: number,
    dipnotNo: string
) {
    const response = await apiFetch(
        `/SupheliAlacakTestleri/GetByDenetlenen?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(dipnotNo)}`,
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

export async function updateSupheliAlacakTestleri(
    token: string,
    id: number,
    data: Partial<SupheliAlacakTestleriData>
) {
    const response = await apiFetch(`/SupheliAlacakTestleri/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    return response.ok;
}

export async function addSupheliAlacakTestleri(
    token: string,
    data: Partial<SupheliAlacakTestleriData>
) {
    const response = await apiFetch(`/SupheliAlacakTestleri`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    return response.ok;
}

export async function deleteSupheliAlacakTestleri(token: string, id: number) {
    const response = await apiFetch(`/SupheliAlacakTestleri/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.ok;
}

export async function varsayilanaDonSupheliAlacakTestleri(
    token: string,
    denetciId: number,
    yil: number,
    denetlenenId: number,
    dipnotNo: string
) {
    const response = await apiFetch(
        `/SupheliAlacakTestleri/VarsayilanaDon?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${encodeURIComponent(dipnotNo)}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.ok;
}
