import { url } from "@/api/apiBase";

export const getMizanVerileri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/Mizan?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.error("E Defter Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getMizanVerileriByHesapNo = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string,
  hesapNo: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/MizanByHesapNo?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}&hesapNo=${hesapNo}`,
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
      console.error("Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getKurumlarVergisiBeyannamesiKarsilastirma = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/KurumlarBeyannamesiKarsilastirma?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.error("E Defter Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getProgramVukMizan = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/ProgramVukMizan?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.error("Program Vuk Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getProgramVukMizanWithoutType = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/ProgramVukMizanWithoutType?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Program Vuk Mizan verileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getProgramVukMizanControl = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/ProgramVukMizanKontrol?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.error("Program Vuk Mizan Kontrol getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createAnaHesapMizan = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  mizanbaslangicTarihi: string,
  mizanBitisTarihi: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/AnaHesapMizanOlustur?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&baslangicTarihi=${mizanbaslangicTarihi}&bitisTarihi=${mizanBitisTarihi}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Ana Hesap Mizan oluşturulamadı");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createDetayHesapMizan = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  mizanbaslangicTarihi: string,
  mizanBitisTarihi: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/DetayHesapMizanOlustur?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&baslangicTarihi=${mizanbaslangicTarihi}&bitisTarihi=${mizanBitisTarihi}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Detay Hesap Mizan oluşturulamadı");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createVukMizan = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  mizanbaslangicTarihi: string,
  mizanBitisTarihi: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/VukMizanMizanOlustur?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&baslangicTarihi=${mizanbaslangicTarihi}&bitisTarihi=${mizanBitisTarihi}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Vuk Mizan oluşturulamadı");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createProgramVukMizan = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  type: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/ProgramVukMizan?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error("Program Vuk Mizan oluşturulamadı");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const getMizanBilgileri = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number,
  type: string
) => {
  try {
    const response = await fetch(
      `${url}/Mizan/MizanIslemLoglari?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}&tip=${type}`,
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
      console.error("Mizan Bilgileri getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const deleteMizanBilgisiMultiple = async (
  token: string,
  selected: any
) => {
  try {
    const response = await fetch(`${url}/Mizan/MizanIslemLoglari`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selected),
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
