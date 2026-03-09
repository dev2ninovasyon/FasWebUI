// src/app/(Uygulama)/components/Dashboard/SirketArsivOzetKartlari.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
} from "@mui/material";
import NextLink from "next/link";
import { useTheme } from "@mui/material/styles";
import {
  IconBuilding,
  IconLayoutGrid,
  IconPackage,
  IconHistory,
  IconArrowRight
} from "@tabler/icons-react";
import Image from "next/image";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import {
  getSirketArsivOzet,
  SirketArsivOzetDto,
  UserActionDto,
} from "@/api/AnaSayfa/AnaSayfa";
import { orange } from "@mui/material/colors";

export function SirketArsivOzetKartlari() {
  const theme = useTheme();
  const user = useSelector((state: AppState) => state.userReducer);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SirketArsivOzetDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actions, setActions] = useState<UserActionDto[]>([]);

  useEffect(() => {
    if (!user.token || !user.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // console.time("API: SirketArsivOzet");
        const result = await getSirketArsivOzet(user.id!, user.denetciId!);
        // console.timeEnd("API: SirketArsivOzet");
        setData(result);
      } catch (err: any) {
        setError(err.message || "Veriler alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.token, user.id, user.denetciId]);
  const sirketBazliToplamlar = useMemo(() => {
    if (!data || !data.sirketler) return [];  // ğŸ”¹ data yoksa boş dizi dön

    const map = new Map<
      number,
      { ad: string; toplamMb: number; dosyaSayisi: number }
    >();

    data.sirketler.forEach((s) => {
      const current = map.get(s.denetlenenId) || {
        ad: s.sirketUnvani || `Şirket ${s.denetlenenId}`,
        toplamMb: 0,
        dosyaSayisi: 0,
      };
      current.toplamMb += s.toplamBoyutMb;
      current.dosyaSayisi += s.dosyaSayisi;
      map.set(s.denetlenenId, current);
    });

    return Array.from(map.values());
  }, [data]); // ğŸ”¹ data.sirketler yerine direkt data'yı ekle

  if (!user.token) return null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box py={2}>
        <Typography color="error">{error || "Veri bulunamadı."}</Typography>
      </Box>
    );
  }


  // Şirket bazında toplam MB

  const donutSeries = sirketBazliToplamlar.map((x) =>
    Number(x.toplamMb.toFixed(2))
  );
  const donutLabels = sirketBazliToplamlar.map((x) => x.ad);

  const donutOptions: ApexCharts.ApexOptions = {
    labels: donutLabels,
    theme: { mode: theme.palette.mode },
    legend: { position: "bottom" },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(2)} MB`,
      },
    },
  };

  // Basit bar chart (şirket bazlı MB)
  const barOptions: ApexCharts.ApexOptions = {
    xaxis: {
      categories: donutLabels,
    },
    theme: { mode: theme.palette.mode },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(2)} MB`,
      },
    },
  };
  const getCardPalette = (index: number) => {
    const palettes = [
      { bg: theme.palette.primary.light, text: theme.palette.primary.main },
      { bg: theme.palette.warning.light, text: theme.palette.warning.main },
      { bg: theme.palette.info.light, text: theme.palette.info.main },
      { bg: theme.palette.error.light, text: theme.palette.error.main },
      { bg: theme.palette.success.light, text: theme.palette.success.main },
      { bg: theme.palette.secondary.light, text: theme.palette.secondary.main },
    ];
    return palettes[index % palettes.length];
  };
  const barSeries = [
    {
      name: "Arşiv Alanı (MB)",
      data: donutSeries,
    },
  ];

  const total = Array.isArray(donutSeries)
    ? donutSeries.reduce((sum, val) => sum + val, 0)
    : donutSeries;


  // API'den gelen dinamik verileri kullanıyoruz
  // const toplamDosyaSayisi = 7; 



  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Şirketler ve Modüller
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }} >
        Kullanıcıya tanımlı şirketlerin ve modüllerin sayısı.
      </Typography>
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card
            sx={{
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: theme.palette.primary.main,
              width: "100%",
              height: "100%",
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 3,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
              }
            }}
          >
            <CardContent>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <IconBuilding size={48} color={theme.palette.primary.main} stroke={1.5} />
              </Box>
              <Typography
                color="primary.main"
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                Şirket Sayısı
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography color="primary.main" variant="h3" fontWeight={800}>
                  {data.toplamSirketSayisi}
                </Typography>
                <Link
                  component={NextLink}
                  href="/Denetlenen"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none",
                    color: theme.palette.primary.main,
                    "&:hover": { transform: "scale(1.1)" },
                    transition: "transform 0.2s"
                  }}
                >
                  <IconArrowRight size={24} />
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card
            sx={{
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: orange[500],
              width: "100%",
              height: "100%",
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 3,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
              }
            }}
          >
            <CardContent>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <IconLayoutGrid size={48} color={orange[500]} stroke={1.5} />
              </Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 1, color: orange[500] }}
              >
                Modül Sayısı
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography sx={{ color: orange[500] }} variant="h3" fontWeight={800}>
                  {data.toplamModulSayisi}
                </Typography>
                <Link
                  component={NextLink}
                  href="#"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none",
                    color: orange[500],
                    "&:hover": { transform: "scale(1.1)" },
                    transition: "transform 0.2s"
                  }}
                >
                  <IconArrowRight size={24} />
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card
            sx={{
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: theme.palette.success.main,
              width: "100%",
              height: "100%",
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 3,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
              }
            }}
          >
            <CardContent>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <IconPackage size={48} color={theme.palette.success.main} stroke={1.5} />
              </Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 1, color: theme.palette.success.main }}
              >
                Aktif Modüller
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography sx={{ color: theme.palette.success.main }} variant="h3" fontWeight={800}>
                  {data.aktifModulSayisi}
                </Typography>
                <Link
                  component={NextLink}
                  href="#"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none",
                    color: theme.palette.success.main,
                    "&:hover": { transform: "scale(1.1)" },
                    transition: "transform 0.2s"
                  }}
                >
                  <IconArrowRight size={24} />
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Card
            sx={{
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "#ba68c8",
              width: "100%",
              height: "100%",
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 3,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
              }
            }}
          >
            <CardContent>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <IconHistory size={48} color="#ba68c8" stroke={1.5} />
              </Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 1, color: "#ba68c8" }}
              >
                Daha Fazla Modül
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Link
                  component={NextLink}
                  href="https://fasmart.app/denetim-araclari"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "#ba68c8",
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    gap: 1,
                    "&:hover": { color: "#9c27b0" }
                  }}
                >
                  FAS Modülleri <IconArrowRight size={24} />
                </Link>
              </Box>
              <Typography variant="body2" sx={{ color: "#ba68c8", mt: 1, opacity: 0.8 }}>
                Yeni özellikleri keşfedin
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <br></br>
      <Typography variant="h6" gutterBottom>
        Şirketler ve Arşiv Alanı Kullanımı
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Kullanıcıya tanımlı şirketlerin sayısı ve bu şirketlerin arşivde
        kapladığı alanlar.
      </Typography>
      {/* Bar chart */}
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Şirket Bazında Arşiv Alanı (MB)
            </Typography>
            <Chart
              type="bar"
              options={barOptions}
              series={barSeries}
              height={300}
            />
          </CardContent>
        </Card>
      </Grid>
      {/* Detay tablo */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Detaylı Liste
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Şirket</TableCell>
                  <TableCell align="right">Yıl</TableCell>
                  <TableCell align="right">Dosya Sayısı</TableCell>
                  <TableCell align="right">Toplam Boyut (MB)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.sirketler.map((s) => (
                  <TableRow key={`${s.denetlenenId}-${s.yil}`}>
                    <TableCell>{s.sirketUnvani}</TableCell>
                    <TableCell align="right">{s.yil}</TableCell>
                    <TableCell align="right">{s.dosyaSayisi}</TableCell>
                    <TableCell align="right">
                      {s.toplamBoyutMb.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Box>
  );
}
