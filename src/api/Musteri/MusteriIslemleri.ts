import { url } from "@/api/apiBase";

export const createDenetlenen = async (token: string, createdMusteri: any) => {
  try {
    const response = await fetch(`${url}/Denetlenen`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdMusteri),
    });

    if (response.ok) {
      return true;
    } else {
      const contentType = response.headers.get("content-type");

      let message = "Hata Oluştu";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        message = errorData.message || message;
      } else {
        message = await response.text();
      }

      return { message };
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDenetlenenById = async (token: string, id: any) => {
  try {
    const response = await fetch(`${url}/Denetlenen/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetlenen getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDenetlenenByDenetciId = async (
  token: string,
  denetciId: number
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Denetci/${denetciId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Denetlenenler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDenetlenenKonsolideAnaSirketByDenetciId = async (
  token: string,
  denetciId: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/KonsolideAnaSirket/Denetci/${denetciId}`,
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
      console.error("Denetlenenler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getDenetlenenByRol = async (
  token: string,
  denetciId: number,
  kullaniciId: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/Rol/${denetciId}/${kullaniciId}`,
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
      console.error("Denetlenenler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateDenetlenen = async (
  token: string,
  id: any,
  updatedDenetlenen: any
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedDenetlenen),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateDenetlenenDenetimTuru = async (
  token: string,
  id: number,
  denetimTuru: string,
  enflasyon: string
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/${id}/${denetimTuru}/${enflasyon}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        message = errorData.message || message;
      } else {
        message = await response.text();
      }

      return { message };
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteDenetlenenById = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Denetlenen/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getSektorKodlari = async (token: string) => {
  try {
    const response = await fetch(`${url}/Denetlenen/SektorKodlari`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Sektör Kodları getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createSirketYonetimKadrosu = async (
  token: string,
  createdSirketYonetimKadrosu: any
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/SirketYonetimKadrosu`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdSirketYonetimKadrosu),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getSirketYonetimKadrosuById = async (token: string, id: any) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/SirketYonetimKadrosu/${id}`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Şirket Yönetim Kadrosu getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getSirketYonetimKadrosuByDenetlenenId = async (
  token: string,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/SirketYonetimKadrosu/Denetlenen/${denetlenenId}`,
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
      console.error("Şirket Yönetim Kadrosu getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateSirketYonetimKadrosu = async (
  token: string,
  id: any,
  updatedSirketYonetimKadrosu: any
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/SirketYonetimKadrosu/${id}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteSirketYonetimKadrosuById = async (
  token: string,
  id: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/SirketYonetimKadrosu/${id}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createSubeler = async (token: string, createdSubeler: any) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Subeler`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdSubeler),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getSubelerById = async (token: string, id: any) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Subeler/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Şube getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getSubelerByDenetlenenId = async (
  token: string,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/Subeler/Denetlenen/${denetlenenId}`,
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
      console.error("Şubeler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateSubeler = async (
  token: string,
  id: any,
  updatedSubeler: any
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Subeler/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedSubeler),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteSubelerById = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Subeler/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createHissedarlar = async (
  token: string,
  createdHissedarlar: any
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Hissedarlar`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdHissedarlar),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getHissedarlarById = async (token: string, id: any) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Hissedarlar/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("Hissedarlar getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getHissedarlarByDenetlenenIdYil = async (
  token: string,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/Hissedarlar/DenetlenenYil/${denetlenenId}/${yil}`,
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
      console.error("Hissedarlar getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getMizandanHissedarlarByDenetlenenIdYil = async (
  token: string,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/MizandanHissedarlar/DenetlenenYil/${denetlenenId}/${yil}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateHissedarlar = async (
  token: string,
  id: any,
  updatedHissedarlar: any
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Hissedarlar/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedHissedarlar),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteHissedarlarById = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Denetlenen/Hissedarlar/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createIliskiliTaraflar = async (
  token: string,
  createdIliskiliTaraflar: any
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/IliskiliTaraflar`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdIliskiliTaraflar),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getIliskiliTaraflarById = async (token: string, id: any) => {
  try {
    const response = await fetch(`${url}/Denetlenen/IliskiliTaraflar/${id}`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      console.error("İlişkili Taraf getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getIliskiliTaraflarByDenetlenenId = async (
  token: string,
  denetlenenId: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/IliskiliTaraflar/Denetlenen/${denetlenenId}`,
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
      console.error("İlişkili Taraflar getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateIliskiliTaraflar = async (
  token: string,
  id: any,
  updatedIliskiliTaraflar: any
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/IliskiliTaraflar/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedIliskiliTaraflar),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteIliskiliTaraflarById = async (token: string, id: number) => {
  try {
    const response = await fetch(`${url}/Denetlenen/IliskiliTaraflar/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createIliskiliTaraflarListe = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  iliskiliTaraflarListe: any
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/IliskiliTaraflarListe?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(iliskiliTaraflarListe),
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("İliskili Taraflar Listesi kaydedilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getMusteriTanimaSayisalBilgiler = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/MusteriTanimaSayisalBilgiler?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Sayısal Bilgiler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateMusteriTanimaSayisalBilgiler = async (
  token: string,
  updatedMusteriTanimaSayisalBilgiler: any
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/MusteriTanimaSayisalBilgiler`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    console.error("Bir hata oluştu:", error);
  }
};

export const getMusteriTanimaStatikBilgiler = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/MusteriTanimaStatikBilgiler?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Statik Bilgiler getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateMusteriTanimaStatikBilgiler = async (
  token: string,
  updatedMusteriTanimaStatikBilgiler: any
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/MusteriTanimaStatikBilgiler`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    console.error("Bir hata oluştu:", error);
  }
};

export const getTeklifHesaplama = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/TeklifHesaplama?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Teklif Hesaplama verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateTeklifHesaplama = async (
  token: string,
  updatedTeklifHesaplama: any
) => {
  try {
    const response = await fetch(`${url}/Denetlenen/TeklifHesaplama`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTeklifHesaplama),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const TeklifHesapla = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/TeklifHesapla?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteTeklifHesaplama = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Denetlenen/TeklifHesaplama?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};
