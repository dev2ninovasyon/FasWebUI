"use client";

import React, { useState, useEffect } from "react";
import {
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Card,
  Grid,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { IconArrowRight, IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { SaveBulguRiskiRequest, MizanVerisiRequest } from "@/api/PlanVeProgram/types";
import { createBulguRiskiBelirlemeDraft, saveBulguRiskiBelirlemeFull } from "@/api/PlanVeProgram/PlanVeProgram";

// ==== ADIM TANIMLİ ====
const STEPS_LABELS = [
  "1. Mizan Girişi",
  "2. Doğal Risk (DR)",
  "3. Kontrol Riski (KR)",
  "4. Sonuçlar & OR",
];

// ==== DOĞAL RİSK 9 FAKTÖRÜ (Excel Sayfa 2) ====
const DR_FAKTÖRLER = [
  { no: 1, ad: "İşletme yapısı — Sektör riski (üretim=5, hizmet/ticaret=2-3)", key: "sektorRiskiPuani" },
  { no: 2, ad: "Müşteri ve satıcı çeşitliliği (çok yoğunlaşma=5, dağılmış=1-2)", key: "musteriCesitlilikPuani" },
  { no: 3, ad: "İlişkili taraf işlem yoğunluğu (yüksek=5, yok=1)", key: "iliskiliTarafYogunluguPuani" },
  { no: 4, ad: "Önceki dönem denetim bulgusu (var=5, yok=1)", key: "oncerikiBulgPuani" },
  { no: 5, ad: "Yönetim dürüstlüğü & şeffaflığı (düşük=5, yüksek=1)", key: "yönetimDurustlukuPuani" },
  { no: 6, ad: "BT sistem karmaşıklığı (ERP karmaşık=5, basit=1)", key: "btSistemKarmasiklikPuani" },
  { no: 7, ad: "Olağandışı/tekrar etmeyen işlem yoğunluğu (çok=5, az=1)", key: "olaguandisiIslemYogunluguPuani" },
  { no: 8, ad: "Hukuki dava ve uyuşmazlık (çok=5, yok=1)", key: "hukukiDavaPuani" },
  { no: 9, ad: "İşletme kültürü & yapılanma olgunluğu (zayıf=5, güçlü=1)", key: "isletmeKulturesuPuani" },
];

// ==== KONTROL RİSKİ 23 SATIRI (Excel Sayfa 3) ====
const KR_KONTROL_SATIRLARI = [
  // GELİR SÜRECİ (5 satır)
  { no: 1, surecAlani: "GELİR SÜRECİ", kontrol: "Müşteri limiti — aşıldığında sipariş işleme alınmaz", agirlik: 0.08, bdsKaynagi: "BDS 315 §A56" },
  { no: 2, surecAlani: "GELİR SÜRECİ", kontrol: "Fiyat onayı — standart dışı fiyatlar üst onay gerektirir", agirlik: 0.06, bdsKaynagi: "BDS 315 §A56" },
  { no: 3, surecAlani: "GELİR SÜRECİ", kontrol: "İade/indirim onayı — yönetim onaylar, dönem kontrolü yapılır", agirlik: 0.04, bdsKaynagi: "BDS 315 §A56" },
  { no: 4, surecAlani: "GELİR SÜRECİ", kontrol: "Alacak yaşlandırma & şüpheli alacak karşılığı — yönetim inceler", agirlik: 0.05, bdsKaynagi: "BDS 505 §7" },
  { no: 5, surecAlani: "GELİR SÜRECİ", kontrol: "Müşteri mutabakat mektupları — düzenli gönderilir ve karşılaştırılır", agirlik: 0.05, bdsKaynagi: "BDS 505 §7" },
  // GİDER SÜRECİ (4 satır)
  { no: 6, surecAlani: "GİDER SÜRECİ", kontrol: "Satın alım talebi onayı — limit üzeri onay zorunlu", agirlik: 0.04, bdsKaynagi: "BDS 315 §A60" },
  { no: 7, surecAlani: "GİDER SÜRECİ", kontrol: "Satıcı mutabakatı — düzenli yapılır, farklar araştırılır", agirlik: 0.05, bdsKaynagi: "BDS 505 §7" },
  { no: 8, surecAlani: "GİDER SÜRECİ", kontrol: "Fatura-ödeme eşleştirme — onay sonrası vade ödemesi", agirlik: 0.04, bdsKaynagi: "BDS 315 §A60" },
  { no: 9, surecAlani: "GİDER SÜRECİ", kontrol: "Banka ekstresi muhasebe kaydı karşılaştırması", agirlik: 0.03, bdsKaynagi: "BDS 505 §7" },
  // STOK YÖNETİMİ (2 satır)
  { no: 10, surecAlani: "STOK YÖNETİMİ", kontrol: "Periyodik stok sayımı — bağımsız personel tarafından", agirlik: 0.05, bdsKaynagi: "BDS 501 §4-8" },
  { no: 11, surecAlani: "STOK YÖNETİMİ", kontrol: "NRD kontrolü — yıpranmış/satılamaz stok değer düşüklüğü", agirlik: 0.04, bdsKaynagi: "BDS 501 §4" },
  // MDV İŞLEMLERİ (2 satır)
  { no: 12, surecAlani: "MDV İŞLEMLERİ", kontrol: "Maddi Duran Varlık alımı — yönetim onayı ve bütçe kontrolü", agirlik: 0.04, bdsKaynagi: "BDS 501 §9" },
  { no: 13, surecAlani: "MDV İŞLEMLERİ", kontrol: "Amortisman hesaplaması — politika uygun ve tutarlı uygulanması", agirlik: 0.03, bdsKaynagi: "BDS 501 §9" },
  // FİNANSAL DURUM (2 satır)
  { no: 14, surecAlani: "FİNANSAL DURUM", kontrol: "Muhasebe kaydı ve bilanço uzlaştırması — aylık yapılır", agirlik: 0.04, bdsKaynagi: "BDS 240 §A24" },
  { no: 15, surecAlani: "FİNANSAL DURUM", kontrol: "Borç ve alacak karşılıkları — gerçekçi ve yeterli değerlendirme", agirlik: 0.04, bdsKaynagi: "BDS 505 §7" },
  // İLİŞKİLİ TARAF İŞLEMLERİ (2 satır)
  { no: 16, surecAlani: "İLİŞKİLİ TARAF", kontrol: "İlişkili taraf işlemleri — tanımlanır, kayıt ve açıklanır", agirlik: 0.05, bdsKaynagi: "BDS 550 §13" },
  { no: 17, surecAlani: "İLİŞKİLİ TARAF", kontrol: "İlişkili taraf işlem fiyatlandırması — adil ve belgelenmiş", agirlik: 0.04, bdsKaynagi: "BDS 550 §13" },
  // HER SABİT DEĞER (2 satır)
  { no: 18, surecAlani: "KHSBT DEĞERLER", kontrol: "Hazır değerler (cash, banka) — banka mutabakatı ve belgeleme", agirlik: 0.04, bdsKaynagi: "BDS 505 §7" },
  { no: 19, surecAlani: "KHSBT DEĞERLER", kontrol: "Kur işlemlerinde uygun kayıt ve değerleme", agirlik: 0.03, bdsKaynagi: "BDS 21" },
  // KAZANILMıŞ GELİRLER (2 satır)
  { no: 20, surecAlani: "KAZANILMıŞ GELİRLER", kontrol: "Gelir tanınması politikası (genel Kabul Edilen Muhasebe İlkeleri uygun)", agirlik: 0.04, bdsKaynagi: "BDS 240 §A24" },
  { no: 21, surecAlani: "KAZANILMıŞ GELİRLER", kontrol: "Hasılat kesintileri — tanımlanır ve uygun şekilde kaydedilir", agirlik: 0.03, bdsKaynagi: "BDS 505 §7" },
  // KUluPLu KONTROLLER (2 satır)
  { no: 22, surecAlani: "ÖZEL KONTROLLER", kontrol: "Yasal uyum — vergi, çalışan, sosyal sigorta kontrolleri", agirlik: 0.03, bdsKaynagi: "BDS 250 §1" },
  { no: 23, surecAlani: "ÖZEL KONTROLLER", kontrol: "Bağımsız denetçi önerilerinin uygulanması — izleme", agirlik: 0.02, bdsKaynagi: "BDS 260 §1" },
];

export default function BulguRiskiStepperFormV2() {
  const [activeStep, setActiveStep] = useState(0);

  // ===== SAYFA 1: MİZAN VERİSİ =====
  const [mizan, setMizan] = useState<MizanVerisiRequest>({
    netSatislar: 5000000,
    toplamAktif: 0,
    ticariAlacaklar: 0,
    stokToplam: 0,
    maddiDuranVarliklarNet: 0,
    bankaKasa: 0,
    ticariBorc: 0,
    donemKarZarar: 0,
    netSatislarOncekiDonem: 4000000,
  });

  const [onemlilik, setOnemlilik] = useState({
    pm: 0,
    om: 0,
    esik: 0,
  });

  // ===== SAYFA 2: DOĞAL RİSK =====
  const [drPuanlar, setDRPuanlar] = useState<Record<string, number>>({});
  const [dr, setDR] = useState(0);
  const [drSeviye, setDRSeviye] = useState("");

  // ===== SAYFA 3: KONTROL RİSKİ =====
  const [krPuanlar, setKRPuanlar] = useState<Record<number, number>>({});
  const [kr, setKR] = useState(0);
  const [krSeviye, setKRSeviye] = useState("");

  // ===== SAYFA 4: SONUÇLAR =====
  const [or, setOR] = useState(0);
  const [prosedur, setProsedur] = useState("");
  const [ornekleme, setOrnekleme] = useState("");

  // Önemlilik hesapla
  useEffect(() => {
    if (mizan.netSatislar && mizan.netSatislar > 0) {
      const pm = mizan.netSatislar * 0.01;
      setOnemlilik({
        pm,
        om: pm * 0.75,
        esik: pm * 0.005,
      });
    }
  }, [mizan.netSatislar]);

  const handleNext = () => {
    if (activeStep < STEPS_LABELS.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      // Verileri request objesine dönüştür
      const request: SaveBulguRiskiRequest = {
        denetciId: 1,  // TODO: User'dan al
        denetlenenId: 1,  // TODO: Form'dan al
        yil: new Date().getFullYear(),
        mizanVerisi: mizan,
        onemlilik_PM: onemlilik.pm,
        onemlilik_OM: onemlilik.om,
        onemlilik_Esik: onemlilik.esik,
        dogalRiskPuan: drPuanlar as any,
        dogalRisk: dr,
        dogalRiskSeviyesi: drSeviye,
        kontrolRiskiSatirlari: Object.entries(krPuanlar).map(([no, puan]) => ({
          satirNumarasi: parseInt(no),
          puani: puan,
        })) as any,
        kontrolRiski: kr,
        kontrolRiskiSeviyesi: krSeviye,
        ortayaCikaramama_OR: or,
        onerilen_DenetimProseduru: prosedur,
        orneklemeOrani: parseFloat(ornekleme),
        tamamMi: true,
      };

      const result = await saveBulguRiskiBelirlemeFull(request);
      alert("Veriler başarıyla kaydedildi!");
    } catch (error) {
      alert("Kaydetme hatası: " + error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* STEPPER */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Divider sx={{ mb: 3 }} />

      {/* STEP CONTENTS */}
      <Box sx={{ minHeight: "700px", mb: 3 }}>
        {activeStep === 0 && (
          <Step1Mizan mizan={mizan} setMizan={setMizan} onemlilik={onemlilik} />
        )}
        {activeStep === 1 && (
          <Step2DR drPuanlar={drPuanlar} setDRPuanlar={setDRPuanlar} setDR={setDR} setDRSeviye={setDRSeviye} onemlilik={onemlilik} />
        )}
        {activeStep === 2 && (
          <Step3KR krPuanlar={krPuanlar} setKRPuanlar={setKRPuanlar} setKR={setKR} setKRSeviye={setKRSeviye} />
        )}
        {activeStep === 3 && (
          <Step4Sonuc dr={dr} kr={kr} or={or} setOR={setOR} prosedur={prosedur} setProsedur={setProsedur} ornekleme={ornekleme} setOrnekleme={setOrnekleme} />
        )}
      </Box>

      {/* NAVIGATION BUTTONS */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<IconArrowLeft size={20} />}
          variant="outlined"
        >
          Geri
        </Button>

        {activeStep < STEPS_LABELS.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<IconArrowRight size={20} />}
          >
            İleri
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={<IconCheck size={20} />}
            onClick={handleSave}
          >
            Kaydet & Tamamla
          </Button>
        )}
      </Box>
    </Paper>
  );
}

// ========== STEP 1: MİZAN ==========
function Step1Mizan({ mizan, setMizan, onemlilik }: any) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        SAYFA 1: MİZAN VERİSİ
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Sarı hücreleri doldurun. Sistem önemlilik otomatik hesaplar.
      </Alert>

      <TableContainer sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#003366" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Alan</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Cari Dönem</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Önceki Dönem</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>BDS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ bgcolor: "#FFFF99" }}>
              <TableCell sx={{ fontWeight: 600 }}>1. Net Satışlar (TL)</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={mizan.netSatislar || ""}
                  onChange={(e) =>
                    setMizan({
                      ...mizan,
                      netSatislar: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={mizan.netSatislarOncekiDonem || ""}
                  onChange={(e) =>
                    setMizan({
                      ...mizan,
                      netSatislarOncekiDonem: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  variant="outlined"
                />
              </TableCell>
              <TableCell>BDS 240 §A31</TableCell>
            </TableRow>
            {[
              { ad: "Toplam Aktif (TL)", key: "toplamAktif", bds: "BDS 315 §A35" },
              { ad: "Ticari Alacaklar (TL)", key: "ticariAlacaklar", bds: "BDS 505 §7" },
              { ad: "Stok Toplam (TL)", key: "stokToplam", bds: "BDS 501 §4" },
              { ad: "MDV Net (TL)", key: "maddiDuranVarliklarNet", bds: "BDS 501 §9" },
              { ad: "Banka & Kasa (TL)", key: "bankaKasa", bds: "BDS 505 §7" },
              { ad: "Ticari Borçlar (TL)", key: "ticariBorc", bds: "BDS 330 §18" },
              { ad: "Dönem Kâr/Zarar (TL)", key: "donemKarZarar", bds: "BDS 240 §A24" },
            ].map((row, idx) => (
              <TableRow key={idx} sx={{ bgcolor: "#FFFF99" }}>
                <TableCell sx={{ fontWeight: 600 }}>{idx + 2}. {row.ad}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={mizan[row.key as keyof MizanVerisiRequest] || ""}
                    onChange={(e) =>
                      setMizan({
                        ...mizan,
                        [row.key]: e.target.value ? parseFloat(e.target.value) : 0,
                      })
                    }
                  />
                </TableCell>
                <TableCell>—</TableCell>
                <TableCell>{row.bds}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ÖNEMLİLİK HESAPLAMASI */}
      <Card sx={{ p: 3, bgcolor: "#E3F2FD", border: "3px solid #1565C0", mt: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 2, fontSize: "1rem" }}>
          ÖNEMLİLİK HESAPLAMASI — BDS 200 §A24-A31 • BDS 320 §10-11
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: 2 }}>
          Önemlilik (PM), denetçinin denetimin kapsam ve yoğunluğunu belirlemede kullandığı en önemli ölçüdür.
          Uygulanabilir finansal raporlama çerçevesi üzerinde etkileme olabilecek yanlışlıkları tanımlamada yardımcı olur.
        </Typography>
        
        {/* Formülü Göster */}
        <Box sx={{ p: 2, bgcolor: "white", border: "1px solid #90CAF9", borderRadius: 1, mb: 2 }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#555", mb: 1 }}>
            <strong>Formüller:</strong>
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", fontFamily: "monospace", color: "#1565C0", mb: 0.5 }}>
            PM = Net Satışlar × %1
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", fontFamily: "monospace", color: "#1565C0", mb: 0.5 }}>
            OM = PM × %75 (Çalışma Önemliliği / Performans Materyalitesi)
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", fontFamily: "monospace", color: "#1565C0" }}>
            Eşik = PM × %50 (Hata Muhaselebilirlik Eşiği)
          </Typography>
        </Box>

        {/* Hesaplanan Değerler */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2.5, bgcolor: "#FFF9C4", border: "2px solid #F57C00", borderRadius: 1 }}>
              <Typography sx={{ fontSize: "0.8rem", color: "#888", letterSpacing: "0.5px" }}>
                ÖNEMLİLİK (PM)
              </Typography>
              <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "#D32F2F", mt: 0.5 }}>
                {onemlilik.pm.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#666", mt: 0.5 }}>
                ÖNEMLİ YAPILACAK ÖĞE DİPLOM TUTARI
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2.5, bgcolor: "#E8F5E9", border: "2px solid #4CAF50", borderRadius: 1 }}>
              <Typography sx={{ fontSize: "0.8rem", color: "#888", letterSpacing: "0.5px" }}>
                ÇALIŞMA ÖNEMLİLİĞİ (OM)
              </Typography>
              <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "#388E3C", mt: 0.5 }}>
                {onemlilik.om.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#666", mt: 0.5 }}>
                DENETIM PROSEDÜR PLANLAMA TUTARI
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2.5, bgcolor: "#F3E5F5", border: "2px solid #7B1FA2", borderRadius: 1 }}>
              <Typography sx={{ fontSize: "0.8rem", color: "#888", letterSpacing: "0.5px" }}>
                HATA MUHASEBEL. EŞIK
              </Typography>
              <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "#7B1FA2", mt: 0.5 }}>
                {onemlilik.esik.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#666", mt: 0.5 }}>
                DÜZELTİLMESİ GEREKEN HATA EŞİĞİ
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Açıklama */}
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: "0.85rem" }}>
            <strong>Not:</strong> Yukarıdaki değerler, çalışma tarafından denetlenen işletmenin risk profili dikkate alınarak,
            yönetim tarafından değerlendirmes yapılacaktır. Bu değerler, kullanıcı tarafından gerekirse reel değere göre ayarlanabilir (BDS 320 §9).
          </Typography>
        </Alert>
      </Card>
    </Box>
  );
}

