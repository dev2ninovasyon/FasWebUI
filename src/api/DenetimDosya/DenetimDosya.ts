import { url } from "@/api/apiBase";

export const getDenetimDosya = async (token: string, denetimTuru: string) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await fetch(
      `${url}/DenetimDosyaBelgeleri/DenetimDosyaListe?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
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
      console.error("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const getDenetimDosyaByFormKodu = async (
  token: string,
  denetimTuru: string,
  formKodu: string
) => {
  try {
    const response = await fetch(
      `${url}/DenetimDosyaBelgeleri/FormKodu?denetimTuru=${denetimTuru}&formKodu=${formKodu}`,
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
      console.error("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const getCariDosya = async (token: string, denetimTuru: string) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await fetch(
      `${url}/DenetimDosyaBelgeleri/CariDosyaListe?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
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
      console.error("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const getSurekliDosya = async (token: string, denetimTuru: string) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await fetch(
      `${url}/DenetimDosyaBelgeleri/SurekliDosyaListe?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
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
      console.error("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const getHile = async (token: string, denetimTuru: string) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await fetch(
      `${url}/DenetimDosyaBelgeleri/HileListe?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
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
      console.error("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const getDenetimDosyaTransfer = async (
  token: string,
  denetimTuru: string
) => {
  try {
    let tfrsmi = denetimTuru == "Tfrs" ? true : false;
    let bobimi = denetimTuru == "Bobi" ? true : false;

    const response = await fetch(
      `${url}/DenetimDosyaBelgeleri/DenetimDosyaTransfer?tfrsmi=${tfrsmi}&bobimi=${bobimi}`,
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
      console.error("Verileri getirilemedi");
      return null;
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return null;
  }
};

export const denetimDosyaTransfer = async (
  token: string,
  denetciId: number,
  kaynakId: number,
  hedefId: number,
  kaynakYil: number,
  hedefYil: number,
  obj: any[]
) => {
  try {
    const response = await fetch(
      `${url}/DenetimDosyaBelgeleri/TransferYap?denetciId=${denetciId}&kaynakId=${kaynakId}&hedefId=${hedefId}&kaynakYil=${kaynakYil}&hedefYil=${hedefYil}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      }
    );

    if (response.ok) {
      return response.json();
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
    console.error("Bir hata oluştu:", error);
  }
};
