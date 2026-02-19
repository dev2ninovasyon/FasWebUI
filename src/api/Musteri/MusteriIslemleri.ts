import { apiFetch } from "@/api/apiBase";


export const createDenetlenen = async (createdMusteri: any) => {
  try {
    const response = await apiFetch(`/Denetlenen`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdMusteri),
    });
    if (response.ok) {
      return { success: true, data: await response.json() };
    } else {
      const contentType = response.headers.get("content-type");
      let message = "Hata Oluştu";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        message = errorData || message;
      } else {
        message = await response.text();
      }

      return { success: false, message };
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const uploadAndParseKurumlarBeyannamesi = async (
  file: File,
  denetciId: number,
  yil: number,
  denetlenenId: number
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch(
      `/Veri/UploadAndParseKurumlarBeyannamesi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=KurumlarBeyannamesi`,
      {
        method: "POST",
        headers: {},
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();
      // Backend uses GetResponseOnlyResultData which returns only the data object directly
      return {
        success: true,
        data: data,
        message: "Dosya yüklendi ve veriler çekildi."
      };
    } else {
      const contentType = response.headers.get("content-type");
      let message = "Dosya yüklenirken hata oluştu.";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        message = errorData.message || errorData || message;
      } else {
        message = await response.text();
      }
      return { success: false, message: message };
    }
  } catch (error) {
    console.log("Dosya yüklenirken hata oluştu:", error);
    return { success: false, message: "Beklenmedik bir hata oluştu." };
  }
};

export const getDenetlenenById = async (id: any) => {
  try {
    const response = await apiFetch(`/Denetlenen/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Denetlenen getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDenetlenenByDenetciId = async (
  denetciId: number
) => {
  try {
    const response = await apiFetch(`/Denetlenen/Denetci/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      ignoreCustomHeaders: true,
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log(`Denetlenenler getirilemedi (${denetciId}). Durum: ${response.status} ${response.statusText}`);
      return [];
    }
  } catch (error: any) {
    console.log("getDenetlenenByDenetciId hatası:", error);
    return [];
  }
};

export const getDenetlenenKonsolideAnaSirketByDenetciId = async (
  denetciId: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/KonsolideAnaSirket/Denetci/${denetciId}`,
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
      console.log("Denetlenenler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getDenetlenenByRol = async (
  denetciId: number,
  kullaniciId: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/Rol/${denetciId}/${kullaniciId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
        timeout: 60000, // Şirket listesi için 60 saniye
        ignoreCustomHeaders: true, // Listeleme yaparken seçili şirket header'larını gönderme
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log(`Denetlenenler (Rol bazlı) getirilemedi. Durum: ${response.status} ${response.statusText}`);
      return [];
    }
  } catch (error: any) {
    console.log("getDenetlenenByRol hatası:", error);
    return [];
  }
};

export const updateDenetlenen = async (
  id: any,
  updatedDenetlenen: any
) => {
  try {
    const response = await apiFetch(`/Denetlenen/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDenetlenen),
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

