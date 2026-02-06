import { apiFetch } from "@/api/apiBase";


export const getRaporDipnot = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  denetimTuru: string,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/RaporDipnot?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&tur=${denetimTuru}${konsolidasyonMu !== undefined ? `&konsolidasyonMu=${konsolidasyonMu}` : ""
      }`,
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
      console.log("Dipnot verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getFaaliyetRaporDipnot = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  denetimTuru: string
) => {
  try {
    const response = await apiFetch(
      `/Rapor/FaaliyetRaporDipnot?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&tur=${denetimTuru}`,
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
      console.log("Dipnot verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateRaporDipnot = async (
  updatedRaporDipnot: any
) => {
  try {
    const response = await apiFetch(`/Rapor/RaporDipnot`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRaporDipnot),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getRaporGorus = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  denetimTuru: string,
  tip: string,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/RaporGorus?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&tur=${denetimTuru}&tip=${tip}${konsolidasyonMu !== undefined ? `&konsolidasyonMu=${konsolidasyonMu}` : ""
      }`,
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
      console.log("Görüş verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateRaporGorus = async (
  updatedRaporGorus: any
) => {
  try {
    const response = await apiFetch(`/Rapor/RaporGorus`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRaporGorus),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteAllRaporDipnotVerileri = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  tip: string
) => {
  try {
    const response = await apiFetch(
      `/Rapor/RaporDipnot?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${tip}`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDipnot15Amortisman = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/Dipnot15Amortisman?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Dipnot 15 getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDipnot16Amortisman = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/Dipnot16Amortisman?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Dipnot 15 getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDipnot15Maliyet = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/Dipnot15Maliyet?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Dipnot 15 getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDipnot16Maliyet = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/Dipnot16Maliyet?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Dipnot 16 getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateDipnotMaliyet = async (
  updatedDipnotMaliyet: any
) => {
  try {
    const response = await apiFetch(`/Rapor/DipnotMaliyet`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDipnotMaliyet),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateDipnotAmortisman = async (
  updatedDipnotAmortisman: any
) => {
  try {
    const response = await apiFetch(`/Rapor/DipnotAmortisman`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDipnotAmortisman),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDipnot25 = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/Dipnot25?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Dipnot 25 getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDipnot34 = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/Dipnot34?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Dipnot 34 getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getKrediRiski = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/KrediRiski?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Kredi Riski getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateKrediRiski = async (
  updatedKrediRiski: any
) => {
  try {
    const response = await apiFetch(`/Rapor/KrediRiski`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedKrediRiski),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDovizKuruRiski = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/DovizKuruRiski?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Döviz Kuru Riski getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateDovizKuruRiski = async (
  updatedDovizKuruRiski: any
) => {
  try {
    const response = await apiFetch(`/Rapor/DovizKuruRiski`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDovizKuruRiski),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDovizKuruRiskiDuyarlilikAnalizi = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/DovizKuruRiskiDuyarlilikAnalizi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Döviz Kuru Riski Duyarlılık Analizi getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDipnotAnaHesaplar = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  tur: string,
  konsolidasyonMu?: boolean
) => {
  try {
    const response = await apiFetch(
      `/Rapor/TumDipnotHesaplariniGetirRapor?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tur=${tur}`,
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
      console.log("Dipnot Ana Hesaplar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};
