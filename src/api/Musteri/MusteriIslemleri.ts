// ImportFromOld: Kuyruğa alma ve polling
export const startImportFromOldJob = async (params: any) => {
  // DTO: TableKey, TasinanDenetlenenId, Years, TableKeys, Yil
  const transferredId = params.TasinanDenetlenenId;
  const body = {
    TableKey: "MusteriImport",
    TasinanDenetlenenId: transferredId,
    Years: params.Years || [],
    TableKeys: params.TableKeys || [],
    Yil: params.Yil || null
  };
  const response = await apiFetch(`/DataTransfer/ImportFromOldJob`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // If apiFetch returns a Response, parse JSON
  if (response && typeof response.json === 'function') {
    return await response.json();
  }
  // If already parsed, return as is
  return response;
};

export const getImportJobStatus = async (jobId: string) => {
  const response = await apiFetch(`/DataTransfer/ImportJobStatus/${jobId}`);
  if (!response.ok) throw new Error("Job bulunamadı");
  return await response.json();
};

export const getImportJobNotifications = async (jobId: string) => {
  const response = await apiFetch(`/DataTransfer/ImportJobNotifications/${jobId}`);
  if (!response.ok) throw new Error("Bildirimler alınamadı");
  return await response.json();
};

// Yeni pipeline endpointine uygun örnek fonksiyonlar:
export async function startImportFromOldPipelineJob(body: {
  TableKey: string;
  DenetciId: number;
  TasinanDenetlenenId: number;
  Yil: number;
}) {
  const payload = {
    ...body,
    TasinanDenetlenenId: body.TasinanDenetlenenId,
  };
  const res = await apiFetch(`/DataTransfer/ImportFromOldJob`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res && typeof res.json === 'function') return await res.json();
  return res;
}

export async function getImportPipelineJobStatus(jobId: string) {
  const res = await apiFetch(`/DataTransfer/ImportJobStatus/${jobId}`);
  if (!res.ok) throw new Error('Job bulunamadı');
  return await res.json();
}

import { apiFetch } from "@/api/apiBase";
import axios, { AxiosProgressEvent } from "axios";
import { url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig, readStoredAuthTokens } from "@/utils/authSession";

export const createDenetlenen = async (createdMusteri: any) => {
  const response = await apiFetch(`/Denetlenen`, {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createdMusteri),
  });

  return { success: true, data: await response.json() };
};

export const uploadAndParseKurumlarBeyannamesi = async (
  file: File,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  onProgress?: (percentage: number) => void
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const denetlenenIdFromStorage =
      typeof window !== "undefined"
        ? window.localStorage.getItem("fas_denetlenenId")
        : null;
    const yilFromStorage =
      typeof window !== "undefined"
        ? window.localStorage.getItem("fas_yil")
        : null;
    const clientUrl =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "";

    const response = await axios.post(
      `${url}/Veri/UploadAndParseKurumlarBeyannamesi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=KurumlarBeyannamesi`,
      formData,
      createAuthorizedAxiosConfig({
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Client-Url": clientUrl,
          ...(denetlenenIdFromStorage
            ? { "X-Denetlenen-Id": denetlenenIdFromStorage }
            : {}),
          ...(yilFromStorage ? { "X-Yil": yilFromStorage } : {}),
        },
        onUploadProgress: (event: AxiosProgressEvent) => {
          if (!onProgress) return;
          const percentage = event.total
            ? Math.round((event.loaded * 100) / event.total)
            : 1;
          onProgress(Math.max(1, Math.min(99, percentage)));
        },
      }, readStoredAuthTokens().accessToken)
    );

    onProgress?.(100);

    if (response.status >= 200 && response.status < 300) {
      const data = response.data;
      // Backend uses GetResponseOnlyResultData which returns only the data object directly
      return {
        success: true,
        data: data,
        message: "Dosya yüklendi ve veriler çekildi."
      };
    }

    return { success: false, message: "Dosya yüklenirken hata oluştu." };
  } catch (error) {
    console.log("Dosya yüklenirken hata oluştu:", error);
    const axiosError = error as any;
    const responseData = axiosError?.response?.data;
    
    let message = "Beklenmedik bir hata oluştu.";
    if (responseData) {
      if (typeof responseData === 'string') {
        if (responseData.toLowerCase().includes('<html') || responseData.includes('System.Exception') || responseData.includes('HEADERS =======') || responseData.length > 500) {
          message = "Sunucu tarafında beklendiği gibi işlenemeyen bir hata oluştu. Detaylar için konsola bakınız.";
        } else {
          message = responseData;
        }
      } else if (responseData.message || responseData.Message) {
        message = responseData.message || responseData.Message;
      }
    }

    return { success: false, message: message };
  }
};

