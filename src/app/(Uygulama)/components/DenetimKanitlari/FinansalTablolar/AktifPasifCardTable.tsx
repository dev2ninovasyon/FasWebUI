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
import { IconEye, IconEyeOff } from "@tabler/icons-react";

interface AktifPasifTablosu {
  yil: number;
  aktifToplami: number;
  pasifToplami: number;
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
  detayTiklandimi: boolean;
  setDetayTiklandimi: (bool: boolean) => void;
}

const AktifPasifCardTable = ({
  fdtData,
  detayTiklandimi,
  setDetayTiklandimi,
}: Props) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const [aktifPasifTablosu, setAktifPasifTablosu] = useState<
    AktifPasifTablosu[]
  >([]);

  const fetchAktifPasifCardTablosu = async () => {
    try {
      const varliklarTutar =
        fdtData.find((veri: any) => veri.kalemAdi === "Varlıklar [abstract]")
          ?.tutarYil1 ?? 0;
      const kaynaklarTutar =
        fdtData.find((veri: any) => veri.kalemAdi === "Kaynaklar [abstract]")
          ?.tutarYil1 ?? 0;

      const varliklarTutar2 =
        fdtData.find((veri: any) => veri.kalemAdi === "Varlıklar [abstract]")
          ?.tutarYil2 ?? 0;
      const kaynaklarTutar2 =
        fdtData.find((veri: any) => veri.kalemAdi === "Kaynaklar [abstract]")
          ?.tutarYil2 ?? 0;

      const varliklarTutar3 =
        fdtData.find((veri: any) => veri.kalemAdi === "Varlıklar [abstract]")
          ?.tutarYil3 ?? 0;
      const kaynaklarTutar3 =
        fdtData.find((veri: any) => veri.kalemAdi === "Kaynaklar [abstract]")
          ?.tutarYil3 ?? 0;

      const newRows: AktifPasifTablosu[] = [];

      newRows.push({
        yil: user.yil || 0,
        aktifToplami: varliklarTutar,
        pasifToplami: kaynaklarTutar,
        fark: varliklarTutar - kaynaklarTutar,
      });
      newRows.push({
        yil: (user.yil || 0) - 1,
        aktifToplami: varliklarTutar2,
        pasifToplami: kaynaklarTutar2,
        fark: varliklarTutar2 - kaynaklarTutar2,
      });
      newRows.push({
        yil: (user.yil || 0) - 2,
        aktifToplami: varliklarTutar3,
        pasifToplami: kaynaklarTutar3,
        fark: varliklarTutar3 - kaynaklarTutar3,
      });

      setAktifPasifTablosu(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchAktifPasifCardTablosu();
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
              <TableContainer sx={{ position: "relative", maxHeight: 400 }}>
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
                        <Typography variant="h6">Aktif Toplamı</Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "24%",
                          backgroundColor: "primary.light",
                          borderBottom: 0,
                        }}
                      >
                        <Typography variant="h6">Pasif Toplamı</Typography>
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
                        <Tooltip
                          title={
                            detayTiklandimi ? "Detay Gizle" : "Detay Göster"
                          }
                        >
                          <Fab
                            color="warning"
                            size="small"
                            onClick={() => setDetayTiklandimi(!detayTiklandimi)}
                          >
                            {detayTiklandimi ? (
                              <IconEyeOff width={16} height={16} />
                            ) : (
                              <IconEye width={16} height={16} />
                            )}
                          </Fab>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {aktifPasifTablosu.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="center" sx={{ border: "none" }}>
                          {row.yil}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.aktifToplami)}
                        </TableCell>
                        <TableCell align="right" sx={{ border: "none" }}>
                          {formatNumber(row.pasifToplami)}
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

export default AktifPasifCardTable;
