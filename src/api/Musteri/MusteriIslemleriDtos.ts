// OldDb DTOs
export interface OldDenetlenenListItemDto {
  id: number;
  firmaAdi: string;
  denetciId?: number;
}

export interface OldDenetlenenDetayDto {
  id: number;
  firmaAdi?: string;
  yetkili?: string;
  tel?: string;
  fax?: string;
  adres?: string;
  email?: string;
  webAdresi?: string;
  ticaretSicilNo?: string;
  vergiDairesi?: string;
  vergiNo?: string;
  arsivId?: string;
  aktifmi?: boolean;
  sektor1Id?: number;
  sektor2Id?: number;
  sektor3Id?: number;
  konsolide?: boolean;
  konsolideAnaSirketmi?: boolean;
  konsolideAltSirketmi?: boolean;
}

export interface MusteriEkleFormData {
  id: number;
  firmaAdi: string;
  yetkili?: string;
  tel?: string;
  fax?: string;
  adres?: string;
  email?: string;
  webAdresi?: string;
  ticaretSicilNo?: string;
  vergiDairesi?: string;
  vergiNo?: string;
  arsivId?: string;
  aktifmi?: boolean;
  sektor1Id?: number;
  sektor2Id?: number;
  sektor3Id?: number;
  konsolideMi: "Evet" | "Hayır";
  konsolideTipi: "Ana Şirket" | "Alt Şirket";
}
