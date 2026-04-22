"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Grid,
  TextField,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  SaveBulguRiskiRequest,
  MizanVerisiRequest,
  DoğalRiskPuanRequest,
  KontrolRiskiSatiriRequest,
  hesaplaOnemlilik,
  saveBulguRiskiBelirleme,
  getBulguRiskiBelirleme,
  hesaplaOrVeProsedur
} from "@/api/PlanVeProgram/BulguRiskiBelirleme";
import { getOnemlilikExcelModel } from "@/api/DenetimKanitlari/DenetimKanitlari";
import BelgeKontrolCard from "./Cards/BelgeKontrolCard";
import IslemlerCardHtml from "./Cards/IslemlerCardHtml";
import CalismaKagitiHotTable from "@/components/CalismaKagitiHotTable";
import { NumericCellType } from "handsontable/cellTypes";
import { registerCellType } from "handsontable/cellTypes";

registerCellType("numeric", NumericCellType);

const steps = [
  "Mizan Verisi",
  "Doğal Risk Puanlama",
  "Kontrol Riski Puanlama",
  "Sonuçlar",
];

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatMoney = (value?: number | null) => money.format(value ?? 0);
const formatPercent = (value?: number | null) => `%${money.format((value ?? 0) * 100)}`;

const DR_FACTORS = [
  { key: "sektorRiskiPuani", label: "İşletme yapısı — Sektör riski", desc: "üretim=5, hizmet/ticaret=2-3", weight: 0.15 },
  { key: "musteriCesitlilikPuani", label: "Müşteri ve satıcı çeşitliliği", desc: "çok yoğunlaşma=5, dağılmış=1-2", weight: 0.12 },
  { key: "iliskiliTarafYogunluguPuani", label: "İlişkili taraf işlem yoğunluğu", desc: "yüksek=5, yok=1", weight: 0.12 },
  { key: "oncerikiBulgPuani", label: "Önceki dönem denetim bulgusu", desc: "var=5, yok=1", weight: 0.13 },
  { key: "yönetimDurustlukuPuani", label: "Yönetim dürüstlüğü & şeffaflığı", desc: "düşük=5, yüksek=1", weight: 0.10 },
  { key: "btSistemKarmasiklikPuani", label: "BT sistem karmaşıklığı", desc: "ERP karmaşık=5, basit=1", weight: 0.08 },
  { key: "olaguandisiIslemYogunluguPuani", label: "Olağandışı/tekrar etmeyen işlem yoğunluğu", desc: "çok=5, az=1", weight: 0.10 },
  { key: "hukukiDavaPuani", label: "Hukuki dava ve uyuşmazlık", desc: "çok=5, yok=1", weight: 0.10 },
  { key: "isletmeKulturesuPuani", label: "İşletme kültürü & yapılanma olgunluğu", desc: "zayıf=5, güçlü=1", weight: 0.10 },
];

];

