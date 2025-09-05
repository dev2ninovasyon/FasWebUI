import { url } from "@/api/apiBase";

export const getCalismaKagidiVerileriByDenetciDenetlenenYil = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Çalışma kağıdı verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getCalismaKagidiVerileriByDenetciDenetlenenYilDipnotNo = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnotNo: string
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${dipnotNo}`,
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
      console.error("Çalışma kağıdı verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getCalismaKagidiVerileriByDenetciDenetlenenKullaniciYil = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}`,
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
      console.error("Çalışma kağıdı verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getCalismaKagidiVerileriByDenetciDenetlenenYilByKonu = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konu: string
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konu=${konu}`,
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
      console.error("Çalışma kağıdı verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getCalismaKagidiVerileriByDenetciDenetlenenYilByUrl = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  formUrl: string
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&url=${formUrl}`,
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
      console.error("Çalışma kağıdı verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createCalismaKagidiVerisi = async (
  controller: string,
  token: string,
  createdCalismaKagidiVerisi: any
) => {
  try {
    const response = await fetch(`${url}/${controller}`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createdCalismaKagidiVerisi),
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

export const updateCalismaKagidiVerisi = async (
  controller: string,
  token: string,
  id: any,
  updatedCalismaKagidiVerisi: any
) => {
  try {
    const response = await fetch(`${url}/${controller}/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedCalismaKagidiVerisi),
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

export const updateAllCalismaKagidiVerisi = async (
  controller: string,
  token: string,
  updatedAllCalismaKagidiVerisi: any
) => {
  try {
    const response = await fetch(`${url}/${controller}/Hepsi`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedAllCalismaKagidiVerisi),
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

export const updateOtomatikCalismaKagidiVerisi = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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

export const deleteCalismaKagidiVerisiById = async (
  controller: string,
  token: string,
  id: any
) => {
  try {
    const response = await fetch(`${url}/${controller}/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
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

export const deleteAllCalismaKagidiVerileri = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "DELETE",
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

export const deleteAllCalismaKagidiVerileriByDipnotNo = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  dipnotNo: string
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&dipnotNo=${dipnotNo}`,
      {
        method: "DELETE",
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

export const deleteAllCalismaKagidiVerileriByKullanci = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  kullaniciId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&kullaniciId=${kullaniciId}`,
      {
        method: "DELETE",
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

export const deleteAllCalismaKagidiVerileriByKonu = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  konu: string
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&konu=${konu}`,
      {
        method: "DELETE",
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

export const deleteAllCalismaKagidiVerileriByUrl = async (
  controller: string,
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  formUrl: string
) => {
  try {
    const response = await fetch(
      `${url}/${controller}?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&url=${formUrl}`,
      {
        method: "DELETE",
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

export const getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  formKodu: string
) => {
  try {
    const response = await fetch(
      `${url}/FormHazirlayanOnaylayan/${denetciId}/${yil}/${denetlenenId}/${formKodu}`,
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
      console.error("Form Hazırlayan Onaylayan verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateFormHazirlayanOnaylayan = async (
  token: string,
  id: any,
  updatedFormHazirlayanOnaylayanVerisi: any
) => {
  try {
    const response = await fetch(`${url}/FormHazirlayanOnaylayan/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFormHazirlayanOnaylayanVerisi),
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