export const getMusteriTanimaDetay = async (
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await apiFetch(
      `/MusteriTanima/GetDetay?denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Musteri tanima detay verileri getirilemedi.");
    }

    return await response.json();
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    throw error;
  }
};

export const updateMusteriTanimaDetay = async (dto: any) => {
  try {
    const response = await apiFetch(`/MusteriTanima/UpdateDetay`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    let payload: any = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      return {
        success: false,
        message:
          payload?.message ||
          payload?.Message ||
          "Musteri tanima bilgileri kaydedilemedi.",
      };
    }

    return {
      success: true,
      message:
        payload?.message ||
        payload?.Message ||
        "Musteri tanima bilgileri kaydedildi.",
      data: payload?.data ?? payload?.Data ?? payload,
    };
  } catch (error) {
    console.log("Bir hata oluştu:", error);
    return {
      success: false,
      message: "Musteri tanima bilgileri kaydedilirken hata oluştu.",
    };
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

export const getDenetlenenByDenetciIdForSelection = async (
  denetciId: number
) => {
  try {
    const response = await apiFetch(`/Denetlenen/DenetciSelection/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      ignoreCustomHeaders: true,
    });
    if (response.ok) {
      return response.json();
    }
    return [];
  } catch (error: any) {
    console.log("getDenetlenenByDenetciIdForSelection hatası:", error);
    return [];
  }
};

