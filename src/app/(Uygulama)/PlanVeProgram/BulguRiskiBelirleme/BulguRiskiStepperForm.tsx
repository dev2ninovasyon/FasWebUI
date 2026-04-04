"use client";
import React, { useState, useEffect } from "react";
import { Paper, Stepper, Step, StepLabel, Button, Box, Typography, Divider, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Card, Grid } from "@mui/material";
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

export default function BulguRiskiStepperForm() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["1. Mizan Girişi", "2. Doğal Risk (DR)", "3. Kontrol Riski (KR)", "4. Sonuçlar & OR"];

  // STATE
  const [mizan, setMizan] = useState({ netSatislarCariDonem: 5000000, netSatislarOncekiDonem: 4000000 });
  const [onemlilik, setOnemlilik] = useState({ pm: 0, om: 0, esik: 0 });

  // Önemlilik hesapla
  useEffect(() => {
    if (mizan.netSatislarCariDonem > 0) {
      const pm = mizan.netSatislarCariDonem * 0.01;
      setOnemlilik({ pm, om: pm * 0.75, esik: pm * 0.5 });
    }
  }, [mizan.netSatislarCariDonem]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
      </Stepper>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ minHeight: "600px", mb: 3 }}>
        {activeStep === 0 && <Step1Mizan mizan={mizan} setMizan={setMizan} onemlilik={onemlilik} />}
        {activeStep === 1 && <Step2DR />}
        {activeStep === 2 && <Step3KR />}
        {activeStep === 3 && <Step4Sonuc />}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<IconArrowLeft size={20} />}>Geri</Button>
        <Button variant="contained" onClick={handleNext} endIcon={<IconArrowRight size={20} />}>İleri</Button>
      </Box>
    </Paper>
  );
}

