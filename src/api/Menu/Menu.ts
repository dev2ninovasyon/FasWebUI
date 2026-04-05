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
  icerikHtml?: string;
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

const extractHitCount = (payload: unknown): number | null => {
  if (typeof payload === "number") {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const candidates = [record.hitCount, record.HitCount, record.value, record.Value];

  for (const candidate of candidates) {
    if (typeof candidate === "number") {
      return candidate;
    }
  }

  return null;
};

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
      const data = await response.json();
      
      // Map PascalCase backend response to camelCase frontend interface
      return {
        id: data.Id || data.id,
        menuId: data.MenuId || data.menuId,
        baslik: data.Baslik || data.baslik,
        ozet: data.Ozet || data.ozet,
        kullanimNotu: data.KullanimNotu || data.kullanimNotu,
        icerikHtml: data.IcerikHtml || data.icerikHtml,
        kullanimAdimlari: data.KullanimAdimlari || data.kullanimAdimlari || [],
        dikkatEdilecekler: data.DikkatEdilecekler || data.dikkatEdilecekler || [],
        sikSorulanSorular: (data.SikSorulanSorular || data.sikSorulanSorular || []).map((q: any) => ({
          soru: q.Soru || q.soru,
          cevap: q.Cevap || q.cevap,
        })),
        kullanimSemasi: {
          onKosullar: data.KullanimSemasi?.OnKosullar || data.kullanimSemasi?.onKosullar || [],
          buSayfadaYapacaklariniz: data.KullanimSemasi?.BuSayfadaYapacaklariniz || data.kullanimSemasi?.buSayfadaYapacaklariniz || [],
          sonrakiAdimlar: data.KullanimSemasi?.SonrakiAdimlar || data.kullanimSemasi?.sonrakiAdimlar || [],
          hataRiskiYuksekAlanlar: data.KullanimSemasi?.HataRiskiYuksekAlanlar || data.kullanimSemasi?.hataRiskiYuksekAlanlar || [],
        },
        video: data.Video ? {
          url: data.Video.Url || data.Video.url,
          baslik: data.Video.Baslik || data.Video.baslik,
          aciklama: data.Video.Aciklama || data.Video.aciklama,
        } : null,
        hasVideo: data.HasVideo || data.hasVideo || false,
        hitCount: data.HitCount || data.hitCount || 0,
        ekleyenKullaniciId: data.EkleyenKullaniciId || data.ekleyenKullaniciId,
        eklenmeTarihi: data.EklenmeTarihi || data.eklenmeTarihi,
      };
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
      const payload = await response.json();
      return extractHitCount(payload);
    }

    return null;
  } catch (error) {
    console.error("Menu kullanim goruntuleme sayisi guncellenemedi:", error);
    return null;
  }
};