const BulguRiskiBelirlemeStepper = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const hotDRRef = useRef<any>(null);
  const hotKRRef = useRef<any>(null);

  const [requestData, setRequestData] = useState<SaveBulguRiskiRequest>({
    denetciId: user.denetciId || 0,
    denetlenenId: user.denetlenenId || 0,
    yil: user.yil || 0,
    mizanVerisi: {
      netSatislar: null, toplamAktif: null, ticariAlacaklar: null, stokToplam: null,
      maddiDuranVarliklarNet: null, bankaKasa: null, ticariBorc: null, donemKarZarar: null,
      netSatislarOncekiDonem: null, değişimYuzde: null,
    },
    onemlilik_PM: null, onemlilik_OM: null, onemlilik_Esik: null,
    doğalRiskPuan: {
      sektorRiskiPuani: null, musteriCesitlilikPuani: null, iliskiliTarafYogunluguPuani: null,
      oncerikiBulgPuani: null, yönetimDurustlukuPuani: null, btSistemKarmasiklikPuani: null,
      olaguandisiIslemYogunluguPuani: null, hukukiDavaPuani: null, isletmeKulturesuPuani: null,
    },
    dogalRisk: null, dogalRiskSeviyesi: null,
    kontrolRiskiSatirlari: [],
    kontrolRiski: null, kontrolRiskiSeviyesi: null,
    kabulEdilDenetimRiski: 0.05, ortayaCikaramama_OR: null, onerilen_DenetimProseduru: null,
    orneklemeOrani: null, sonucMetni: null, tamamMi: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const savedData = await getBulguRiskiBelirleme(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
      
      if (savedData) {
        setRequestData((prev) => ({ ...prev, ...savedData }));
        
        // Eğer yeni kayıt ise (id=0), mizan verilerini çekmeye çalış
        if (savedData.id === 0) {
          const onemlilikData = await getOnemlilikExcelModel(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0);
          if (onemlilikData && onemlilikData.parametreler) {
            const { netSatislar, toplamVarliklar, vergiOncesiKar } = onemlilikData.parametreler;
            const hesaplananOnemlilik = await hesaplaOnemlilik(netSatislar);
            
            setRequestData((prev) => ({
              ...prev,
              mizanVerisi: { ...prev.mizanVerisi!, netSatislar: netSatislar, toplamAktif: toplamVarliklar, donemKarZarar: vergiOncesiKar },
              onemlilik_PM: hesaplananOnemlilik?.pm || null,
              onemlilik_OM: hesaplananOnemlilik?.om || null,
              onemlilik_Esik: hesaplananOnemlilik?.esik || null,
            }));
          }
        }
      }
    } catch (error) {
      console.log("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // DR Calculation (0-1)
  const drHesaplanan = useMemo(() => {
    if (!requestData.doğalRiskPuan) return 0;
    let sum = 0;
    DR_FACTORS.forEach(f => {
      const val = requestData.doğalRiskPuan![f.key as keyof DoğalRiskPuanRequest];
      if (val) sum += (val * f.weight);
    });
    return sum / 5;
  }, [requestData.doğalRiskPuan]);

  const drSeviyesi = drHesaplanan > 0.6 ? "Riskli" : drHesaplanan > 0.4 ? "Orta Riskli" : "Düşük Risk";

  // KR Calculation (0-1)
  const krHesaplanan = useMemo(() => {
    if (!requestData.kontrolRiskiSatirlari) return 0;
    let sum = 0;
    requestData.kontrolRiskiSatirlari.forEach(r => {
      if (r.puani) sum += (r.puani * (r.agirlik || 0));
    });
    return sum / 5;
  }, [requestData.kontrolRiskiSatirlari]);

  const krSeviyesi = krHesaplanan > 0.6 ? "Riskli" : krHesaplanan > 0.4 ? "Orta Riskli" : "Düşük Risk";

  const fetchOrHesabi = async () => {
    if (drHesaplanan > 0 && krHesaplanan > 0) {
      const result = await hesaplaOrVeProsedur(drHesaplanan, krHesaplanan, requestData.kabulEdilDenetimRiski || 0.05);
      if (result) {
        setRequestData(prev => ({
          ...prev,
          ortayaCikaramama_OR: result.or,
          onerilen_DenetimProseduru: result.prosedurTuru,
          orneklemeOrani: result.orneklemOrani,
        }));
      }
    }
  };

  const handleNext = async () => {
    if (activeStep === 2) {
      setRequestData(prev => ({
        ...prev,
        dogalRisk: drHesaplanan,
        dogalRiskSeviyesi: drSeviyesi,
        kontrolRiski: krHesaplanan,
        kontrolRiskiSeviyesi: krSeviyesi
      }));
      await fetchOrHesabi();
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sync from HotTable if active
      if (activeStep === 1 && hotDRRef.current) {
        // DR is already synced via afterChange, but can do a final check if needed
      }

      const success = await saveBulguRiskiBelirleme({
        ...requestData,
        dogalRisk: drHesaplanan,
        dogalRiskSeviyesi: drSeviyesi,
        kontrolRiski: krHesaplanan,
        kontrolRiskiSeviyesi: krSeviyesi
      });
      if (success) enqueueSnackbar("Kayıt başarılı.", { variant: "success" });
      else enqueueSnackbar("Kayıt işlemi başarısız oldu.", { variant: "error" });
    } catch (error) {
      enqueueSnackbar("Kayıt sırasında bir hata oluştu.", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  // --- Handson Data Mapping ---
  const hotDataDR = useMemo(() => {
    return DR_FACTORS.map((f, i) => {
      const val = requestData.doğalRiskPuan?.[f.key as keyof DoğalRiskPuanRequest];
      return [
        i + 1,
        f.label,
        f.desc,
        val,
        f.weight,
        val ? (val * f.weight).toFixed(3) : "-"
      ];
    });
  }, [requestData.doğalRiskPuan]);

  const hotDataKR = useMemo(() => {
    return requestData.kontrolRiskiSatirlari?.map((kr, i) => {
      return [
        kr.surecAlani,
        kr.kontrolTanımı,
        kr.puani,
        kr.agirlik,
        kr.puani ? (kr.puani * (kr.agirlik || 0)).toFixed(3) : "-",
        kr.bdsKaynagi
      ];
    }) || [];
  }, [requestData.kontrolRiskiSatirlari]);

  const handleDRChange = (changes: any) => {
    if (!changes) return;
    const newData = { ...requestData.doğalRiskPuan! };
    changes.forEach(([row, col, prev, next]: any) => {
      if (col === 3) { // Puan column
        const key = DR_FACTORS[row].key as keyof DoğalRiskPuanRequest;
        const val = next === "" || next === null ? null : parseInt(next);
        (newData as any)[key] = val;
      }
    });
    setRequestData(prev => ({ ...prev, doğalRiskPuan: newData }));
  };

  const handleKRChange = (changes: any) => {
    if (!changes) return;
    const newRows = [...requestData.kontrolRiskiSatirlari!];
    changes.forEach(([row, col, prev, next]: any) => {
      if (col === 2) { // Puan column
        const val = next === "" || next === null ? null : parseInt(next);
        newRows[row].puani = val;
      }
    });
    setRequestData(prev => ({ ...prev, kontrolRiskiSatirlari: newRows }));
  };

  // --- Mizan Logic ---
  const handleMizanChange = (field: keyof MizanVerisiRequest, value: string) => {
    const numericValue = value ? parseFloat(value.replace(/,/g, '')) : null;
    setRequestData((prev) => ({
      ...prev,
      mizanVerisi: { ...prev.mizanVerisi!, [field]: numericValue },
    }));
  };

  const buildHtmlAsync = async () => `<!DOCTYPE html><html lang="tr"><body><h1>Bulgu Riski Belirleme</h1></body></html>`;

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height={300}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* STEP 1: MİZAN */}
      {activeStep === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box bgcolor="#fff8e1" p={2} borderRadius={1} mb={2}>
            <Typography variant="body2" color="warning.dark">Sarı hücrelere FAS mizanından veya Excel'den aldığınız değerleri girin.</Typography>
          </Box>
          <Grid container spacing={2}>
            {[
              { label: "Net Satışlar", field: "netSatislar" },
              { label: "Toplam Aktif", field: "toplamAktif" },
              { label: "Ticari Alacaklar", field: "ticariAlacaklar" },
              { label: "Stok Toplam", field: "stokToplam" },
              { label: "Dönem Kar/Zarar", field: "donemKarZarar" },
            ].map(r => (
              <Grid item xs={12} sm={6} key={r.field}>
                <TextField 
                  label={r.label}
                  fullWidth
                  size="small"
                  type="number"
                  value={requestData.mizanVerisi?.[r.field as keyof MizanVerisiRequest] ?? ""}
                  onChange={(e) => handleMizanChange(r.field as keyof MizanVerisiRequest, e.target.value)}
                  sx={{ bgcolor: "#fffdf0" }}
                />
              </Grid>
            ))}
          </Grid>
          <Box mt={4} p={2} bgcolor="#f8fafc" borderRadius={1} border="1px solid #e2e8f0">
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>ÖNEMLİLİK HESAPLAMASI (Otomatik)</Typography>
            <Box display="flex" gap={6}>
              <Box><Typography variant="body2" color="text.secondary">PM</Typography><Typography variant="h6">{formatMoney(requestData.onemlilik_PM)}</Typography></Box>
              <Box><Typography variant="body2" color="text.secondary">OM</Typography><Typography variant="h6">{formatMoney(requestData.onemlilik_OM)}</Typography></Box>
              <Box><Typography variant="body2" color="text.secondary">Eşik</Typography><Typography variant="h6">{formatMoney(requestData.onemlilik_Esik)}</Typography></Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* STEP 2: DOĞAL RİSK (DR) - HANDSONTABLE */}
      {activeStep === 1 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box bgcolor="#fff8e1" p={2} borderRadius={1} mb={2}>
            <Typography variant="body2" color="warning.dark">Aşağıdaki tabloya 1-5 arası puan girin. Değişiklikler anlık hesaplanır.</Typography>
          </Box>
          <CalismaKagitiHotTable
            ref={hotDRRef}
            data={hotDataDR}
            height={400}
            colHeaders={["No", "Risk Faktörü", "Açıklama", "Puan (1-5)", "Ağırlık", "Ağırlıklı Puan"]}
            columns={[
              { readOnly: true, width: 40 },
              { readOnly: true, width: 250 },
              { readOnly: true, width: 300 },
              { type: "numeric", className: "htCenter", width: 100 },
              { readOnly: true, type: "numeric", format: "0.00%", width: 80 },
              { readOnly: true, type: "numeric", format: "0.000", width: 120 }
            ]}
            afterChange={handleDRChange}
          />
          <Box mt={2} p={2} bgcolor="#f0fdf4" border="1px solid #bbf7d0" borderRadius={1} display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontWeight="bold">Doğal Risk (DR): {drHesaplanan.toFixed(3)} ({drSeviyesi})</Typography>
          </Box>
        </Paper>
      )}

      {/* STEP 3: KONTROL RİSKİ (KR) - HANDSONTABLE */}
      {activeStep === 2 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box bgcolor="#fff8e1" p={2} borderRadius={1} mb={2}>
            <Typography variant="body2" color="warning.dark">23 Kontrol satırına 1-5 arası puan girin.</Typography>
          </Box>
          <CalismaKagitiHotTable
            ref={hotKRRef}
            data={hotDataKR}
            height={500}
            colHeaders={["Süreç Alanı", "Kontrol Tanımı", "Puan (1-5)", "Ağırlık", "Ağırlıklı Puan", "BDS Kaynağı"]}
            columns={[
              { readOnly: true, width: 150 },
              { readOnly: true, width: 350 },
              { type: "numeric", className: "htCenter", width: 100 },
              { readOnly: true, type: "numeric", format: "0.00%", width: 80 },
              { readOnly: true, type: "numeric", format: "0.000", width: 120 },
              { readOnly: true, width: 120 }
            ]}
            afterChange={handleKRChange}
          />
          <Box mt={2} p={2} bgcolor="#f0fdf4" border="1px solid #bbf7d0" borderRadius={1} display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontWeight="bold">Kontrol Riski (KR): {krHesaplanan.toFixed(3)} ({krSeviyesi})</Typography>
          </Box>
        </Paper>
      )}

      {/* STEP 4: SONUÇLAR */}
      {activeStep === 3 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={3} color="primary">Denetim Riski ve Prosedür Önerisi</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box bgcolor="#f8fafc" p={3} borderRadius={2} border="1px solid #e2e8f0">
                <Typography variant="subtitle2" color="text.secondary" mb={2}>HESAPLAMA</Typography>
                <Box display="flex" justifyContent="space-between" mb={1}><Typography>DR</Typography><Typography fontWeight="bold">{requestData.dogalRisk?.toFixed(3)}</Typography></Box>
                <Box display="flex" justifyContent="space-between" mb={1}><Typography>KR</Typography><Typography fontWeight="bold">{requestData.kontrolRiski?.toFixed(3)}</Typography></Box>
                <Box display="flex" justifyContent="space-between" mb={1}><Typography>KDR</Typography><Typography fontWeight="bold">0.05</Typography></Box>
                <Box borderTop="1px dashed #ccc" pt={2} display="flex" justifyContent="space-between">
                  <Typography fontWeight="bold" color="primary">OR</Typography>
                  <Typography variant="h6" color="primary">{formatPercent(requestData.ortayaCikaramama_OR)}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box bgcolor="#eff6ff" p={3} borderRadius={2} border="1px solid #bfdbfe">
                <Typography variant="subtitle2" color="text.secondary" mb={2}>ÖNERİ</Typography>
                <Typography variant="h6" color="#1e40af">{requestData.onerilen_DenetimProseduru}</Typography>
                <Typography variant="body1" mt={1}>Örnekleme Oranı: {requestData.orneklemeOrani}</Typography>
                <Box mt={2}>
                  <TextField 
                    label="Sonuç Metni" 
                    multiline 
                    fullWidth 
                    rows={4} 
                    value={requestData.sonucMetni || ""} 
                    onChange={(e) => setRequestData(p => ({...p, sonucMetni: e.target.value}))}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">Geri</Button>
        <Box display="flex" gap={2}>
          <Button onClick={handleSave} disabled={saving} variant="contained" color="secondary">Taslak Kaydet</Button>
          {activeStep < steps.length - 1 ? (
            <Button onClick={handleNext} variant="contained" color="primary">İleri</Button>
          ) : (
            <Button onClick={() => { setRequestData(p => ({...p, tamamMi: true})); handleSave(); }} variant="contained" color="primary">Tamamla</Button>
          )}
        </Box>
      </Box>

      <BelgeKontrolCard controller="BulguRiskiBelirlemeBelge" />
      <IslemlerCardHtml controller="BulguRiskiBelirlemeBelge" buildHtmlAsync={buildHtmlAsync} />
    </Box>
  );
};

export default BulguRiskiBelirlemeStepper;
