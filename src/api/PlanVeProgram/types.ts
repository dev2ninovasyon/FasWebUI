// SaveBulguRiskiRequest types for stepper form

export interface MizanVerisiRequest {
  netSatislar?: number;
  toplamAktif?: number;
  ticariAlacaklar?: number;
  stokToplam?: number;
  maddiDuranVarliklarNet?: number;
  bankaKasa?: number;
  ticariBorc?: number;
  donemKarZarar?: number;
  netSatislarOncekiDonem?: number;
  degisimYuzde?: number;
}

export interface DoğalRiskPuanRequest {
  sektorRiskiPuani?: number;
  musteriCesitlilikPuani?: number;
  iliskiliTarafYogunluguPuani?: number;
  oncerikiBulgPuani?: number;
  yönetimDurustlukuPuani?: number;
  btSistemKarmasiklikPuani?: number;
  olaguandisiIslemYogunluguPuani?: number;
  hukukiDavaPuani?: number;
  isletmeKulturesuPuani?: number;
}

export interface KontrolRiskiSatiriRequest {
  satirNumarasi: number;
  surecAlani?: string;
  kontrolTanımı?: string;
  puani?: number;
  agirlik?: number;
  bdsKaynagi?: string;
}

export interface SaveBulguRiskiRequest {
  denetciId: number;
  denetlenenId: number;
  yil: number;
  mizanVerisi?: MizanVerisiRequest;
  onemlilik_PM?: number;
  onemlilik_OM?: number;
  onemlilik_Esik?: number;
  dogalRiskPuan?: DoğalRiskPuanRequest;
  dogalRisk?: number;
  dogalRiskSeviyesi?: string;
  kontrolRiskiSatirlari?: KontrolRiskiSatiriRequest[];
  kontrolRiski?: number;
  kontrolRiskiSeviyesi?: string;
  kabulEdilDenetimRiski?: number;
  ortayaCikaramama_OR?: number;
  onerilen_DenetimProseduru?: string;
  orneklemeOrani?: number;
  sonucMetni?: string;
  tamamMi?: boolean;
}