export const updateDenetlenenDenetimTuru = async (
  id: number,
  denetimTuru: string,
  enflasyon: string
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/${id}/${denetimTuru}/${enflasyon}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      const contentType = response.headers.get("content-type");
      let message = "Hata Oluştu";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        message = errorData || message;
      } else {
        message = await response.text();
      }

      return { message };
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const deleteDenetlenenById = async (id: number) => {
  try {
    const response = await apiFetch(`/Denetlenen/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
      },
      timeout: 300000, // 5 dakika - Cascade delete işlemi uzun sürebilir
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

export const getOldDenetlenenForCurrentDenetci = async () => {
  try {
    const response = await apiFetch(`/DataTransfer/OldDenetlenen/ForCurrentDenetci`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("getOldDenetlenenForCurrentDenetci failed", response.status);
      return [];
    }
  } catch (error) {
    console.error("getOldDenetlenenForCurrentDenetci error:", error);
    return [];
  }
};

export const checkDenetciExistsInOldDb = async () => {
  try {
    const response = await apiFetch(`/DataTransfer/CheckDenetciExistsInOldDb`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("checkDenetciExistsInOldDb failed", response.status);
      return false;
    }
  } catch (error) {
    console.error("checkDenetciExistsInOldDb error:", error);
    return false;
  }
};

export const importDenetlenen = async (dto: any) => {
  try {
    const response = await apiFetch(`/DataTransfer/ImportDenetlenen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (response.ok) return true;
    const txt = await response.text();
    console.error("importDenetlenen failed", response.status, txt);
    return false;
  } catch (error) {
    console.error("importDenetlenen error:", error);
    return false;
  }
};

export const getSektorKodlari = async () => {
  try {
    const response = await apiFetch(`/Denetlenen/SektorKodlari`, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Sektör Kodları getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const createSirketYonetimKadrosu = async (
  createdSirketYonetimKadrosu: any
) => {
  try {
    const response = await apiFetch(`/Denetlenen/SirketYonetimKadrosu`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdSirketYonetimKadrosu),
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

export const getSirketYonetimKadrosuById = async (id: any) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/SirketYonetimKadrosu/${id}`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("Şirket Yönetim Kadrosu getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getSirketYonetimKadrosuByDenetlenenId = async (
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/SirketYonetimKadrosu/Denetlenen/${denetlenenId}`,
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
      console.log("Şirket Yönetim Kadrosu getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateSirketYonetimKadrosu = async (
  id: any,
  updatedSirketYonetimKadrosu: any
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/SirketYonetimKadrosu/${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSirketYonetimKadrosu),
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

export const deleteSirketYonetimKadrosuById = async (
  id: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/SirketYonetimKadrosu/${id}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
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

export const createSubeler = async (createdSubeler: any) => {
  try {
    const response = await apiFetch(`/Denetlenen/Subeler`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdSubeler),
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

export const getSubelerById = async (id: any) => {
  try {
    const response = await apiFetch(`/Denetlenen/Subeler/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Şube getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getSubelerByDenetlenenId = async (
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/Subeler/Denetlenen/${denetlenenId}`,
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
      console.log("Şubeler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateSubeler = async (
  id: any,
  updatedSubeler: any
) => {
  try {
    const response = await apiFetch(`/Denetlenen/Subeler/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedSubeler),
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

export const deleteSubelerById = async (id: number) => {
  try {
    const response = await apiFetch(`/Denetlenen/Subeler/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
      },
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

export const createHissedarlar = async (
  createdHissedarlar: any
) => {
  try {
    const response = await apiFetch(`/Denetlenen/Hissedarlar`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdHissedarlar),
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

export const getHissedarlarById = async (id: any) => {
  try {
    const response = await apiFetch(`/Denetlenen/Hissedarlar/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("Hissedarlar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getHissedarlarByDenetlenenIdYil = async (
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/Hissedarlar/DenetlenenYil/${denetlenenId}/${yil}`,
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
      console.log("Hissedarlar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getMizandanHissedarlarByDenetlenenIdYil = async (
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/MizandanHissedarlar/DenetlenenYil/${denetlenenId}/${yil}`,
      {
        method: "GET",
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

export const updateHissedarlar = async (
  id: any,
  updatedHissedarlar: any
) => {
  try {
    const response = await apiFetch(`/Denetlenen/Hissedarlar/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedHissedarlar),
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

export const deleteHissedarlarById = async (id: number) => {
  try {
    const response = await apiFetch(`/Denetlenen/Hissedarlar/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
      },
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

export const createIliskiliTaraflar = async (
  createdIliskiliTaraflar: any
) => {
  try {
    const response = await apiFetch(`/Denetlenen/IliskiliTaraflar`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdIliskiliTaraflar),
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

export const getIliskiliTaraflarById = async (id: any) => {
  try {
    const response = await apiFetch(`/Denetlenen/IliskiliTaraflar/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.log("İlişkili Taraf getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getIliskiliTaraflarByDenetlenenId = async (
  denetlenenId: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/IliskiliTaraflar/Denetlenen/${denetlenenId}`,
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
      console.log("İlişkili Taraflar getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateIliskiliTaraflar = async (
  id: any,
  updatedIliskiliTaraflar: any
) => {
  try {
    const response = await apiFetch(`/Denetlenen/IliskiliTaraflar/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedIliskiliTaraflar),
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

export const deleteIliskiliTaraflarById = async (id: number) => {
  try {
    const response = await apiFetch(`/Denetlenen/IliskiliTaraflar/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
      },
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

export const createIliskiliTaraflarListe = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  iliskiliTaraflarListe: any
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/IliskiliTaraflarListe?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(iliskiliTaraflarListe),
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.log("İliskili Taraflar Listesi kaydedilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const getMusteriTanimaSayisalBilgiler = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/MusteriTanimaSayisalBilgiler?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Sayısal Bilgiler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateMusteriTanimaSayisalBilgiler = async (
  updatedMusteriTanimaSayisalBilgiler: any
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/MusteriTanimaSayisalBilgiler`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMusteriTanimaSayisalBilgiler),
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

export const getMusteriTanimaStatikBilgiler = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/MusteriTanimaStatikBilgiler?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Statik Bilgiler getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateMusteriTanimaStatikBilgiler = async (
  updatedMusteriTanimaStatikBilgiler: any
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/MusteriTanimaStatikBilgiler`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMusteriTanimaStatikBilgiler),
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

export const getTeklifHesaplama = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/TeklifHesaplama?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.log("Teklif Hesaplama verileri getirilemedi");
    }
  } catch (error) {
    console.log("Bir hata oluştu:", error);
  }
};

export const updateTeklifHesaplama = async (
  updatedTeklifHesaplama: any
) => {
  try {
    const response = await apiFetch(`/Denetlenen/TeklifHesaplama`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTeklifHesaplama),
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

export const TeklifHesapla = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/TeklifHesapla?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
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

export const deleteTeklifHesaplama = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/TeklifHesaplama?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
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