function Step1Mizan({ mizan, setMizan, onemlilik }: any) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>SAYFA 1: MİZAN VERİŞİ</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>Sarı hücreleri doldurun. Sistem önemlilik otomatik hesaplar.</Alert>
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
                <TextField size="small" type="number" value={mizan.netSatislarCariDonem} onChange={(e) => setMizan({ ...mizan, netSatislarCariDonem: Number(e.target.value) })} />
              </TableCell>
              <TableCell>
                <TextField size="small" type="number" value={mizan.netSatislarOncekiDonem} onChange={(e) => setMizan({ ...mizan, netSatislarOncekiDonem: Number(e.target.value) })} />
              </TableCell>
              <TableCell>BDS 240 §A31</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Card sx={{ p: 2, bgcolor: "#E6F2FF", border: "2px solid #003366" }}>
        <Typography sx={{ fontWeight: 600, mb: 2 }}>ÖNEMLİLİK HESAPLAMASI — BDS 320 §10-11</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, bgcolor: "white" }}>
              <Typography sx={{ fontSize: "0.9rem" }}>Önemlilik (PM)</Typography>
              <Typography sx={{ fontSize: "1.2rem", fontWeight: 600, color: "#003366" }}>{onemlilik.pm.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

function Step2DR() {
  const [dr, setDr] = useState<any>({});
  
  const faktörler = [
    "İşletme yapısı",
    "Müşteri/satıcı çeşitliliği",
    "İlişkili taraf işlem yoğunluğu",
    "Önceki dönem bulgusu",
    "Yönetim dürüstlüğü",
    "BT sistem karmaşıklığı",
    "Olağandışı işlem yoğunluğu",
    "Hukuki dava",
    "İşletme kültürü",
    "Muhasebe personeli istikrarı"
  ];

  const handleFaktorChange = (idx: number, field: string, value: any) => {
    const newFaktörler = [...(dr.faktörler || faktörler.map((f, i) => ({ id: i, ad: f, puan: 0, agirlik: 0 })))];
    if (!newFaktörler[idx]) newFaktörler[idx] = { id: idx, ad: faktörler[idx], puan: 0, agirlik: 0 };
    (newFaktörler[idx] as any)[field] = value;
    setDr({ ...dr, faktörler: newFaktörler });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>SAYFA 2: DOĞAL RİSK PUANLAMA</Typography>
      <Alert severity="warning" sx={{ mb: 3 }}>Puan: 1=Düşük, 5=Yüksek | Ağırlık: %</Alert>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#FF9900" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600, width: "5%" }}>No</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Faktör Adı</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600, width: "10%" }}>Puan (1-5)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600, width: "10%" }}>Ağırlık %</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600, width: "12%" }}>Ağ. Puan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faktörler.map((f, idx) => {
              const puan = dr.faktörler?.[idx]?.puan || 0;
              const agirlik = dr.faktörler?.[idx]?.agirlik || 0;
              const agPuan = (puan * agirlik) / 500;
              return (
                <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? "#FFF5E6" : "#FFEBCC" }}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{f}</TableCell>
                  <TableCell>
                    <TextField size="small" type="number" value={puan} onChange={(e) => handleFaktorChange(idx, "puan", Number(e.target.value))} inputProps={{ min: 0, max: 5 }} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" type="number" value={agirlik} onChange={(e) => handleFaktorChange(idx, "agirlik", Number(e.target.value))} inputProps={{ min: 0, max: 100 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#FF6600" }}>{agPuan.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
            <TableRow sx={{ bgcolor: "#FF9900" }}>
              <TableCell colSpan={4} sx={{ color: "white", fontWeight: 600 }}>DOĞAL RİSK (DR)</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "white", bgcolor: "#FF6600" }}>
                {dr.faktörler ? ((dr.faktörler.reduce((sum: number, f: any) => sum + (f.puan * f.agirlik) / 500, 0) / (dr.faktörler.reduce((sum: number, f: any) => sum + f.agirlik / 100, 0) || 1)) * 100).toFixed(2) : "0.00"}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function Step3KR() {
  const [kr, setKr] = useState<any>({});
  
  const kontroller = [
    { surecAlani: "GELİR", ad: "Satış tanıtım ve onay" },
    { surecAlani: "GELİR", ad: "Satış faturalaması" },
    { surecAlani: "GELİR", ad: "Alacak yönetimi" },
    { surecAlani: "GELİR", ad: "Tahsilat işlemleri" },
    { surecAlani: "GELİR", ad: "Satış iadesi" },
    { surecAlani: "GELİR", ad: "Silinmiş satışlar" },
    { surecAlani: "GİDER", ad: "Satın alma sipariş" },
    { surecAlani: "GİDER", ad: "Mal kabulü" },
    { surecAlani: "GİDER", ad: "Satıcı faturaları" },
    { surecAlani: "GİDER", ad: "Ödemeler" },
    { surecAlani: "GİDER", ad: "Satın alma iadesı" },
    { surecAlani: "STOK", ad: "Stok tanıtımı" },
    { surecAlani: "STOK", ad: "Stok sayımı" },
    { surecAlani: "STOK", ad: "Stok değerlemesi" },
    { surecAlani: "SABİT KIYMETLER", ad: "Sabit kıymet edinimi" },
    { surecAlani: "SABİT KIYMETLER", ad: "Amortisman hesaplaması" },
    { surecAlani: "SABİT KIYMETLER", ad: "Sabit kıymet satışı" },
    { surecAlani: "SABİT KIYMETLER", ad: "Kıymet düşüşü" },
    { surecAlani: "FİNANSMAN", ad: "Krediler" },
    { surecAlani: "FİNANSMAN", ad: "Faiz ve komisyonlar" },
    { surecAlani: "BORDRO", ad: "İşe alım ve ayrılış" },
    { surecAlani: "BORDRO", ad: "Ücret e maaş işlemleri" },
    { surecAlani: "GENEL MUHASEBE", ad: "Genel muhasebe işlemleri" }
  ];

  const handleKontrolChange = (idx: number, field: string, value: any) => {
    const yeni = [...(kr.kontroller || kontroller.map((k, i) => ({ id: i, ...k, puan: 0, agirlik: 0 })))];
    if (!yeni[idx]) yeni[idx] = { id: idx, ...kontroller[idx], puan: 0, agirlik: 0 };
    (yeni[idx] as any)[field] = value;
    setKr({ ...kr, kontroller: yeni });
  };

  const surecAlanlari = ["GELİR", "GİDER", "STOK", "SABİT KIYMETLER", "FİNANSMAN", "BORDRO", "GENEL MUHASEBE"];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>SAYFA 3: KONTROL RİSKİ PUANLAMA</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>Puan: 1=Zayıf, 5=Güçlü | Yüksek Puan = Düşük Risk</Alert>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#003366" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600, width: "4%" }}>No</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600, width: "18%" }}>Süreç/Kontrol Alanı</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Kontrol Satırı</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600, width: "8%" }}>Puan (1-5)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600, width: "10%" }}>Ağırlık %</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600, width: "10%" }}>Ağ. Puan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kontroller.map((k, idx) => {
              const puan = kr.kontroller?.[idx]?.puan || 0;
              const agirlik = kr.kontroller?.[idx]?.agirlik || 0;
              const agPuan = (puan * agirlik) / 500;
              const bgColor = idx % 2 === 0 ? "#E6F2FF" : "#CCE5FF";
              return (
                <TableRow key={idx} sx={{ bgcolor: bgColor }}>
                  <TableCell sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{k.surecAlani}</TableCell>
                  <TableCell sx={{ fontSize: "0.9rem" }}>{k.ad}</TableCell>
                  <TableCell>
                    <TextField size="small" type="number" value={puan} onChange={(e) => handleKontrolChange(idx, "puan", Number(e.target.value))} inputProps={{ min: 0, max: 5 }} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" type="number" value={agirlik} onChange={(e) => handleKontrolChange(idx, "agirlik", Number(e.target.value))} inputProps={{ min: 0, max: 100 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0066CC" }}>{agPuan.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
            <TableRow sx={{ bgcolor: "#003366" }}>
              <TableCell colSpan={5} sx={{ color: "white", fontWeight: 600 }}>KONTROL RİSKİ (KR)</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "white", bgcolor: "#0066CC" }}>
                {kr.kontroller ? ((kr.kontroller.reduce((sum: number, k: any) => sum + (k.puan * k.agirlik) / 500, 0) / (kr.kontroller.reduce((sum: number, k: any) => sum + k.agirlik / 100, 0) || 1)) * 100).toFixed(2) : "0.00"}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function Step4Sonuc() {
  const [dr] = useState(45);
  const [kr] = useState(65);
  const netSatislar = 5000000;
  const pm = netSatislar * 0.01;
  const kdr = dr * kr / 100;
  const or = kdr > 0 ? (0.05 / (dr * kr / 10000)) * 100 : 0;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>SAYFA 4: SONUÇLAR & ÖRNEKLEME RİSKİ (OR) HESABI</Typography>
      
      <TableContainer sx={{ mb: 3 }}>
        <Table size="small">
          <TableBody>
            <TableRow sx={{ bgcolor: "#FFFF99" }}>
              <TableCell sx={{ fontWeight: 600 }}>Net Satışlar</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#003366" }}>{netSatislar.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: "#E6F2FF" }}>
              <TableCell sx={{ fontWeight: 600 }}>Önemlilik (PM)</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#003366" }}>{pm.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: "#CCE5FF" }}>
              <TableCell sx={{ fontWeight: 600 }}>Doğal Risk (DR)</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#FF6600" }}>{dr}%</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: "#E6F2F0" }}>
              <TableCell sx={{ fontWeight: 600 }}>Kontrol Riski (KR)</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0066CC" }}>{kr}%</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: "#E6FFE6" }}>
              <TableCell sx={{ fontWeight: 600 }}>Dahili Kontrol Riski (KDR)</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#00AA00" }}>{kdr.toFixed(2)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Card sx={{ p: 3, mb: 3, bgcolor: "#FFE6E6", border: "3px solid #CC0000" }}>
        <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", mb: 2, color: "#CC0000" }}>ÖRNEKLEME RİSKİ (OR) HESABLAMASI & DEĞERLENDİRME</Typography>
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.95rem", mb: 2, bgcolor: "white", p: 2, border: "1px solid #CC0000" }}>
          Formül: OR = 0.05 / (DR% × KR%) = 0.05 / ({dr/100} × {kr/100}) = <strong style={{ color: "#CC0000" }}>{or.toFixed(2)}%</strong>
        </Typography>
        <Box sx={{ p: 2, bgcolor: or > 10 ? "#FFFFCC" : "#FFE6E6", border: "1px solid #CC9900" }}>
          <Typography sx={{ fontWeight: 600, color: or > 10 ? "#AA6600" : "#CC0000" }}>
            RİSK SEVİYESİ: {or > 15 ? "DÜŞÜK (Sınırlı Örnekleme)" : or > 10 ? "ORTA (Seçmeli Örnekleme)" : "YÜKSEK (Tam Inceleme)"}
          </Typography>
        </Box>
      </Card>

      <Typography sx={{ fontWeight: 600, mb: 2 }}>PROSEDÜRLENDİRME DEĞERLENDİRMESİ</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, bgcolor: "#E6F9E6" }}>
            <Typography sx={{ fontWeight: 600 }}>Prosedür Türü</Typography>
            <Typography sx={{ fontSize: "0.9rem" }}>İstatistiksel Örnekleme</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, bgcolor: "#E6F9E6" }}>
            <Typography sx={{ fontWeight: 600 }}>Örnekleme Oranı</Typography>
            <Typography sx={{ fontSize: "0.9rem" }}>{(100 / (or || 1)).toFixed(0)}%</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, bgcolor: "#E6F9E6" }}>
            <Typography sx={{ fontWeight: 600 }}>Kanıt Yoğunluğu</Typography>
            <Typography sx={{ fontSize: "0.9rem" }}>{or > 10 ? "Az" : "Orta-Yüksek"}</Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
