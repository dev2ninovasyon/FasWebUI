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
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import Image from "next/image";
import { useTheme } from "@mui/material/styles";
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


  const toplamDosyaSayisi = 7;



  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Şirketler ve Modüller
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }} >
        Kullanıcıya tanımlı şirketlerin ve modüllerin sayısı.
      </Typography>
      <Grid container spacing={3} columns={{ xs: 1, sm: 2, md: 4 }}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 1
          }}>
          <Card
            sx={{
              borderWidth: 3,
              borderStyle: "solid",
              borderColor: "primary.main",
              width: "100%",
              height: "100%",
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 2,
            }}
          >
            <CardContent>
              <Image
                src="/images/svgs/icon-company.svg"
                alt="Şirket"
                width={65}
                height={65}
              />
              <Typography
                color="primary.main"
                mt={1}
                variant="subtitle1"
                fontWeight={600}
              >
                Şirket Sayısı
              </Typography>
              <Typography color="primary.main" variant="h4" fontWeight={600}>
                <Link
                  underline="hover"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&:hover svg": {
                      transform: "translateX(15px)",
                      transition: "0.1s",
                    },
                  }}
                >
                  <ChevronRightIcon />
                  {data.toplamSirketSayisi}
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 1
          }}>
          <Card
            sx={{
              borderWidth: 3,
              borderStyle: "solid",
              borderColor: "orange",
              width: "100%",
              height: "100%",
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 2,
            }}
          >
            <CardContent>
              <Image
                src="/images/svgs/icon-modules.svg"
                alt="Modül Sayısı"
                width={65}
                height={65}
              />
              <Typography
                color="orange"
                mt={1}
                variant="subtitle1"
                fontWeight={600}
              >
                Modül Sayısı
              </Typography>
              <Typography color="orange" variant="h4" fontWeight={600}>
                <Link
                  color={orange[500]}
                  underline="hover"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&:hover svg": {
                      transform: "translateX(15px)",
                      transition: "0.1s",
                    },
                  }}
                >
                  <ChevronRightIcon />
                  8
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 1
          }}>
          <Card
            sx={{
              borderWidth: 3,
              borderStyle: "solid",
              borderColor: "green",
              width: "100%",
              height: "100%",
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 2,
            }}
          >
            <CardContent>
              <Image
                src="/images/svgs/icon-active-modules.svg"
                alt="Aktif Modüller"
                width={65}
                height={65}
              />
              <Typography
                color="green"
                mt={1}
                variant="subtitle1"
                fontWeight={600}
              >
                Aktif Modüller
              </Typography>
              <Typography color="green" variant="h4" fontWeight={600}>
                <Link

                  underline="hover"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "green",
                    gap: 1,
                    "&:hover svg": {
                      transform: "translateX(15px)",
                      transition: "0.1s",
                    },
                  }}
                >
                  <ChevronRightIcon />
                  {toplamDosyaSayisi}
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 1
          }}>
          <Card
            sx={{
              borderWidth: 3,
              borderStyle: "solid",
              borderColor: "#ba68c8",
              width: "100%",
              height: "100%",
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 2,
              color: "#ba68c8",
            }}
          >
            <CardContent>
              <Image
                src="/images/svgs/icon-more-modules.svg"
                alt="Daha Fazla Modül İçin.."
                width={65}
                height={65}
              />
              <Typography
                mt={1}
                variant="subtitle1"
                fontWeight={600}
                sx={{ color: "#ba68c8" }}
              >
                <Link
                  underline="hover"
                  sx={{
                    display: "inline-flex",   // Yan yana hizala
                    alignItems: "center",     // Dikey ortala
                    gap: 0.5,                   // Yazı ile ikon arası mesafe
                    color: "#ba68c8",
                  }}

                >
                  Daha Fazla Modül
                  <TouchAppIcon
                    sx={{
                      transform: "rotate(180deg)", //Parmağı aşağı çeviriyoruz
                      fontSize: "1.5rem",
                      color: "#ba68c8",
                    }} />
                </Link>
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                <Link
                  component={NextLink}
                  href="https://fasmart.app/denetim-araclari"
                  underline="hover"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#ba68c8",
                    "&:hover svg": {
                      transform: "translateX(15px)",
                      transition: "0.1s",
                    },
                  }}
                >
                  <ChevronRightIcon />
                  FAS Modülleri
                </Link>
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
