export type YanıtTipi = 'evet' | 'hayir';

export interface IcKontrolSorusu {
  sira: number;
  bolum: string;
  altBolum: string;
  soruMetni: string;
  yanıtlar: {
    evet: YanıtBilgisi;
    hayir: YanıtBilgisi;
  };
}

export interface YanıtBilgisi {
  yanit: YanıtTipi;
  riskSeviyesi: string;
  aciklamaMetni: string;
  denetimAksiyonu: string;
  ilgiliBDS: string;
}

export interface SoruCevap {
  soruSira: number;
  secilenYanit: YanıtTipi;
  riskSeviyesi?: string;
  aciklamaMetni?: string;
  denetimAksiyonu?: string;
  ilgiliBDS?: string;
}

export interface IcKontrolTespitFormVeri {
  denetlenenId: number;
  denetciId: number;
  yil: number;
  soruCevaplar: SoruCevap[];
  tamamlanmaMi: boolean;
  olusturmaTarihi?: string;
}
