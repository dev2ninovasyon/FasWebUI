"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "@/store/hooks";
import { CircularProgress, MenuItem, Select, InputLabel, FormControl, Button, Snackbar, Alert } from "@mui/material";
import { Box, Grid, useMediaQuery } from "@mui/material";
import { AppState } from "@/store/store";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import FisBuyukluguAnaliziChart, { FisAyVerisi } from "@/app/(Uygulama)/components/PlanVeProgram/FisBuyukluguAnalizi/FisBuyukluguAnaliziChart";
import { getFisBuyukluguAnaliziYillik, upsertFisBuyukluguAylikNot } from "@/api/PlanVeProgram/PlanVeProgram";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";

const AY_ADDAN_NO: Record<string, number> = {
  Ocak: 1, Şubat: 2, Mart: 3, Nisan: 4, Mayıs: 5, Haziran: 6,
  Temmuz: 7, Ağustos: 8, Eylül: 9, Ekim: 10, Kasım: 11, Aralık: 12,
};

const BCrumb = [
  { to: "/PlanVeProgram", title: "Plan Ve Program" },
  { to: "/PlanVeProgram/DenetimPlanindaOnemlilik", title: "Denetim Planında Önemlilik" },
  { to: "/PlanVeProgram/DenetimPlanindaOnemlilik/FisBuyukluguAnalizi", title: "Fiş Büyüklüğü Analizi" },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const [aylar, setAylar] = useState<FisAyVerisi[]>([]);
  const [loading, setLoading] = useState(true);
  const controller = "FisBuyukluguAnalizi";
const [saveLoading, setSaveLoading] = useState(false);
const [snack, setSnack] = useState<{open:boolean;message:string;severity:"success"|"error"|"info"}>({
  open: false, message: "", severity: "success"
});
 const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Seçilen ay (UI'de gösterilecek)
const [seciliAy, setSeciliAy] = useState<string>("Ocak");
  // DOM & export map'leri
  const chartDomMapRef = useRef<Record<string, HTMLDivElement | null>>({});
  const chartImageMapRef = useRef<Record<string, string>>({}); // ay -> dataURI PNG

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getFisBuyukluguAnaliziYillik(
          user.token || "", user.denetciId || 0, user.yil || 0, user.denetlenenId || 0, false
        );
        setAylar(result || []);
      } catch (err) {
        console.error("Fiş büyüklüğü verisi alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
     return () => {
    Object.values(timersRef.current).forEach((t) => clearTimeout(t));
  };
  }, [user.token, user.denetciId, user.yil, user.denetlenenId]);
   const handleNotChange = (ay: string, value: string) => {
    setAylar(prev =>
      prev.map(x => (x.ay === ay ? { ...x, not: value } : x))
    );
  };
const saveNoteForMonth = async (ay: string) => {
  // varsa bekleyen debounce’u iptal et
  if (timersRef.current[ay]) {
    clearTimeout(timersRef.current[ay]);
    delete timersRef.current[ay];
  }
  const monthNoFromMap = AY_ADDAN_NO[ay as keyof typeof AY_ADDAN_NO];
  const monthNoFromIndex = Math.max(1, aylar.findIndex((x) => x.ay === ay) + 1);
  const ayNo = monthNoFromMap || monthNoFromIndex;
  const current = aylar.find(x => x.ay === ay);
  const value = current?.not ?? "";
  try {
    setSaveLoading(true);
    await upsertFisBuyukluguAylikNot(
      user.token || "",
      user.denetciId || 0,
      user.yil || 0,
      user.denetlenenId || 0,
      ayNo,
      value
    );
    setSnack({ open: true, message: `${ay} notu kaydedildi.`, severity: "success" });
  } catch (e:any) {
    console.error("Not kaydedilemedi:", e);
    setSnack({ open: true, message: `${ay} notu kaydedilemedi.`, severity: "error" });
  } finally {
    setSaveLoading(false);
  }
};

  const registerChartDom = (ay: string, el: HTMLDivElement | null) => {
    chartDomMapRef.current[ay] = el;
  };

  const esc = (s: string) =>
    s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
     .replaceAll('"', "&quot;").replaceAll("'", "&#39;");

  // 👇 Offscreen render edilen TÜM grafiklerden PNG topla
  const collectChartImages = async () => {
    const ApexChartsAny: any = (window as any).ApexCharts;
    if (!ApexChartsAny?.exec) return;

    // Tüm ayların chart id'lerini dolaş
    for (const item of aylar) {
      const id = `fis-${item.ay}`;
      try {
        const res = await ApexChartsAny.exec(id, "dataURI"); // { imgURI, blob }
        if (res?.imgURI) chartImageMapRef.current[item.ay] = res.imgURI;
      } catch (e) {
        console.error("Grafik export başarısız:", id, e);
      }
    }
  };

  const buildSectionHtml = (item: FisAyVerisi) => {
    const imgSrc = chartImageMapRef.current[item.ay] || "";
    const rows = item.gunler
      .map((g, i) => {
        const v = item.seri?.[0]?.data?.[i] ?? 0;
        return `<tr>
          <td style="border:1px solid #444;padding:6px;">${esc(g)}</td>
          <td style="border:1px solid #444;padding:6px;text-align:right;">${Intl.NumberFormat("tr-TR").format(v)}</td>
        </tr>`;
      })
      .join("");

    const noteHtml =
      item.not && item.not.trim().length > 0
        ? `<p style="margin:8px 0 0 0;"><strong>Not:</strong> ${esc(item.not)}</p>`
        : "";

    return `
    <h2 style="font-size:18px;margin:18px 0 8px;">${esc(item.ay)} Ayı Fişleri</h2>
    <div style="margin:6px 0; text-align:center;">
      ${
        imgSrc
          ? `<img src="${imgSrc}" alt="${esc(item.ay)} grafiği" style="width:16cm; max-width:100%; height:auto; display:inline-block;" />`
          : "<!-- PNG export bulunamadı -->"
      }
    </div>
    <table style="border-collapse:collapse;width:100%;margin-top:8px;font-size:12px; table-layout:fixed; word-wrap:break-word;">
      <thead>
        <tr>
          <th style="text-align:left;border:1px solid #444;padding:6px;background:#f2f2f2;">Gün</th>
          <th style="text-align:right;border:1px solid #444;padding:6px;background:#f2f2f2;">Fiş Sayısı</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    ${noteHtml}
  `;
  };

  // 🔸 HTML'i ASENKRON üret: önce TÜM PNG'leri offscreen'ten topla
  const buildFullHtmlAsync = async () => {
    await collectChartImages();
    const sections = aylar.map(buildSectionHtml).join("\n");
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Fiş Büyüklüğü Analizi</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color:#000; }
    h1 { font-size: 22px; margin: 0 0 12px; }
    .meta { font-size:12px; margin-bottom: 16px; color:#333; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <h1>Fiş Büyüklüğü Analizi</h1>
  ${sections}
</body>
</html>
`.trim();
  };

  if (loading) {
    return (
      <PageContainer title="Fiş Büyüklüğü Analizi" description="this is Fiş Büyüklüğü Analizi">
        <Breadcrumb title="Fiş Büyüklüğü Analizi" items={BCrumb} />
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // ✅ UI'de gösterilecek ay listesi (tek ay)
  const gosterilecekAylar =
    seciliAy === "Tümü" ? [] : aylar.filter((x) => x.ay === seciliAy);

  return (
    <PageContainer title="Fiş Büyüklüğü Analizi" description="this is Fiş Büyüklüğü Analizi">
      <Breadcrumb title="Fiş Büyüklüğü Analizi" items={BCrumb} />

      <Grid container>
        {/* Üst toolbar: Ay seçimi */}
        <Grid item xs={12} lg={12} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="ay-secimi-label">Ay Seç</InputLabel>
            <Select
              labelId="ay-secimi-label"
              label="Ay Seç"
              value={seciliAy}
              onChange={(e) => setSeciliAy(e.target.value as string)}
              
            >
              {aylar.map((a) => (
                <MenuItem key={a.ay} value={a.ay}>{a.ay}</MenuItem>
              ))}
            </Select>
          </FormControl>
           
        </Grid>

        {/* UI: Sadece seçili ayın grafiği */}
        <Grid item xs={12} lg={12}>
          {gosterilecekAylar.length > 0 ? (
            <FisBuyukluguAnaliziChart
              title={`Fiş Büyüklüğü - ${seciliAy}`}
              aylar={gosterilecekAylar}
              onNotChange={handleNotChange}
              onSaveNote={saveNoteForMonth}
              saveLoading={saveLoading}
              registerChartDom={registerChartDom}
            />
          ) : (
            <Box sx={{ py: 2, color: "text.secondary" }}>
              Seçili ay yok. Önizleme/İndir işlemlerinde tüm ayların grafikleri kullanılacaktır.
            </Box>
          )}
        </Grid>

        {/* 🔒 OFFSCREEN EXPORT STAGING: TÜM AYLARIN GRAFİĞİ burada render edilir */}
      {/* OFFSCREEN EXPORT STAGING */}
<Box
  sx={{
    position: 'fixed',     // <-- absolute yerine fixed
    top: -10000,           // ekranın çok üstüne
    left: -10000,          // ve soluna sabitle
    width: 1200,           // export için sabit genişlik
    height: 1,             // dikey taşmayı engelle
    overflow: 'hidden',    // olası taşmaları gizle
    pointerEvents: 'none',
    visibility: 'hidden',  // render kalsın, görünmesin
    zIndex: -1,
  }}
  aria-hidden
>
  <FisBuyukluguAnaliziChart
    title="(offscreen)"
    aylar={aylar}
    onNotChange={() => {}}
    registerChartDom={registerChartDom}
  />
</Box>


        {/* Yetkilendirme kartları + işlemler */}
        <Grid item xs={12} lg={12}>
          {user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi") ? (
            <Grid container sx={{ width: "100%", margin: "0 auto", justifyContent: "space-between" }}>
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard fetch={() => {}} hazirlayan="Denetçi - Yardımcı Denetçi" controller={controller} />
              </Grid>
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard fetch={() => {}} onaylayan="Sorumlu Denetçi" controller={controller} />
              </Grid>
              <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
                <BelgeKontrolCard fetch={() => {}} kaliteKontrol="Kalite Kontrol Sorumlu Denetçi" controller={controller} />
              </Grid>
            </Grid>
          ) : null}

          <Grid container sx={{ width: "100%", margin: "0 auto", justifyContent: "space-between", gap: 1 }}>
            <Grid item xs={12} lg={12} mt={5}>
              <IslemlerCardHtml
                controller={controller}
                buildHtmlAsync={buildFullHtmlAsync}  // Önizleme tüm ayları gönderecek
              />
            </Grid>
          </Grid>
        </Grid>

      <Snackbar
 open={snack.open}
  autoHideDuration={2500}
  onClose={() => setSnack(s => ({ ...s, open: false }))}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert
    onClose={() => setSnack(s => ({ ...s, open: false }))}
    severity={snack.severity}
    variant="filled"
    sx={{ width: "100%" }}
  >
    {snack.message}
  </Alert>
</Snackbar>
      </Grid>
    </PageContainer>
  );
};

export default Page;
