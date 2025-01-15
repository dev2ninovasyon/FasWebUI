import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Tooltip,
  Fab,
} from "@mui/material";

import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getDonusumMizan } from "@/api/Donusum/Donusum";

interface FinansalDurumTablosu {
  yil: number;
  finansalDurumTablosu: number;
  mizan: number;
  fark: number;
}

interface DonusumMizan {
  detayKodu: string;
  hesapAdi: string;
  vukBorc: number;
  vukAlacak: number;
  fisBorc: number;
  fisAlacak: number;
  raporBorc: number;
  raporAlacak: number;
  borcBakiye: number;
  alacakBakiye: number;
}

interface Veri {
  id: number;
  parentId?: number | null;
  kalemAdi: string;
  dipnot: string;
  formul: string;
  tutarYil1: number;
  tutarYil2: number;
  tutarYil3: number;
  hesaplar?: DonusumMizan[] | null;
}

interface Props {
  fdtData: Veri[];
}

const FinansalDurumCardTable = ({ fdtData }: Props) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const [
    finansalDurumTablosuDonenVarliklar,
    setFinansalDurumTablosuDonenVarliklar,
  ] = useState<FinansalDurumTablosu[]>([]);

  const [
    finansalDurumTablosuDuranVarliklar,
    setFinansalDurumTablosuDuranVarliklar,
  ] = useState<FinansalDurumTablosu[]>([]);

  const [
    finansalDurumTablosuKisaVadeliYukumlulukler,
    setFinansalDurumTablosuKisaVadeliYukumlulukler,
  ] = useState<FinansalDurumTablosu[]>([]);

  const [
    finansalDurumTablosuUzunVadeliYukumlulukler,
    setFinansalDurumTablosuUzunVadeliYukumlulukler,
  ] = useState<FinansalDurumTablosu[]>([]);

  const [finansalDurumTablosuOzkaynaklar, setFinansalDurumTablosuOzkaynaklar] =
    useState<FinansalDurumTablosu[]>([]);

  const fetchFinansalDurumTablosu = async () => {
    try {
      const yilFarklari = [0, -1, -2];
      const donusumMizanlar = await Promise.all(
        yilFarklari.map((yilFarki) =>
          getDonusumMizan(
            user.token || "",
            user.denetlenenId || 0,
            (user.yil || 0) + yilFarki
          )
        )
      );

      const fdtTutarlarDonen = [
        fdtData.find((veri) => veri.kalemAdi === "Dönen Varlıklar [abstract]")
          ?.tutarYil1 ?? 0,
        fdtData.find((veri) => veri.kalemAdi === "Dönen Varlıklar [abstract]")
          ?.tutarYil2 ?? 0,
        fdtData.find((veri) => veri.kalemAdi === "Dönen Varlıklar [abstract]")
          ?.tutarYil3 ?? 0,
      ];
      const donusum1GrubuTutarlar = donusumMizanlar.map((donusumMizan) =>
        donusumMizan
          .filter(
            (veri: DonusumMizan) =>
              veri.detayKodu.startsWith("1") && veri.detayKodu.length === 3
          )
          .reduce(
            (toplam: number, veri: DonusumMizan) =>
              toplam + (veri.borcBakiye || 0),
            0
          )
      );
      const newRowsDonen = yilFarklari.map((yilFarki, index) => ({
        yil: (user.yil || 0) + yilFarki,
        finansalDurumTablosu: fdtTutarlarDonen[index],
        mizan: donusum1GrubuTutarlar[index],
        fark: fdtTutarlarDonen[index] - donusum1GrubuTutarlar[index],
      }));
      setFinansalDurumTablosuDonenVarliklar(newRowsDonen);

      const fdtTutarlarDuran = [
        fdtData.find((veri) => veri.kalemAdi === "Duran Varlıklar [abstract]")
          ?.tutarYil1 ?? 0,
        fdtData.find((veri) => veri.kalemAdi === "Duran Varlıklar [abstract]")
          ?.tutarYil2 ?? 0,
        fdtData.find((veri) => veri.kalemAdi === "Duran Varlıklar [abstract]")
          ?.tutarYil3 ?? 0,
      ];
      const donusum2GrubuTutarlar = donusumMizanlar.map((donusumMizan) =>
        donusumMizan
          .filter(
            (veri: DonusumMizan) =>
              veri.detayKodu.startsWith("2") && veri.detayKodu.length === 3
          )
          .reduce(
            (toplam: number, veri: DonusumMizan) =>
              toplam + (veri.borcBakiye || 0),
            0
          )
      );
      const newRowsDuran = yilFarklari.map((yilFarki, index) => ({
        yil: (user.yil || 0) + yilFarki,
        finansalDurumTablosu: fdtTutarlarDuran[index],
        mizan: donusum2GrubuTutarlar[index],
        fark: fdtTutarlarDuran[index] - donusum2GrubuTutarlar[index],
      }));
      setFinansalDurumTablosuDuranVarliklar(newRowsDuran);

      const fdtTutarlarKisa = [
        fdtData.find(
          (veri) => veri.kalemAdi === "Kısa Vadeli Yükümlülükler [abstract]"
        )?.tutarYil1 ?? 0,
        fdtData.find(
          (veri) => veri.kalemAdi === "Kısa Vadeli Yükümlülükler [abstract]"
        )?.tutarYil2 ?? 0,
        fdtData.find(
          (veri) => veri.kalemAdi === "Kısa Vadeli Yükümlülükler [abstract]"
        )?.tutarYil3 ?? 0,
      ];
      const donusum3GrubuTutarlar = donusumMizanlar.map((donusumMizan) =>
        donusumMizan
          .filter(
            (veri: DonusumMizan) =>
              veri.detayKodu.startsWith("3") && veri.detayKodu.length === 3
          )
          .reduce(
            (toplam: number, veri: DonusumMizan) =>
              toplam + (veri.alacakBakiye || 0),
            0
          )
      );
      const newRowsKisa = yilFarklari.map((yilFarki, index) => ({
        yil: (user.yil || 0) + yilFarki,
        finansalDurumTablosu: fdtTutarlarKisa[index],
        mizan: donusum3GrubuTutarlar[index],
        fark: fdtTutarlarKisa[index] - donusum3GrubuTutarlar[index],
      }));
      setFinansalDurumTablosuKisaVadeliYukumlulukler(newRowsKisa);

      const fdtTutarlarUzun = [
        fdtData.find(
          (veri) => veri.kalemAdi === "Uzun Vadeli Yükümlülükler [abstract]"
        )?.tutarYil1 ?? 0,
        fdtData.find(
          (veri) => veri.kalemAdi === "Uzun Vadeli Yükümlülükler [abstract]"
        )?.tutarYil2 ?? 0,
        fdtData.find(
          (veri) => veri.kalemAdi === "Uzun Vadeli Yükümlülükler [abstract]"
        )?.tutarYil3 ?? 0,
      ];
      const donusum4GrubuTutarlar = donusumMizanlar.map((donusumMizan) =>
        donusumMizan
          .filter(
            (veri: DonusumMizan) =>
              veri.detayKodu.startsWith("4") && veri.detayKodu.length === 3
          )
          .reduce(
            (toplam: number, veri: DonusumMizan) =>
              toplam + (veri.alacakBakiye || 0),
            0
          )
      );
      const newRowsUzun = yilFarklari.map((yilFarki, index) => ({
        yil: (user.yil || 0) + yilFarki,
        finansalDurumTablosu: fdtTutarlarUzun[index],
        mizan: donusum4GrubuTutarlar[index],
        fark: fdtTutarlarUzun[index] - donusum4GrubuTutarlar[index],
      }));
      setFinansalDurumTablosuUzunVadeliYukumlulukler(newRowsUzun);

      const fdtTutarlarOzkaynaklar = [
        fdtData.find((veri) => veri.kalemAdi === "Özkaynaklar [abstract]")
          ?.tutarYil1 ?? 0,
        fdtData.find((veri) => veri.kalemAdi === "Özkaynaklar [abstract]")
          ?.tutarYil2 ?? 0,
        fdtData.find((veri) => veri.kalemAdi === "Özkaynaklar [abstract]")
          ?.tutarYil3 ?? 0,
      ];
      const donusum5GrubuTutarlar = donusumMizanlar.map((donusumMizan) =>
        donusumMizan
          .filter(
            (veri: DonusumMizan) =>
              veri.detayKodu.startsWith("5") && veri.detayKodu.length === 3
          )
          .reduce(
            (toplam: number, veri: DonusumMizan) =>
              toplam + (veri.alacakBakiye || 0),
            0
          )
      );
      const newRowsOzkaynaklar = yilFarklari.map((yilFarki, index) => ({
        yil: (user.yil || 0) + yilFarki,
        finansalDurumTablosu: fdtTutarlarOzkaynaklar[index],
        mizan: donusum5GrubuTutarlar[index],
        fark: fdtTutarlarOzkaynaklar[index] - donusum5GrubuTutarlar[index],
      }));
      setFinansalDurumTablosuOzkaynaklar(newRowsOzkaynaklar);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchFinansalDurumTablosu();
  }, [fdtData]);

  return (
    <Grid container>
      <Grid item xs={12} lg={12} sx={{ mb: 2 }}>
        {1 && (
          <>
            <Paper
              elevation={2}
              sx={{
                p: 1,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "primary.light",
              }}
            >
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Dönen Varlıklar</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">
                          Finansal Durum Tablosu
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Mizan</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Fark</Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "4%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Tooltip title={""}>
                          <Fab
                            size="small"
                            sx={{
                              backgroundColor: "transparent",
                            }}
                          ></Fab>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {finansalDurumTablosuDonenVarliklar.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.yil}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.finansalDurumTablosu)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.mizan)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.fark)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Duran Varlıklar</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">
                          Finansal Durum Tablosu
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Mizan</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Fark</Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "4%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Tooltip title={""}>
                          <Fab
                            size="small"
                            sx={{
                              backgroundColor: "transparent",
                            }}
                          ></Fab>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {finansalDurumTablosuDuranVarliklar.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.yil}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.finansalDurumTablosu)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.mizan)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.fark)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Kısa Vadeli</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">
                          Finansal Durum Tablosu
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Mizan</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Fark</Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "4%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Tooltip title={""}>
                          <Fab
                            size="small"
                            sx={{
                              backgroundColor: "transparent",
                            }}
                          ></Fab>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {finansalDurumTablosuKisaVadeliYukumlulukler.map(
                      (row, index) => (
                        <TableRow key={index}>
                          <TableCell align="center" sx={{ border: "none" }}>
                            {row.yil}
                          </TableCell>
                          <TableCell align="right" sx={{ border: "none" }}>
                            {formatNumber(row.finansalDurumTablosu)}
                          </TableCell>
                          <TableCell align="right" sx={{ border: "none" }}>
                            {formatNumber(row.mizan)}
                          </TableCell>
                          <TableCell align="right" sx={{ border: "none" }}>
                            {formatNumber(row.fark)}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Uzun Vadeli</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">
                          Finansal Durum Tablosu
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Mizan</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Fark</Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "4%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Tooltip title={""}>
                          <Fab
                            size="small"
                            sx={{
                              backgroundColor: "transparent",
                            }}
                          ></Fab>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {finansalDurumTablosuUzunVadeliYukumlulukler.map(
                      (row, index) => (
                        <TableRow key={index}>
                          <TableCell align="center" sx={{ border: "none" }}>
                            {row.yil}
                          </TableCell>
                          <TableCell align="right" sx={{ border: "none" }}>
                            {formatNumber(row.finansalDurumTablosu)}
                          </TableCell>
                          <TableCell align="right" sx={{ border: "none" }}>
                            {formatNumber(row.mizan)}
                          </TableCell>
                          <TableCell align="right" sx={{ border: "none" }}>
                            {formatNumber(row.fark)}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Özkaynaklar</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">
                          Finansal Durum Tablosu
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Mizan</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Fark</Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "4%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Tooltip title={""}>
                          <Fab
                            size="small"
                            sx={{
                              backgroundColor: "transparent",
                            }}
                          ></Fab>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {finansalDurumTablosuOzkaynaklar.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.yil}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.finansalDurumTablosu)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.mizan)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.fark)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default FinansalDurumCardTable;