// ========== STEP 2: DOĞAL RİSK =====
function Step2DR({ drPuanlar, setDRPuanlar, setDR, setDRSeviye, onemlilik }: any) {
  const [agirlikliToplam, setAgirlikliToplam] = useState(0);
  const [agirlikToplami, setAgirlikToplami] = useState(0);
  const [dr, setDRLocal] = useState(0);
  const [drSeviye, setDRSeviyeLocal] = useState("Puan girin");

  // DR hesapla
  useEffect(() => {
    if (Object.keys(drPuanlar).length === 0) {
      setDR(0);
      setDRSeviye("Puan girin");
      setAgirlikliToplam(0);
      setAgirlikToplami(0);
      setDRLocal(0);
      setDRSeviyeLocal("Puan girin");
      return;
    }

    const ağırlıklar: Record<string, number> = {
      sektorRiskiPuani: 0.15,
      musteriCesitlilikPuani: 0.12,
      iliskiliTarafYogunluguPuani: 0.12,
      oncerikiBulgPuani: 0.13,
      yönetimDurustlukuPuani: 0.10,
      btSistemKarmasiklikPuani: 0.08,
      olaguandisiIslemYogunluguPuani: 0.10,
      hukukiDavaPuani: 0.07,
      isletmeKulturesuPuani: 0.08,
    };

    let agTop = 0;
    let agwTop = 0;

    Object.entries(drPuanlar).forEach(([key, puan]) => {
      if (puan && ağırlıklar[key]) {
        agwTop += (puan as number) * ağırlıklar[key];
        agTop += ağırlıklar[key];
      }
    });

    setAgirlikToplami(agTop);
    setAgirlikliToplam(agwTop);

    if (agTop === 0) {
      setDR(0);
      setDRSeviye("Puan girin");
      setDRLocal(0);
      setDRSeviyeLocal("Puan girin");
      return;
    }

    // DR = Ağırlıklı Toplam / 5
    const drValue = agwTop / 5;
    const drNorm = Math.min(drValue, 1);
    setDR(drNorm);
    setDRLocal(drNorm);

    // Risk seviyesi
    if (drNorm <= 0.20) {
      setDRSeviye("Az Riskli");
      setDRSeviyeLocal("Az Riskli");
    } else if (drNorm <= 0.50) {
      setDRSeviye("Orta Riskli");
      setDRSeviyeLocal("Orta Riskli");
    } else {
      setDRSeviye("Riskli");
      setDRSeviyeLocal("Riskli");
    }
  }, [drPuanlar]);

  const ağırlıklarMap: Record<string, { ağırlık: number; bds: string }> = {
    sektorRiskiPuani: { ağırlık: 0.15, bds: "BDS 315 §A36" },
    musteriCesitlilikPuani: { ağırlık: 0.12, bds: "BDS 315 §A36" },
    iliskiliTarafYogunluguPuani: { ağırlık: 0.12, bds: "BDS 550 §13" },
    oncerikiBulgPuani: { ağırlık: 0.13, bds: "BDS 315 §A44" },
    yönetimDurustlukuPuani: { ağırlık: 0.10, bds: "BDS 315 §A39" },
    btSistemKarmasiklikPuani: { ağırlık: 0.08, bds: "BDS 315 §A84" },
    olaguandisiIslemYogunluguPuani: { ağırlık: 0.10, bds: "BDS 315 §A47" },
    hukukiDavaPuani: { ağırlık: 0.07, bds: "BDS 501 §9" },
    isletmeKulturesuPuani: { ağırlık: 0.08, bds: "BDS 315 §A35" },
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        DOĞAL RİSK (DR) PUANLAMA EKRANI — BDS 315 §A35-A42
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Sarı hücrelere 1-5 arası puan girin. 1=Çok Düşük Risk | 5=Çok Yüksek Risk
      </Alert>

      {/* Mizan'dan Otomatik */}
      <Box sx={{ bgcolor: "#E8F5E9", p: 2, mb: 3, border: "1px solid #81C784" }}>
        <Typography sx={{ fontSize: "0.9rem", mb: 1 }}>
          <strong>Mizan'dan Otomatik:</strong> Net Satış → Önemlilik hesabı
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={{ fontSize: "0.9rem" }}>Net Satışlar: <strong>{onemlilik.pm ? (onemlilik.pm / 0.01).toLocaleString("tr-TR") : "—"}</strong> TL</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={{ fontSize: "0.9rem" }}>PM = <strong>{onemlilik.pm?.toLocaleString("tr-TR") || "—"}</strong> TL</Typography>
          </Grid>
        </Grid>
      </Box>

      <TableContainer sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#FF9800" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }} width="5%">No</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Doğal Risk Faktörü</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align="center" width="10%">Puan (1-5)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align="center" width="10%">Ağırlık</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align="center" width="12%">Ağırlıklı Puan</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} width="12%">BDS Kaynağı</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} width="15%">Belgeden Risk Düzeyi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DR_FAKTÖRLER.map((faktör, idx) => {
              const puan = drPuanlar[faktör.key] || null;
              const ağırlıkInfo = ağırlıklarMap[faktör.key];
              const ağırlıklıPuan = puan && ağırlıkInfo ? (puan * ağırlıkInfo.ağırlık).toFixed(2) : "—";

              return (
                <TableRow key={idx} sx={{ bgcolor: "#FFFF99" }}>
                  <TableCell sx={{ fontWeight: 600 }}>{faktör.no}</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem" }}>{faktör.ad}</TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 1, max: 5 }}
                      value={puan || ""}
                      onChange={(e) =>
                        setDRPuanlar({
                          ...drPuanlar,
                          [faktör.key]: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      sx={{ width: "50px" }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {(ağırlıkInfo?.ağırlık * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.85rem", bgcolor: "#BBDEFB", fontWeight: 600 }}>
                    {ağırlıklıPuan}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>{ağırlıkInfo?.bds}</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", color: "#F57C00", fontWeight: 600 }}>
                    {puan === 1 || puan === 2 ? "Risksiz" : puan === 3 ? "Orta Riskli" : puan === 4 || puan === 5 ? "Riskli" : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ALT SATIR: DR HESAPLAMA */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Box sx={{ bgcolor: "#FF9800", color: "white", p: 2, flex: 1, fontWeight: 600, fontSize: "0.9rem" }}>
          DR = Ağırlıklı Ortalama / 5 (0-1 arası)
        </Box>
        <Box sx={{ bgcolor: "#FFF3CD", p: 2, flex: 0.3, border: "2px solid #FF9800", fontWeight: 600, textAlign: "center" }}>
          <Typography sx={{ fontSize: "1.2rem", color: "#D32F2F" }}>
            {(dr || 0).toFixed(3)}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: "#F5F5F5", p: 2, flex: 0.3, fontWeight: 600, textAlign: "center", color: drSeviye === "Az Riskli" ? "#4CAF50" : drSeviye === "Orta Riskli" ? "#FF9800" : "#D32F2F" }}>
          <Typography sx={{ fontSize: "0.95rem" }}>
            {drSeviye}
          </Typography>
        </Box>
      </Box>

      <Alert severity="info">
        <strong>NOT:</strong> 10 faktörden kaç tanesi puanlandıysa onlarla ağırlıklı ortalama alınır.
      </Alert>
    </Box>
  );
}

// ========== STEP 3: KONTROL RİSKİ =====
function Step3KR({ krPuanlar, setKRPuanlar, setKR, setKRSeviye }: any) {
  const [agirlikliToplam, setAgirlikliToplam] = useState(0);
  const [agirlikToplami, setAgirlikToplami] = useState(0);
  const [kr, setKRLocal] = useState(0);

  useEffect(() => {
    if (Object.keys(krPuanlar).length === 0) {
      setKR(0);
      setKRSeviye("Puan girin");
      setAgirlikliToplam(0);
      setAgirlikToplami(0);
      setKRLocal(0);
      return;
    }

    let agTop = 0;
    let agwTop = 0;

    KR_KONTROL_SATIRLARI.forEach((satir) => {
      const puan = krPuanlar[satir.no];
      if (puan) {
        agwTop += puan * satir.agirlik;
        agTop += satir.agirlik;
      }
    });

    setAgirlikToplami(agTop);
    setAgirlikliToplam(agwTop);

    if (agTop === 0) {
      setKR(0);
      setKRSeviye("Puan girin");
      setKRLocal(0);
      return;
    }

    // KR = Ağırlıklı Toplam / 5
    const krVal = agwTop / 5;
    const krNorm = Math.min(krVal, 1);
    setKRLocal(krNorm);
    setKR(krNorm);

    // Risk seviyesi
    if (krNorm <= 0.30) setKRSeviye("Az Riskli");
    else if (krNorm <= 0.70) setKRSeviye("Orta Riskli");
    else setKRSeviye("Riskli");
  }, [krPuanlar]);

  const riskDuzeyi = (puan: number | null | undefined) => {
    if (!puan) return "—";
    if (puan === 1) return "Çok Güçlü";
    if (puan === 2) return "Az Riskli";
    if (puan === 3) return "Orta Riskli";
    if (puan === 4) return "Riskli";
    return "Çok Zayıf";
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        KONTROL RİSKİ (KR) PUANLAMA EKRANI — BDS 315 §A56-A80 | BDS 330 §8-17
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Sarı hücrelere 1-5 arası puan girin. 1=Kontroller Çok Güçlü | 3=Orta | 5=Kontrol Yok / Çok Zayıf
      </Alert>

      <TableContainer sx={{ mb: 2, maxHeight: 600, overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead sx={{ bgcolor: "#1565C0" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }} width="5%">No</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Süreç / Kontrol Alanı + Kontrol Satırı (Belgeden)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align="center" width="12%">Kontrol Puanı (1-5)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align="center" width="10%">Ağırlık</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align="center" width="12%">Ağırlıklı Puan</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} width="12%">BDS Kaynağı</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} width="12%">Süreç Riski</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {KR_KONTROL_SATIRLARI.map((satir) => {
              const puan = krPuanlar[satir.no] || null;
              const agirlikliPuan = puan ? (puan * satir.agirlik).toFixed(2) : "—";
              const riskDuzeyiRengi = 
                satir.surecAlani === "GELİR SÜRECİ" ? "#FFF9C4" :
                satir.surecAlani === "GİDER SÜRECİ" ? "#F0F4C3" :
                satir.surecAlani === "STOK YÖNETİMİ" ? "#E0F2F1" :
                satir.surecAlani === "MDV İŞLEMLERİ" ? "#F3E5F5" :
                satir.surecAlani === "FİNANSAL DURUM" ? "#E3F2FD" :
                satir.surecAlani === "İLİŞKİLİ TARAF" ? "#FCE4EC" :
                satir.surecAlani === "KHSBT DEĞERLER" ? "#FFF3E0" :
                satir.surecAlani === "KAZANILMıŞ GELİRLER" ? "#F1F8E9" :
                "#FFFF99";

              return (
                <TableRow key={satir.no} sx={{ bgcolor: riskDuzeyiRengi }}>
                  <TableCell sx={{ fontWeight: 600 }}>{satir.no}</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>
                    <Box sx={{ fontWeight: 600, color: "#D32F2F", mb: 0.5, fontSize: "0.8rem" }}>
                      [{satir.surecAlani}]
                    </Box>
                    {satir.kontrol}
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 1, max: 5 }}
                      value={puan || ""}
                      onChange={(e) =>
                        setKRPuanlar({
                          ...krPuanlar,
                          [satir.no]: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      sx={{ width: "50px" }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {satir.agirlik.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.85rem", bgcolor: "#E1F5FE", fontWeight: 600 }}>
                    {agirlikliPuan}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>{satir.bdsKaynagi}</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", color: "#D32F2F", fontWeight: 600 }}>
                    {riskDuzeyi(puan)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ALT SATIR: KR HESAPLAMA */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, mt: 2 }}>
        <Box sx={{ bgcolor: "#1565C0", color: "white", p: 2, flex: 1, fontWeight: 600, fontSize: "0.9rem" }}>
          KR = Ağırlıklı Ortalama / 5 (0-1 arası)
        </Box>
        <Box sx={{ bgcolor: "#FFF3CD", p: 2, flex: 0.3, border: "2px solid #1565C0", fontWeight: 600, textAlign: "center" }}>
          <Typography sx={{ fontSize: "1.2rem", color: "#D32F2F" }}>
            {(kr || 0).toFixed(3)}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: "#F5F5F5", p: 2, flex: 0.3, fontWeight: 600, textAlign: "center", color: "#FF9800" }}>
          <Typography sx={{ fontSize: "0.95rem" }}>
            Riskli
          </Typography>
        </Box>
      </Box>

      <Alert severity="info">
        <strong>NOT:</strong> 23 kontrolün hepsini doldurmanıza gerek yok. Doldurduklarınızla ağırlıklı ortalama alınır.
      </Alert>
    </Box>
  );
}

// ========== STEP 4: SONUÇLAR =====
function Step4Sonuc({ dr, kr, or, setOR, prosedur, setProsedur, ornekleme, setOrnekleme }: any) {
  const [kdr, setKdr] = useState(0.05);

  useEffect(() => {
    if (dr && kr && dr > 0 && kr > 0) {
      const orVal = kdr / (dr * kr);
      setOR(Math.min(orVal, 1));
      
      // Prosedür belirle
      if (orVal <= 0.15) setProsedur("Detaylı Prosedür | %31–50 | En Yüksek");
      else if (orVal <= 0.25) setProsedur("Detaylı Prosedür | %26–30 | Yüksek");
      else if (orVal <= 0.4) setProsedur("Kısmen Detaylı + Analitik | %21–25 | Orta-Yüksek");
      else if (orVal <= 0.6) setProsedur("Kısmen Detaylı + Analitik | %16–20 | Orta");
      else if (orVal <= 0.8) setProsedur("Analitik İnceleme | %11–15 | Düşük");
      else setProsedur("Analitik İnceleme | %0–10 | Minimum");
    }
  }, [dr, kr, kdr]);

  const getProsedurDetails = () => {
    if (!prosedur) return { turu: "", ornekleme: "", kanit: "" };
    const parts = prosedur.split(" | ");
    return {
      turu: parts[0] || "",
      ornekleme: parts[1] || "",
      kanit: parts[2] || ""
    };
  };

  const prosedurDetails = getProsedurDetails();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        SAYFA 4: SONUÇLAR VE OR HESABI
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Aşağıdaki değerler Adım 2 ve 3'ten otomatik geliyor. Hiçbir şey yazmanıza gerek yok.
      </Alert>

      {/* ===== TABLO 1: SONUÇ VERİLERİ ===== */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, mt: 3 }}>
        TABLO 1: DENETIM RİSKİ BİLEŞENLERİ — BDS 200 §A38-A42
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: 2 }}>
        Aşağıdaki tabloda Doğal Risk (DR), Kontrol Riski (KR) ve Kabul Edilebilir Denetim Riski (KDR) gösterilmektedir.
        Bu değerler Ortaya Çıkaramama Riski (OR) hesaplamasında kullanılır.
      </Typography>
      <TableContainer sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#1A237E" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Kalem</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align="right">Değer</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Niteliği</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Kaynak</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ bgcolor: "#E8F5E9" }}>
              <TableCell sx={{ fontWeight: 600 }}>1. Doğal Risk (DR)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {(dr * 100).toFixed(2)}%
              </TableCell>
              <TableCell sx={{ color: "#FF6F00", fontWeight: 600 }}>Hesaplanan</TableCell>
              <TableCell sx={{ fontSize: "0.85rem" }}>Sayfa 2: Risklilendirme</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: "#E8F5E9" }}>
              <TableCell sx={{ fontWeight: 600 }}>2. Kontrol Riski (KR)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {(kr * 100).toFixed(2)}%
              </TableCell>
              <TableCell sx={{ color: "#FF6F00", fontWeight: 600 }}>Hesaplanan</TableCell>
              <TableCell sx={{ fontSize: "0.85rem" }}>Sayfa 3: Kontrol Değerlendirmesi</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: "#F3E5F5" }}>
              <TableCell sx={{ fontWeight: 600 }}>3. KDR (Kabul Edilebilir Denetim Riski)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#7B1FA2" }}>5.00%</TableCell>
              <TableCell sx={{ color: "#7B1FA2", fontWeight: 600 }}>Sabit Değer</TableCell>
              <TableCell sx={{ fontSize: "0.85rem" }}>BDS 200 §A38-A39 (ADAY)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ===== TABLO 2: OR HESAPLAMA ===== */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, mt: 3 }}>
        TABLO 2: ORTAYA ÇIKARAMAMA RİSKİ (OR) HESABI — BDS 200 §A40-A42
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: 2 }}>
        OR, Doğal Risk (DR) ve Kontrol Riski (KR)'nın fonksiyonu olarak hesaplanır. Denetçi riski = DR × KR × OR formülüne göre
        toplam denetleme riski belirlenmiştir.
      </Typography>
      <Card sx={{ p: 3, bgcolor: "#F3E5F5", border: "3px solid #7B1FA2", mb: 4 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 2, bgcolor: "white", border: "1px solid #E0E0E0", borderRadius: 1, mb: 2 }}>
              <Typography sx={{ fontSize: "0.9rem", color: "#555", mb: 1 }}>
                <strong>Formül:</strong>
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontFamily: "monospace", color: "#1565C0", fontWeight: 600 }}>
                OR = KDR ÷ (DR × KR)
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#666", mt: 1 }}>
                Burada KDR = Kabul Edilebilir Denetim Riski (sabit: %5)
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: 1 }}>
              <strong>Değerler:</strong>
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#666", ml: 2 }}>
              • DR (Doğal Risk) = {(dr || 0).toFixed(3)}  ({(dr * 100).toFixed(2)}%)
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#666", ml: 2 }}>
              • KR (Kontrol Riski) = {(kr || 0).toFixed(3)}  ({(kr * 100).toFixed(2)}%)
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#666", ml: 2, mb: 2 }}>
              • KDR = 0.05 (5%)
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 2, bgcolor: "white", border: "2px solid #7B1FA2", borderRadius: 1 }}>
              <Typography sx={{ fontSize: "0.8rem", color: "#999", letterSpacing: "0.5px" }}>
                ↓ SONUÇ: ORTAYA ÇIKARAMAMA RİSKİ ↓
              </Typography>
              <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "#7B1FA2" }}>
                {(or * 100).toFixed(2)}%
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#999", mt: 0.5 }}>
                (0% ile 100% arasında bir değer)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* ===== TABLO 3: PROSEDÜR ÖNERİSİ ===== */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, mt: 3 }}>
        TABLO 3: OTOMATİK PROSEDÜR ÖNERİSİ — OR DEĞERİNE GÖRE DENETİM STRATEJİSİ BELIRLEMESI
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: 2 }}>
        Hesaplanan OR değerine göre aşağıdaki prosedützlerden uygun olan seçilir. Yüksek OR = daha az detaylı prosedür,
        Düşük OR = daha detaylı prosedür anlamına gelir.
      </Typography>
      <TableContainer sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#C62828" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>OR Aralığı</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Denetim Prosedürü</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Örnekleme Oranı</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Kanıt Yoğunluğu</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>BDS Kaynağı</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ bgcolor: or <= 0.15 ? "#FFCDD2" : "white", fontWeight: or <= 0.15 ? 700 : 400 }}>
              <TableCell sx={{ fontWeight: 600 }}>0% – %15</TableCell>
              <TableCell><strong>Detaylı Prosedür</strong></TableCell>
              <TableCell>%31–50</TableCell>
              <TableCell>En Yüksek</TableCell>
              <TableCell sx={{ fontSize: "0.8rem" }}>BDS 330 §18</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: (or > 0.15 && or <= 0.25) ? "#FFCDD2" : "white", fontWeight: (or > 0.15 && or <= 0.25) ? 700 : 400 }}>
              <TableCell sx={{ fontWeight: 600 }}>%15–%25</TableCell>
              <TableCell><strong>Detaylı Prosedür</strong></TableCell>
              <TableCell>%26–30</TableCell>
              <TableCell>Yüksek</TableCell>
              <TableCell sx={{ fontSize: "0.8rem" }}>BDS 330 §19</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: (or > 0.25 && or <= 0.4) ? "#FFCDD2" : "white", fontWeight: (or > 0.25 && or <= 0.4) ? 700 : 400 }}>
              <TableCell sx={{ fontWeight: 600 }}>%25–%40</TableCell>
              <TableCell><strong>Kısmen Detaylı + Analitik</strong></TableCell>
              <TableCell>%21–25</TableCell>
              <TableCell>Orta-Yüksek</TableCell>
              <TableCell sx={{ fontSize: "0.8rem" }}>BDS 330 §20</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: (or > 0.4 && or <= 0.6) ? "#FFCDD2" : "white", fontWeight: (or > 0.4 && or <= 0.6) ? 700 : 400 }}>
              <TableCell sx={{ fontWeight: 600 }}>%40–%60</TableCell>
              <TableCell><strong>Kısmen Detaylı + Analitik</strong></TableCell>
              <TableCell>%16–20</TableCell>
              <TableCell>Orta</TableCell>
              <TableCell sx={{ fontSize: "0.8rem" }}>BDS 330 §20</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: (or > 0.6 && or <= 0.8) ? "#FFCDD2" : "white", fontWeight: (or > 0.6 && or <= 0.8) ? 700 : 400 }}>
              <TableCell sx={{ fontWeight: 600 }}>%60–%80</TableCell>
              <TableCell><strong>Analitik İncelemeye Dayalı</strong></TableCell>
              <TableCell>%11–15</TableCell>
              <TableCell>Düşük</TableCell>
              <TableCell sx={{ fontSize: "0.8rem" }}>BDS 530 §4-5</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: or > 0.8 ? "#FFCDD2" : "white", fontWeight: or > 0.8 ? 700 : 400 }}>
              <TableCell sx={{ fontWeight: 600 }}>%80–100%</TableCell>
              <TableCell><strong>Analitik İncelemeye Dayalı</strong></TableCell>
              <TableCell>%0–10</TableCell>
              <TableCell>Minimum</TableCell>
              <TableCell sx={{ fontSize: "0.8rem" }}>BDS 530 §4-5</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ===== ÖNERİ KUTUSU ===== */}
      {prosedurDetails.turu && (
        <Alert severity="success" sx={{ mb: 3, p: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1, fontSize: "1rem", color: "#2E7D32" }}>
            ✓ ÖNERİLEN DENETIM STRATEJİSİ
          </Typography>
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 1.5, bgcolor: "#FFF9C4", border: "1px solid #FFB300", borderRadius: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                  <strong>Denetim Prosedürü:</strong>
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#1565C0", fontWeight: 600 }}>
                  {prosedurDetails.turu}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 1.5, bgcolor: "#E8F5E9", border: "1px solid #4CAF50", borderRadius: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                  <strong>Örnekleme Oranı:</strong>
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#E65100", fontWeight: 600 }}>
                  {prosedurDetails.ornekleme}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 1.5, bgcolor: "#F3E5F5", border: "1px solid #7B1FA2", borderRadius: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                  <strong>Kanıt Yoğunluğu:</strong>
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#7B1FA2", fontWeight: 600 }}>
                  {prosedurDetails.kanit}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ fontSize: "0.8rem", color: "#666", mt: 1 }}>
                <em>Not: Bu öneriler BDS 200 §A40-A42 ve BDS 530 §4-5'e göre hazırlanmıştır. Denetçi,
                hesaplanan OR'in yanı sıra kalitatif faktörleri de dikkate alarak prosedür yoğunluğunu belirleyebilir.</em>
              </Typography>
            </Grid>
          </Grid>
        </Alert>
      )}
    </Box>
  );
}
