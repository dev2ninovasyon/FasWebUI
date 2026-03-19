import { apiFetch } from "@/api/apiBase";

export interface Menu {
  id: number;
  dosyaNevi?: string;
  belgeAdi?: string;
  referansNo?: string;
  formKodu?: string;
  icon?: string;
  parentId?: number;
  formUrl?: string;
  arsivKlasorAdi?: string;
  bobimi?: number;
  tfrsmi?: number;
  arsivAdi?: string;
  sira?: number;
}

export interface MenuKullanimBilgisi {
  id: number;
  menuId: number;
  baslik?: string;
  ozet?: string;
  kullanimNotu?: string;
  kullanimAdimlariJson?: string;
  dikkatEdileceklerJson?: string;
  sikSorulanSorularJson?: string;
  videoUrl?: string;
  videoBaslik?: string;
  videoAciklama?: string;
  hitCount: number;
  ekleyenKullaniciId?: string;
  eklenmeTarihi: string;
}

export interface MenuUsageQuestion {
  soru?: string;
  cevap?: string;
}

export interface MenuUsageVideo {
  url?: string;
  baslik?: string;
  aciklama?: string;
}

export interface MenuUsagePanel {
  id: number;
  menuId: number;
  baslik?: string;
  ozet?: string;
  kullanimNotu?: string;
  kullanimAdimlari: string[];
  dikkatEdilecekler: string[];
  sikSorulanSorular: MenuUsageQuestion[];
  kullanimSemasi: {
    onKosullar: string[];
    buSayfadaYapacaklariniz: string[];
    sonrakiAdimlar: string[];
    hataRiskiYuksekAlanlar: string[];
  };
  video?: MenuUsageVideo | null;
  hasVideo: boolean;
  hitCount: number;
  ekleyenKullaniciId?: number;
  eklenmeTarihi: string;
}

export const getMenus = async (): Promise<Menu[]> => {
  try {
    const response = await apiFetch("/Menu", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    }
    return [];
  } catch (error) {
    console.error("Menuler getirilemedi:", error);
    return [];
  }
};

export const getMenuUsageByMenuId = async (menuId: number): Promise<MenuKullanimBilgisi[]> => {
  try {
    const response = await apiFetch(`/Menu/${menuId}/Usage`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    }
    return [];
  } catch (error) {
    console.error("Menu kullanim bilgileri getirilemedi:", error);
    return [];
  }
};

export const getMenuUsagePanelByMenuId = async (menuId: number): Promise<MenuUsagePanel | null> => {
  try {
    const response = await apiFetch(`/Menu/${menuId}/Usage/Panel`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (response.ok) {
      return response.json();
    }
    return null;
  } catch (error) {
    console.error("Menu kullanim panel bilgisi getirilemedi:", error);
    return null;
  }
};

export const incrementMenuUsageView = async (menuId: number): Promise<number | null> => {
  try {
    const response = await apiFetch(`/Menu/${menuId}/Usage/View`, {
      method: "POST",
      headers: {
        accept: "application/json",
      },
    });

    if (response.ok) {
      return response.json();
    }

    return null;
  } catch (error) {
    console.error("Menu kullanim goruntuleme sayisi guncellenemedi:", error);
    return null;
  }
};
