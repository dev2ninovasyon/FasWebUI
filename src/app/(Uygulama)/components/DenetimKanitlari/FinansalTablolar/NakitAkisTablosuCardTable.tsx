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

interface NakitAkisTablosu {
  yil: number;
  nakitAkisTablosu: number;
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
  natData: Veri[];
}

const NakitAkisCardTable = ({ fdtData, natData }: Props) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const [nakitAkisTablosu, setNakitAkisTablosu] = useState<NakitAkisTablosu[]>(
    []
  );

  const fetchNakitAkisCardTablosu = async () => {
    try {
      const fdtTutar =
        fdtData.find(
          (veri: any) => veri.kalemAdi === "Nakit ve Nakit Benzerleri"
        )?.tutarYil1 ?? 0;

      const natTutar =
        natData.find(
          (veri: any) =>
            veri.kalemAdi === "Dönem Sonu Nakit ve Nakit Benzerleri"
        )?.tutarYil1 ?? 0;

      const fdtTutar2 =
        fdtData.find(
          (veri: any) => veri.kalemAdi === "Nakit ve Nakit Benzerleri"
        )?.tutarYil2 ?? 0;

      const natTutar2 =
        natData.find(
          (veri: any) =>
            veri.kalemAdi === "Dönem Sonu Nakit ve Nakit Benzerleri"
        )?.tutarYil2 ?? 0;

      const fdtTutar3 =
        fdtData.find(
          (veri: any) => veri.kalemAdi === "Nakit ve Nakit Benzerleri"
        )?.tutarYil3 ?? 0;

      const natTutar3 =
        natData.find(
          (veri: any) =>
            veri.kalemAdi === "Dönem Sonu Nakit ve Nakit Benzerleri"
        )?.tutarYil3 ?? 0;

      const newRows: NakitAkisTablosu[] = [];

      newRows.push({
        yil: user.yil || 0,
        nakitAkisTablosu: natTutar,
        finansalDurumTablosu: fdtTutar,
        fark: natTutar - fdtTutar,
      });
      newRows.push({
        yil: (user.yil || 0) - 1,
        nakitAkisTablosu: natTutar2,
        finansalDurumTablosu: fdtTutar2,
        fark: natTutar2 - fdtTutar2,
      });
      newRows.push({
        yil: (user.yil || 0) - 2,
        nakitAkisTablosu: natTutar3,
        finansalDurumTablosu: fdtTutar3,
        fark: natTutar3 - fdtTutar3,
      });

      setNakitAkisTablosu(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchNakitAkisCardTablosu();
  }, [fdtData, natData]);

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
                        <Typography variant="h6">Nakit Akış Tablosu</Typography>
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
                    {nakitAkisTablosu.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.yil}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.nakitAkisTablosu)}
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

export default NakitAkisCardTable;
