"use client";

import {
  Box, Card, CardContent, Grid, Stack, Typography, Avatar, ButtonBase, Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

interface YeniSayfa {
  title: string;
  href: string;
  aciklama: string;
  icon: React.ReactNode;
}

const sayfalar: YeniSayfa[] = [
  {
    title: "Bilgi İşlem Muhasebe Sistemi Değerlendirme",
    href: "/PlanVeProgram/BilgiIslemMuhasebe",
    aciklama: "Bilgi işlem ve muhasebe altyapısının değerlendirilmesi",
    icon: <InfoOutlinedIcon />,
  },
  {
    title: "Hesaplara İlişkin İç Kontrol Tespit",
    href: "/PlanVeProgram/HesaplaraIliskinIcKontrolTespit",
    aciklama: "Hesap bazında iç kontrol tespitlerinin kaydedilmesi",
    icon: <AssessmentOutlinedIcon />,
  },
  {
    title: "Finansal Tablolar Denetim Riski Belirleme",
    href: "/PlanVeProgram/FinansalTablolarDenetimRiskiBelirleme",
    aciklama: "Finansal tablo düzeyinde denetim riskinin belirlenmesi",
    icon: <WarningAmberOutlinedIcon />,
  },
  {
    title: "Bulgu Riski Belirleme",
    href: "/PlanVeProgram/BulguRiskiBelirleme",
    aciklama: "Doğal risk ve kontrol riski değerlendirmesi",
    icon: <BugReportOutlinedIcon />,
  },
  {
    title: "Önemlilik Ve Örneklem",
    href: "/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem",
    aciklama: "Önemlilik eşiği ve örneklem büyüklüğü belirleme",
    icon: <AccountTreeOutlinedIcon />,
  },
  {
    title: "Önemlilik Seviyesi Belirleme Ve Değerlendirme",
    href: "/DenetimKanitlari/Onemlilik/OnemlilikSeviyesiBelirlemeVeDegerlendirme",
    aciklama: "Önemlilik seviyesinin belirlenmesi ve değerlendirilmesi",
    icon: <GavelOutlinedIcon />,
  },
  {
    title: "Fatura Yükleme",
    href: "/Veri/Fatura",
    aciklama: "Fatura XML/ZIP yükleme ve işleme",
    icon: <ReceiptLongOutlinedIcon />,
  },
  {
    title: "İrsaliye Yükleme",
    href: "/Veri/Irsaliye",
    aciklama: "İrsaliye XML/ZIP yükleme ve işleme",
    icon: <LocalShippingOutlinedIcon />,
  },
  {
    title: "Fatura İnceleme",
    href: "/DenetimKanitlari/FaturaInceleme",
    aciklama: "Fatura detay inceleme ve analiz",
    icon: <SearchOutlinedIcon />,
  },
];

const paletteColors = [
  { bg: "#e3f2fd", text: "#1565c0" },
  { bg: "#fce4ec", text: "#c62828" },
  { bg: "#e8f5e9", text: "#2e7d32" },
  { bg: "#fff3e0", text: "#e65100" },
  { bg: "#f3e5f5", text: "#7b1fa2" },
  { bg: "#e0f2f1", text: "#00695c" },
];

export function YeniSayfalarKartlari() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box mt={3}>
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="h6">Yeni Eklenen Sayfalar</Typography>
        <Chip label="YENİ" size="small" color="error" sx={{ fontWeight: 700, fontSize: 11 }} />
      </Stack>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Sisteme yeni eklenen modüller. Kartlara tıklayarak ilgili sayfaya gidebilirsiniz.
      </Typography>
      <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 3, lg: 6 }}>
        {sayfalar.map((s, i) => {
          const { bg, text } = paletteColors[i % paletteColors.length];
          return (
            <Grid key={s.href} size={1}>
              <ButtonBase
                onClick={() => router.push(s.href)}
                sx={{ width: "100%", height: "100%", borderRadius: 3, textAlign: "left" }}
              >
                <Card
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 3,
                    bgcolor: bg,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "visible",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {/* Yeni rozeti - kartın sağ üst köşesinde */}
                  <Chip
                    label="Yeni"
                    color="error"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      fontWeight: 700,
                      fontSize: 10,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  />
                  <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", height: "100%" }}>
                    <Avatar
                      sx={{
                        bgcolor: "common.white",
                        color: text,
                        width: 40,
                        height: 40,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {s.icon}
                    </Avatar>
                    <Box mt={2} flex={1}>
                      <Typography variant="subtitle2" sx={{ color: text, fontWeight: 600, fontSize: 13 }}>
                        {s.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: text, opacity: 0.8, display: "block", mt: 0.5 }}>
                        {s.aciklama}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: text, opacity: 0.95, fontWeight: 500, mt: 1 }}>
                      Sayfayı açmak için tıklayın
                    </Typography>
                  </CardContent>
                </Card>
              </ButtonBase>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
