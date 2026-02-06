"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography,
  useTheme,
  FormControl, InputLabel, Select, MenuItem, Box, Button, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getBenfordDagilim, getBenfordHesapKodlari, getBenfordBasamakKayitlari } from "@/api/Analizler/Benford";
import BenfordChart from "./BenfordAnalizChart";
import { IconRefresh, IconX } from "@tabler/icons-react";
// import pathâ€™ını projendeki BlankCard konumuna göre ayarla:
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";

export interface DagilimDto {
  basamak: number;
  gercekSayi: number;
  gercekFrekans: number;
  teorikFrekans: number;
  fark: number;
}
export interface BenfordDagilimResponse {
  denetlenenId: number;
  yil: number;
  kebirKodu?: number | null;
  toplamDegerSayisi: number;
  dagilim: DagilimDto[];
}

interface Props {
  showGraph: boolean;
  toast: (msg: string, ok?: boolean) => void;
}

const BenfordAnaliz: React.FC<Props> = ({ showGraph, toast }) => {
  const user = useSelector((s: AppState) => s.userReducer);
  const theme = useTheme();

  const [kebirList, setKebirList] = useState<number[]>([]);
  const [selectedKebir, setSelectedKebir] = useState<number | "ALL">("ALL");
  const [data, setData] = useState<BenfordDagilimResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupBasamak, setPopupBasamak] = useState<number | null>(null);
  const [popupRecords, setPopupRecords] = useState<any[]>([]);
  const [popupLoading, setPopupLoading] = useState(false);

  const yil = user.yil || 0;
  const denetlenenId = user.denetlenenId || 0;
  const token = user.token || "";

  const title = useMemo(() => {
    const base = "Benford İlk Basamak Dağılımı";
    if (selectedKebir === "ALL") return `${base} - Tümü (${yil})`;
    return `${base} - ${selectedKebir} (${yil})`;
  }, [selectedKebir, yil]);

  const loadKebir = async () => {
    try {
      const list = await getBenfordHesapKodlari(yil, denetlenenId);
      setKebirList(list ?? []);
    } catch {
      toast("Hesap kodları alınamadı", false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const kebirKodu = selectedKebir === "ALL" ? undefined : Number(selectedKebir);
      const res = await getBenfordDagilim(yil, denetlenenId, kebirKodu);
      setData(res ?? null);
      if (!res || (res.dagilim ?? []).length === 0) toast("Kayıt bulunamadı", false);
    } catch {
      toast("Benford verisi alınamadı", false);
    } finally {
      setLoading(false);
    }
  };

  const handleBasamakClick = async (basamak: number) => {
    console.log("Grafik tıklandı, basamak:", basamak);
    setPopupBasamak(basamak);
    setPopupRecords([]);
    setPopupOpen(true);
    setPopupLoading(true);
    try {
      const kebirKodu = selectedKebir === "ALL" ? undefined : Number(selectedKebir);
      const res = await getBenfordBasamakKayitlari(yil, denetlenenId, basamak, kebirKodu);
      setPopupRecords(res ?? []);
    } catch {
      toast("Kayıtlar alınamadı", false);
    } finally {
      setPopupLoading(false);
    }
  };

  useEffect(() => { loadKebir(); }, []);
  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [selectedKebir]);

  const formatPct = (n: number) =>
    new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 3 }).format(
      n * 100,
    );

  // sağa hizalı skeleton helper
  const RightSkel: React.FC<{ width?: number | string }> = ({ width = 60 }) => (
    <Skeleton variant="text" width={width} sx={{ ml: "auto" }} />
  );

  // tablo iskelet satırları (ör: 9 adet)
  const renderSkeletonRows = () =>
    [...Array(9)].map((_, i) => (
      <TableRow key={`sk-${i}`}>
        <TableCell>
          <Skeleton variant="text" width={140} />
        </TableCell>
        <TableCell align="right"><RightSkel width={70} /></TableCell>
        <TableCell align="right"><RightSkel width={70} /></TableCell>
        <TableCell align="right"><RightSkel width={70} /></TableCell>
        <TableCell align="right"><RightSkel width={70} /></TableCell>
      </TableRow>
    ));

  return (
    <Grid container mt={1} spacing={2}>
      {/* üst filtre alanı */}
      <Grid
        sx={{ display: "flex", gap: 2 }}
        size={{
          xs: 12,
          lg: 12
        }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="kebir-select">Kebir Kodu</InputLabel>
          <Select
            labelId="kebir-select"
            label="Kebir Kodu"
            value={selectedKebir}
            onChange={(e) => setSelectedKebir(e.target.value as any)}
          >
            <MenuItem value={"ALL"}>Tümü</MenuItem>
            {kebirList.map((k) => (
              <MenuItem key={k} value={k}>
                {k}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />


      </Grid>
      {/* içerik: grafik ya da tablo â€” ikisi de aynı BlankCard stilinde */}
      {showGraph ? (
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <BlankCard>
            {loading ? (
              <Box p={2}>
                <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />
              </Box>
            ) : (
              <Box p={2}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {title}
                </Typography>
                <BenfordChart response={data} title={title} onBasamakClick={handleBasamakClick} />
              </Box>
            )}
          </BlankCard>
        </Grid>
      ) : (
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <BlankCard>
            <TableContainer>
              <Table aria-label="benford-table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6">{title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography textAlign="right" variant="h6">Gerçek (Adet)</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography textAlign="right" variant="h6">Gerçek %</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography textAlign="right" variant="h6">Teorik %</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography textAlign="right" variant="h6">Fark (pp)</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    renderSkeletonRows()
                  ) : (data?.dagilim ?? []).length > 0 ? (
                    (data?.dagilim ?? []).map((row) => (
                      <TableRow key={row.basamak} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell>
                          <Typography variant="h6">İlk Basamak: {row.basamak}</Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="subtitle1" color="textSecondary">
                            {row.gercekSayi}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="subtitle1" color="textSecondary">
                            %{formatPct(row.gercekFrekans)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="subtitle1" color="textSecondary">
                            %{formatPct(row.teorikFrekans)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="subtitle1" color="textSecondary">
                            %{formatPct(row.fark)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="subtitle1" color="textSecondary">
                          Gösterilecek kayıt yok.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </BlankCard>
        </Grid>
      )}
      {/* Kayıt Detay Popup */}
      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5">
            Basamak Detayı: {popupBasamak} ({popupRecords.length} Kayıt)
          </Typography>
          <Button onClick={() => setPopupOpen(false)} size="small">
            <IconX size={20} />
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Yevmiye No</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Hesap Adı</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell align="right">Borç</TableCell>
                  <TableCell align="right">Alacak</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {popupLoading ? (
                  renderSkeletonRows()
                ) : popupRecords.length > 0 ? (
                  popupRecords.map((r, idx) => (
                    <TableRow key={r.id || idx}>
                      <TableCell>{r.yevmiyeNo}</TableCell>
                      <TableCell>{r.yevmiyeTarih?.split("T")[0]}</TableCell>
                      <TableCell>{r.hesapAdi}</TableCell>
                      <TableCell>{r.aciklama}</TableCell>
                      <TableCell align="right">{r.borc?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell align="right">{r.alacak?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Kayıt bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPopupOpen(false)} variant="outlined">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default BenfordAnaliz;