export const getDenetlenenByRolForSelection = async (
  denetciId: number,
  kullaniciId: number
) => {
  try {
    const response = await apiFetch(
      `/Denetlenen/RolSelection/${denetciId}/${kullaniciId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
        timeout: 60000,
        ignoreCustomHeaders: true,
      }
    );
    if (response.ok) {
      return response.json();
    }
    return [];
  } catch (error: any) {
    console.log("getDenetlenenByRolForSelection hatası:", error);
    return [];
  }
};

export const getImportJobSummariesByDenetciId = async (denetciId: number) => {
  try {
    const response = await apiFetch(`/DataTransfer/ImportJobSummariesByDenetci/${denetciId}`, {
      method: "GET",
      headers: { accept: "application/json" },
      ignoreCustomHeaders: true,
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.log("getImportJobSummariesByDenetciId hatası:", error);
    return [];
  }
};

export const getTransferredDenetlenenIdsByDenetciId = async (denetciId: number): Promise<number[]> => {
  const summaries = await getImportJobSummariesByDenetciId(denetciId);
  const ids = new Set<number>();

  (summaries || []).forEach((summary: any) => {
    const rawStatus = String(summary?.status ?? summary?.Status ?? "").toLowerCase();
    const isTransferredStatus =
      rawStatus === "succeeded" ||
      rawStatus === "success" ||
      rawStatus === "completed" ||
      rawStatus.includes("succeed") ||
      rawStatus.includes("success") ||
      rawStatus.includes("completed");
    if (!isTransferredStatus) return;

    const rawId =
      summary?.sourceLegacyDenetlenenId ??
      summary?.SourceLegacyDenetlenenId ??
      summary?.tasinanDenetlenenId ??
      summary?.TasinanDenetlenenId;

    const id = Number(rawId);
    if (Number.isFinite(id) && id > 0) ids.add(id);
  });

  return Array.from(ids);
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

export const getImportFromOldTransferTables = async () => {
  const response = await apiFetch(`/DataTransfer/ImportFromOldTransferTables`, {
    method: "GET",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Taşınacak tablo listesi alınamadı.");
  }

  return response.json();
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

// ===== OldDb İthalatı için API Fonksiyonları =====

import type {
  OldDenetlenenListItemDto,
  OldDenetlenenDetayDto,
} from "./MusteriIslemleriDtos";

// OldDb'den mevcut denetciId'ye ait firma listesi
export async function getOldDenetlenenForCurrentDenetci(): Promise<
  OldDenetlenenListItemDto[]
> {
  try {
    const res = await apiFetch(`/DataTransfer/OldDenetlenen/ForCurrentDenetci`);
    if (!res.ok) throw new Error("Firma listesi alınamadı");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("getOldDenetlenenForCurrentDenetci error:", error);
    throw error;
  }
}

// OldDb'den firma detaylarını ID ile çek
export async function getOldDenetlenenDetay(
  id: number
): Promise<OldDenetlenenDetayDto> {
  try {
    const res = await apiFetch(`/DataTransfer/OldDenetlenen/${id}`);
    if (!res.ok) throw new Error(`Firma detayı yüklenemedi (ID: ${id})`);
    const data = await res.json();
    return data as OldDenetlenenDetayDto;
  } catch (error) {
    console.error("getOldDenetlenenDetay error:", error);
    throw error;
  }
}

// OldDb firma detaylarını MusteriEkleForm format'ına map et
export function mapOldDenetlenenToFormData(
  detay: OldDenetlenenDetayDto
): Record<string, any> {
  const d = detay as any;
  const sektor1Id = d.sektor1Id ?? d.Sektor1Id ?? 0;
  const sektor2Id = d.sektor2Id ?? d.Sektor2Id ?? 0;
  const sektor3Id = d.sektor3Id ?? d.Sektor3Id ?? 0;

  return {
    id: d.id ?? d.Id ?? 0,
    firmaAdi: d.firmaAdi ?? d.FirmaAdi ?? "",
    yetkili: d.yetkili ?? d.Yetkili ?? "",
    tel: d.tel ?? d.Tel ?? "",
    fax: d.fax ?? d.Fax ?? "",
    adres: d.adres ?? d.Adres ?? "",
    email: d.email ?? d.Email ?? "",
    webAdresi: d.webAdresi ?? d.WebAdresi ?? "",
    ticaretSicilNo: d.ticaretSicilNo ?? d.TicaretSicilNo ?? "",
    vergiDairesi: d.vergiDairesi ?? d.VergiDairesi ?? "",
    vergiNo: d.vergiNo ?? d.VergiNo ?? "",
    arsivId: d.arsivId ?? d.ArsivId ?? "",
    aktifmi: d.aktifmi ?? d.Aktifmi ?? true,
    sektor1Id,
    sektor2Id,
    sektor3Id,
    sektor1Adi: d.sektor1Adi ?? d.Sektor1Adi ?? "",
    sektor2Adi: d.sektor2Adi ?? d.Sektor2Adi ?? "",
    sektor3Adi: d.sektor3Adi ?? d.Sektor3Adi ?? "",
    sektor1Kod: d.sektor1Kod ?? d.Sektor1Kod ?? "",
    sektor2Kod: d.sektor2Kod ?? d.Sektor2Kod ?? "",
    sektor3Kod: d.sektor3Kod ?? d.Sektor3Kod ?? "",
    konsolideMi: (d.konsolide ?? d.Konsolide) ? "Evet" : "Hayır",
    konsolideTipi: d.konsolideAnaSirketmi ?? d.KonsolideAnaSirketmi
      ? "Ana Şirket"
      : d.konsolideAltSirketmi ?? d.KonsolideAltSirketmi
        ? "Alt Şirket"
        : "Ana Şirket",
    enflasyonMu: d.enflasyonMu ?? d.EnflasyonMu ?? false,
  };
}


