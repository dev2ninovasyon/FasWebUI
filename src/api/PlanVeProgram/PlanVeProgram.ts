import { url } from "@/api/apiBase";

export const getOnemlilikVeOrneklemSeviyesi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/PlanVeProgram/OnemlilikVeOrneklemSeviyesi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Önemlilik Ve Örneklem Seviyesi getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const createOnemlilikVeOrneklem = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  guvenilirlikDuzeyi: number,
  hataPayi: number
) => {
  try {
    const response = await fetch(
      `${url}/PlanVeProgram/OnemlilikVeOrneklemHesapla?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}&guvenilirlikDuzeyi=${guvenilirlikDuzeyi}&hataPayi=${hataPayi}&cevapDagilimi=50&listelemeTuru=Aya Göre`,
      {
        method: "POST",
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

export const getOnemlilikVeOrneklem = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/PlanVeProgram/OnemlilikVeOrneklem?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
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
      console.error("Önemlilik Ve Örneklem getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateOnemlilikVeOrneklem = async (
  token: string,
  updatedOnemlilikVeOrneklem: any
) => {
  try {
    const response = await fetch(`${url}/PlanVeProgram/OnemlilikVeOrneklem`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedOnemlilikVeOrneklem),
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

export const createOnemlilikVeOrneklemHesaplamaBazi = async (
  token: string,
  denetciId: number,
  yil: number,
  denetlenenId: number,
  json: any
) => {
  try {
    const response = await fetch(
      `${url}/PlanVeProgram/OnemlilikVeOrneklemHesaplamaBazi?denetciId=${denetciId}&denetlenenId=${denetlenenId}&yil=${yil}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(json),
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

export const getOnemlilikVeOrneklemHesaplamaBazi = async (
  token: string,
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  try {
    const response = await fetch(
      `${url}/PlanVeProgram/OnemlilikVeOrneklemHesaplamaBazi?denetciId=${denetciId}&yil=${yil}&denetlenenId=${denetlenenId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status == 200) {
      return response.json();
    } else {
      console.error("Önemlilik Ve Örneklem Hesaplama Bazı getirilemedi");
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
  }
};

export const updateOnemlilikVeOrneklemHesaplamaBazi = async (
  token: string,
  json: any
) => {
  try {
    const response = await fetch(
      `${url}/PlanVeProgram/OnemlilikVeOrneklemHesaplamaBazi`,
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(json),
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
