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

interface KarZararTablosu {
  yil: number;
  karZararTablosu: number;
  finansalDurumTablosu: number;
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
  kztData: Veri[];
}

const KarZararCardTable = ({ fdtData, kztData }: Props) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const [karZararTablosu, setKarZararTablosu] = useState<KarZararTablosu[]>([]);

  const fetchKarZararCardTablosu = async () => {
    try {
      const fdtTutar =
        fdtData.find(
          (veri: any) => veri.kalemAdi === "Dönem Net Karı/Zararı (+/-)"
        )?.tutarYil1 ?? 0;

      const kztTutar =
        kztData.find(
          (veri: any) => veri.kalemAdi === "Dönem Net Karı (Zararı) (+/-)"
        )?.tutarYil1 ?? 0;

      const fdtTutar2 =
        fdtData.find(
          (veri: any) => veri.kalemAdi === "Dönem Net Karı/Zararı (+/-)"
        )?.tutarYil2 ?? 0;

      const kztTutar2 =
        kztData.find(
          (veri: any) => veri.kalemAdi === "Dönem Net Karı (Zararı) (+/-)"
        )?.tutarYil2 ?? 0;

      const fdtTutar3 =
        fdtData.find(
          (veri: any) => veri.kalemAdi === "Dönem Net Karı/Zararı (+/-)"
        )?.tutarYil3 ?? 0;

      const kztTutar3 =
        kztData.find(
          (veri: any) => veri.kalemAdi === "Dönem Net Karı (Zararı) (+/-)"
        )?.tutarYil3 ?? 0;

      const newRows: KarZararTablosu[] = [];

      newRows.push({
        yil: user.yil || 0,
        karZararTablosu: kztTutar,
        finansalDurumTablosu: fdtTutar,
        fark: kztTutar - fdtTutar,
      });
      newRows.push({
        yil: (user.yil || 0) - 1,
        karZararTablosu: kztTutar2,
        finansalDurumTablosu: fdtTutar2,
        fark: kztTutar2 - fdtTutar2,
      });
      newRows.push({
        yil: (user.yil || 0) - 2,
        karZararTablosu: kztTutar3,
        finansalDurumTablosu: fdtTutar3,
        fark: kztTutar3 - fdtTutar3,
      });

      setKarZararTablosu(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchKarZararCardTablosu();
  }, [fdtData, kztData]);

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
                        <Typography variant="h6">Yıl</Typography>
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
                          Kar / Zarar Tablosu
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
                    {karZararTablosu.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.yil}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.karZararTablosu)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.finansalDurumTablosu)}
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

export default KarZararCardTable;
