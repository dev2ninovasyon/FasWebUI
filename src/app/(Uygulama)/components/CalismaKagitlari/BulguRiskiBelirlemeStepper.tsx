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
  { key: "muhasebePersonelIstikrariPuani", label: "Muhasebe/finans personeli istikrarı", desc: "sık değişim=5, stabil=1", weight: 0.05 },
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
      muhasebePersonelIstikrariPuani: null,
    },
    dogalRisk: null, dogalRiskSeviyesi: null,
    kontrolRiskiSatirlari: [],
    kontrolRiski: null, kontrolRiskiSeviyesi: null,
    kabulEdilDenetimRiski: 0.05, ortayaCikaramama_OR: null, onerilen_DenetimProseduru: null,
    orneklemeOrani: null, kanitYogunlugu: null, aktifSatir: null, sonucMetni: null, tamamMi: false,
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

  const drSeviyesi = drHesaplanan > 0.50 ? "Riskli" : drHesaplanan > 0.20 ? "Orta Riskli" : "Risksiz / Az Riskli";

  // KR Calculation (0-1)
  const krHesaplanan = useMemo(() => {
    if (!requestData.kontrolRiskiSatirlari) return 0;
    let sum = 0;
    requestData.kontrolRiskiSatirlari.forEach(r => {
      if (r.puani) sum += (r.puani * (r.agirlik || 0));
    });
    return sum / 5;
  }, [requestData.kontrolRiskiSatirlari]);

  const krSeviyesi = krHesaplanan > 0.70 ? "Riskli" : krHesaplanan > 0.30 ? "Orta Riskli" : "Az Riskli";

  const sonucParagrafiOlustur = (dr: number, kr: number, or_: number, prosedurTuru: string, orneklemOrani: string, kanıtYoğunluğu: string) => {
    return `Yapılan detaylı testler neticesinde Doğal Risk (DR) = ${(dr * 100).toFixed(1)}%, Kontrol Riski (KR) = ${(kr * 100).toFixed(1)}% olarak hesaplanmıştır. %5 kabul edilebilir denetim riskine (KDR) göre Ortaya Çıkaramama Riski (OR) = ${(or_ * 100).toFixed(1)}% hesaplanmıştır. Buna göre: ${prosedurTuru} | Örnekleme: ${orneklemOrani} | Kanıt: ${kanıtYoğunluğu} | BDS 330 §18, BDS 520 §5-7`;
  };

  const fetchOrHesabi = async () => {
    if (drHesaplanan > 0 && krHesaplanan > 0) {
      const result = await hesaplaOrVeProsedur(drHesaplanan, krHesaplanan, requestData.kabulEdilDenetimRiski || 0.05);
      if (result) {
        const autoMetin = sonucParagrafiOlustur(drHesaplanan, krHesaplanan, result.or, result.prosedurTuru, result.orneklemOrani, result.kanıtYoğunluğu);
        setRequestData(prev => ({
          ...prev,
          ortayaCikaramama_OR: result.or,
          onerilen_DenetimProseduru: result.prosedurTuru,
          orneklemeOrani: result.orneklemOrani,
          kanitYogunlugu: result.kanıtYoğunluğu,
          aktifSatir: result.aktifSatir,
          sonucMetni: prev.sonucMetni || autoMetin,
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
    setRequestData((prev) => {
      const updated = { ...prev.mizanVerisi!, [field]: numericValue };
      if (field === "netSatislar" && updated.netSatislarOncekiDonem != null && updated.netSatislar != null && updated.netSatislarOncekiDonem !== 0) {
        updated.değişimYuzde = (updated.netSatislar - updated.netSatislarOncekiDonem) / Math.abs(updated.netSatislarOncekiDonem);
      }
      if (field === "netSatislarOncekiDonem" && updated.netSatislar != null && updated.netSatislarOncekiDonem != null && updated.netSatislarOncekiDonem !== 0) {
        updated.değişimYuzde = (updated.netSatislar - updated.netSatislarOncekiDonem) / Math.abs(updated.netSatislarOncekiDonem);
      }
      return { ...prev, mizanVerisi: updated };
    });
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
            <Typography variant="body2" color="warning.dark">
              BDS 200 §A38-A42 (Denetim Riski Modeli) | BDS 320 §10-11 (Önemlilik) | BDS 315 §A128-A133
            </Typography>
            <Typography variant="body2" color="warning.dark" mt={1}>Sarı hücrelere FAS mizanından veya Excel'den aldığınız değerleri girin.</Typography>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "2px solid #e2e8f0" }}>Alan</th>
                  <th style={{ textAlign: "right", padding: 8, borderBottom: "2px solid #e2e8f0", width: 150 }}>Cari Dönem (TL)</th>
                  <th style={{ textAlign: "right", padding: 8, borderBottom: "2px solid #e2e8f0", width: 150 }}>Önceki Dönem (TL)</th>
                  <th style={{ textAlign: "right", padding: 8, borderBottom: "2px solid #e2e8f0", width: 100 }}>Değişim %</th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "2px solid #e2e8f0", width: 120 }}>BDS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Net Satışlar", field: "netSatislar", prevField: "netSatislarOncekiDonem", degisimField: "değişimYuzde", bds: "BDS 240 §A31" },
                  { label: "Toplam Aktif", field: "toplamAktif", bds: "BDS 315 §A35" },
                  { label: "Ticari Alacaklar", field: "ticariAlacaklar", bds: "BDS 505 §7" },
                  { label: "Stok Toplam", field: "stokToplam", bds: "BDS 501 §4" },
                  { label: "MDV Net", field: "maddiDuranVarliklarNet", bds: "BDS 501 §9" },
                  { label: "Banka & Kasa", field: "bankaKasa", bds: "BDS 505 §7" },
                  { label: "Ticari Borçlar", field: "ticariBorc", bds: "BDS 330 §18" },
                  { label: "Dönem Kâr/Zarar", field: "donemKarZarar", bds: "BDS 240 §A24" },
                ].map((r, idx) => (
                  <tr key={r.field} style={{ background: idx % 2 === 0 ? "#fafafa" : "white" }}>
                    <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0", fontWeight: 500 }}>{r.label}</td>
                    <td style={{ padding: 4, borderBottom: "1px solid #e2e8f0" }}>
                      <TextField size="small" type="number" fullWidth
                        value={requestData.mizanVerisi?.[r.field as keyof MizanVerisiRequest] ?? ""}
                        onChange={(e) => handleMizanChange(r.field as keyof MizanVerisiRequest, e.target.value)}
                        sx={{ bgcolor: "#fffdf0", "& input": { textAlign: "right" } }} />
                    </td>
                    <td style={{ padding: 4, borderBottom: "1px solid #e2e8f0" }}>
                      {r.prevField ? (
                        <TextField size="small" type="number" fullWidth
                          value={requestData.mizanVerisi?.[r.prevField as keyof MizanVerisiRequest] ?? ""}
                          onChange={(e) => handleMizanChange(r.prevField as keyof MizanVerisiRequest, e.target.value)}
                          sx={{ bgcolor: "#fffdf0", "& input": { textAlign: "right" } }} />
                      ) : (
                        <Typography variant="body2" color="text.disabled" textAlign="right">-</Typography>
                      )}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                      {r.degisimField ? (
                        <Typography variant="body2" fontWeight="bold" color={(() => {
                          const v = requestData.mizanVerisi?.[r.degisimField as keyof MizanVerisiRequest];
                          if (v == null) return "text.disabled";
                          return v >= 0 ? "success.main" : "error.main";
                        })()}>
                          {requestData.mizanVerisi?.[r.degisimField as keyof MizanVerisiRequest] != null
                            ? `%${(requestData.mizanVerisi![r.degisimField as keyof MizanVerisiRequest]! * 100).toFixed(1)}`
                            : "-"}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled">-</Typography>
                      )}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>{r.bds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
          <Box mt={4} p={2} bgcolor="#f8fafc" borderRadius={1} border="1px solid #e2e8f0">
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>ÖNEMLİLİK HESAPLAMASI — BDS 320 §10-11</Typography>
            <Box display="flex" gap={6} flexWrap="wrap">
              <Box><Typography variant="body2" color="text.secondary">PM (Net Satış × %1)</Typography><Typography variant="h6">{formatMoney(requestData.onemlilik_PM)}</Typography></Box>
              <Box><Typography variant="body2" color="text.secondary">OM (PM × %75)</Typography><Typography variant="h6">{formatMoney(requestData.onemlilik_OM)}</Typography></Box>
              <Box><Typography variant="body2" color="text.secondary">Eşik (PM × %0.5)</Typography><Typography variant="h6">{formatMoney(requestData.onemlilik_Esik)}</Typography></Box>
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
          <Typography variant="h6" mb={3} color="primary">Bulgu Riski Belirleme Belgesi — Sonuç ve OR Hesabı</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>BDS 200 §A38-A42 | BDS 330 §18-21 | BDS 530 §A3-A7 | BDS 520 §5-7</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box bgcolor="#f8fafc" p={3} borderRadius={2} border="1px solid #e2e8f0">
                <Typography variant="subtitle2" color="text.secondary" mb={2}>HESAPLAMA</Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Doğal Risk — DR</Typography>
                  <Typography fontWeight="bold">{requestData.dogalRisk?.toFixed(3)} ({requestData.dogalRiskSeviyesi})</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Kontrol Riski — KR</Typography>
                  <Typography fontWeight="bold">{requestData.kontrolRiski?.toFixed(3)} ({requestData.kontrolRiskiSeviyesi})</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Kabul Edilebilir Denetim Riski — KDR</Typography>
                  <Typography fontWeight="bold">%5 (Sabit)</Typography>
                </Box>
                <Box borderTop="1px dashed #ccc" pt={2} display="flex" justifyContent="space-between">
                  <Typography fontWeight="bold" color="primary">OR = KDR / (DR × KR)</Typography>
                  <Typography variant="h6" color="primary">{formatPercent(requestData.ortayaCikaramama_OR)}</Typography>
                </Box>
                <Box mt={1} display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Formül referansı</Typography>
                  <Typography variant="body2" color="text.secondary">BDS 200 §A42</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box bgcolor="#eff6ff" p={3} borderRadius={2} border="1px solid #bfdbfe">
                <Typography variant="subtitle2" color="text.secondary" mb={2}>OTOMATİK PROSEDÜR ÖNERİSİ — BDS 330 §18-21 | BDS 530 §A3-A7</Typography>
                <Typography variant="h6" color="#1e40af">{requestData.onerilen_DenetimProseduru}</Typography>
                <Box mt={1} display="flex" gap={4} flexWrap="wrap">
                  <Box><Typography variant="body2" color="text.secondary">Örnekleme Oranı</Typography><Typography fontWeight="bold">{requestData.orneklemeOrani}</Typography></Box>
                  <Box><Typography variant="body2" color="text.secondary">Kanıt Yoğunluğu</Typography><Typography fontWeight="bold">{requestData.kanitYogunlugu || "-"}</Typography></Box>
                  {requestData.aktifSatir && (
                    <Box><Typography variant="body2" color="error" fontWeight="bold">{requestData.aktifSatir}</Typography></Box>
                  )}
                </Box>
              </Box>
              <Box mt={2} bgcolor="#fef2f2" p={2} borderRadius={2} border="1px solid #fecaca">
                <Typography variant="subtitle2" color="error" mb={1}>Uygulanacak Prosedür</Typography>
                <Typography fontWeight="bold" color="#991b1b">
                  {requestData.onerilen_DenetimProseduru} | Örnekleme: {requestData.orneklemeOrani} | Kanıt: {requestData.kanitYogunlugu} | BDS 330 §18
                </Typography>
              </Box>
              <Box mt={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>SONUÇ PARAGRAFI — BDS 230 §8-11 (Denetim Dokümantasyonu)</Typography>
                <TextField 
                  multiline 
                  fullWidth 
                  rows={4} 
                  value={requestData.sonucMetni || ""} 
                  onChange={(e) => setRequestData(p => ({...p, sonucMetni: e.target.value}))}
                />
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
