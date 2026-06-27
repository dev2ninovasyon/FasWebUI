"use client";
import { Box, Grid, Card, CardContent, Typography, Chip, Stack, Divider } from "@mui/material";
import { Fatura, Vergi } from "@/api/Fatura/FaturaApi";

type Props = {
  fatura: Fatura | null;
  tip: string;
};

export default function FaturaDetayKartlari({ fatura, tip }: Props) {
  if (!fatura) return null;

  const tedarikci = fatura.tedarikci;
  const alici = fatura.alici;
  const detay = fatura.faturaDetay;
  const vergiler = fatura.vergiler ?? [];

  const toplamVergi = vergiler.reduce((s: number, v: Vergi) => s + v.vergiTutari, 0);
  const toplamMatrah = vergiler.reduce((s: number, v: Vergi) => s + v.vergiMatrahi, 0);

  const formatTarih = (iso: string) => {
    if (!iso) return "-";
    try { return new Date(iso).toLocaleDateString("tr-TR"); } catch { return iso; }
  };

  return (
    <Grid container spacing={1.5} mb={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent sx={{ p: "12px !important", "&:last-child": { pb: "12px" } }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {tip === "Alınan" ? "Tedarikçi" : "Alıcı"}
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2"><strong>Ad:</strong> {tedarikci?.ad ?? "-"}</Typography>
              <Typography variant="body2"><strong>VKN:</strong> {tedarikci?.vergiNo ?? "-"}</Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                <strong>Adres:</strong> {tedarikci?.adres ?? "-"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent sx={{ p: "12px !important", "&:last-child": { pb: "12px" } }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {tip === "Alınan" ? "Alıcı" : "Tedarikçi"}
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2"><strong>Ad:</strong> {alici?.ad ?? "-"}</Typography>
              <Typography variant="body2"><strong>VKN:</strong> {alici?.vergiNo ?? "-"}</Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                <strong>Adres:</strong> {alici?.adres ?? "-"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent sx={{ p: "12px !important", "&:last-child": { pb: "12px" } }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>Fatura Bilgileri</Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2"><strong>No:</strong> {fatura.faturaNumarasi ?? "-"}</Typography>
              <Typography variant="body2"><strong>Tarih:</strong> {formatTarih(fatura.faturaTarihi)}</Typography>
              <Typography variant="body2"><strong>PB:</strong> {fatura.paraBirimi ?? "-"}</Typography>
              <Typography variant="body2">
                <strong>Tutar:</strong> {fatura.odenecekTutar.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {fatura.paraBirimi ?? ""}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent sx={{ p: "12px !important", "&:last-child": { pb: "12px" } }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>Vergi / Dosya</Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                <strong>Vergi:</strong> {toplamVergi.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ({toplamMatrah.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} matrah)
              </Typography>
              <Typography variant="body2" component="div"><strong>Durum:</strong> {detay?.durum ? <Chip label={detay.durum} size="small" color={detay.durum === "Başarılı" ? "success" : "default"} /> : "-"}</Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                <strong>Dosya:</strong> {detay?.dosyaAdi ?? "-"}
              </Typography>
              {detay?.durumMesaji && (
                <Typography variant="caption" color="text.secondary">{detay.durumMesaji}</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
