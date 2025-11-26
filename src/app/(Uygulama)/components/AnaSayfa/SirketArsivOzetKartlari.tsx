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
} from "@mui/material";
import Image from "next/image";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import {
  getSirketArsivOzet,
  SirketArsivOzetDto,
} from "@/api/AnaSayfa/AnaSayfa";

export function SirketArsivOzetKartlari() {
  const theme = useTheme();
  const user = useSelector((state: AppState) => state.userReducer);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SirketArsivOzetDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user.token || !user.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const result = await getSirketArsivOzet(user.token!, user.denetciId!, user.id!);
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
    if (!data || !data.sirketler) return [];  // 🔹 data yoksa boş dizi dön

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
  }, [data]); // 🔹 data.sirketler yerine direkt data'yı ekle

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

  const barSeries = [
    {
      name: "Arşiv Alanı (MB)",
      data: donutSeries,
    },
  ];
  const total = Array.isArray(donutSeries)
    ? donutSeries.reduce((sum, val) => sum + val, 0)
    : donutSeries;
  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Şirketler ve Arşiv Alanı Kullanımı
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Kullanıcıya tanımlı şirketlerin sayısı ve bu şirketlerin arşivde
        kapladığı alanlar.
      </Typography>

      <Grid container spacing={3}>

        <Grid item xs={12} sm={4} lg={2}>
          <Box bgcolor={"primary.light"} textAlign="center">
            <CardContent>
              <Image src="images/svgs/icon-briefcase.svg" alt={"topcard.icon"} width="50" height="50" />
              <Typography
                color={"primary.light" + ".main"}
                mt={1}
                variant="subtitle1"
                fontWeight={600}
              >
                Şirket Sayisi
              </Typography>
              <Typography
                color={"primary.light" + ".main"}
                variant="h4"
                fontWeight={600}
              >
                {data.toplamSirketSayisi}
              </Typography>
            </CardContent>
          </Box>
        </Grid>

      </Grid>


      {/* Bar chart */}
      <Grid item xs={12} md={6}>
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
      <Grid item xs={12}>
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
