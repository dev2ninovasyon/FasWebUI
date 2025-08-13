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
} from "@mui/material";
import {
  getTersBakiyeVerenDonusumMizanHesaplari,
  getTersBakiyeVerenProgramVukMizanHesaplari,
} from "@/api/Donusum/Donusum";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface ProgramVukMizanHesaplari {
  kebirKodu: number;
  detayKodu: string;
  hesapAdi: string;
  borcTutari: number;
  alacakTutari: number;
  netBakiye: number;
}

interface DonusumMizanHesaplari {
  kebirKodu: number;
  detayKodu: string;
  hesapAdi: string;
  raporBorc: number;
  raporAlacak: number;
  borcBakiye: number;
  alacakBakiye: number;
}

interface Props {
  donusumIslemiYapTiklandiMi?: boolean;
  setDonusumIslemiYapTiklandiMi?: (bool: boolean) => void;
}

const DonusumMizanKontrolCardTable: React.FC<Props> = ({
  donusumIslemiYapTiklandiMi,
  setDonusumIslemiYapTiklandiMi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const [programVukMizanHesaplari, setProgramVukMizanHesaplari] = useState<
    ProgramVukMizanHesaplari[]
  >([]);

  const [donusumMizanHesaplari, setDonusumMizanHesaplari] = useState<
    DonusumMizanHesaplari[]
  >([]);

  const fetchProgramVukMizanHesaplari = async () => {
    try {
      const tersBakiyeVerenHesaplar =
        await getTersBakiyeVerenProgramVukMizanHesaplari(
          user.token || "",
          user.denetlenenId || 0,
          user.yil || 0
        );
      const rowsAll: any = [];

      tersBakiyeVerenHesaplar.forEach((veri: any) => {
        const newRow: ProgramVukMizanHesaplari = {
          kebirKodu: veri.kebirKodu,
          detayKodu: veri.detayKodu,
          hesapAdi: veri.hesapAdi,
          borcTutari: veri.borcTutari,
          alacakTutari: veri.alacakTutari,
          netBakiye: veri.netBakiye,
        };
        rowsAll.push(newRow);
      });
      setProgramVukMizanHesaplari(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchDonusumMizanHesaplari = async () => {
    try {
      const tersBakiyeVerenHesaplar =
        await getTersBakiyeVerenDonusumMizanHesaplari(
          user.token || "",
          user.denetlenenId || 0,
          user.yil || 0
        );
      const rowsAll: any = [];

      tersBakiyeVerenHesaplar.forEach((veri: any) => {
        const newRow: DonusumMizanHesaplari = {
          kebirKodu: veri.kebirKodu,
          detayKodu: veri.detayKodu,
          hesapAdi: veri.hesapAdi,
          raporBorc: veri.raporBorc,
          raporAlacak: veri.raporAlacak,
          borcBakiye: veri.borcBakiye,
          alacakBakiye: veri.alacakBakiye,
        };
        rowsAll.push(newRow);
      });
      setDonusumMizanHesaplari(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchProgramVukMizanHesaplari();
    fetchDonusumMizanHesaplari();
  }, []);

  useEffect(() => {
    if (!donusumIslemiYapTiklandiMi) {
      fetchProgramVukMizanHesaplari();
      fetchDonusumMizanHesaplari();
    } else {
      setProgramVukMizanHesaplari([]);
      setDonusumMizanHesaplari([]);
    }
  }, [donusumIslemiYapTiklandiMi]);

  return (
    <Grid container>
      <Grid item xs={12} lg={12} sx={{ mb: 2 }}>
        {programVukMizanHesaplari.length > 0 && (
          <>
            <Typography variant="h6" textAlign="left" mb={2}>
              Program Vuk Mizan Ters Bakiye Veren Hesaplar:
            </Typography>
            <Paper
              elevation={2}
              sx={{
                p: 1,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "warning.light",
              }}
            >
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          width: "15%",
                          backgroundColor: "warning.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Kebir Kodu</Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "15%",
                          backgroundColor: "warning.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Detay Kodu</Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "15%",
                          backgroundColor: "warning.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Hesap Adı</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "15%",
                          backgroundColor: "warning.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Borç</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "15%",
                          backgroundColor: "warning.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Alacak</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "15%",
                          backgroundColor: "warning.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Bakiye</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {programVukMizanHesaplari.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.kebirKodu}
                        </TableCell>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.detayKodu}
                        </TableCell>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.hesapAdi}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.borcTutari)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.alacakTutari)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.netBakiye)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
        {donusumMizanHesaplari.length > 0 && (
          <>
            <Typography variant="h6" textAlign="left" mb={2}>
              Dönüşüm Mizan Ters Bakiye Veren Hesaplar:
            </Typography>
            <Paper
              elevation={2}
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: "error.light",
              }}
            >
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          width: "15%",
                          backgroundColor: "error.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Kebir Kodu</Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "15%",
                          backgroundColor: "error.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Detay Kodu</Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "15%",
                          backgroundColor: "error.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Hesap Adı</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "15%",
                          backgroundColor: "error.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Borç</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "15%",
                          backgroundColor: "error.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Alacak</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "15%",
                          backgroundColor: "error.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Bakiye</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {donusumMizanHesaplari.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.kebirKodu}
                        </TableCell>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.detayKodu}
                        </TableCell>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.hesapAdi}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.raporBorc)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.raporAlacak)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {row.kebirKodu < 300
                            ? formatNumber(row.borcBakiye)
                            : formatNumber(row.alacakBakiye)}
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

export default DonusumMizanKontrolCardTable;
