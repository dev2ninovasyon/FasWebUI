import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  TableContainer, Table, TableRow, TableCell, TableBody, Typography,
  TableHead, IconButton, TextField, Box, Checkbox, Button, Stack, Chip,
  Collapse, CircularProgress, LinearProgress, Card, CardContent, Select, MenuItem, FormControl
} from "@mui/material";
import {
  IconChevronRight, IconChevronDown, IconEye, IconFileText, IconRefresh, IconTrash
} from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getUploadSessionFaturalar } from "@/api/Fatura/FaturaApi";
import type { FaturaYuklemeGecmisiDto, UploadFaturaPagedResult, UploadFaturaKayitDto } from "@/api/Fatura/FaturaApi";
import { enqueueSnackbar } from "notistack";

const durumRenk: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  "İşleniyor": "info",
  "Kuyrukta": "default",
  "KismiTamamlandi": "warning",
  "Başarılı": "success",
  "Hatalı": "error",
  "Mükerrer": "warning",
  "Tamamlandı": "success",
  "Bekliyor": "default",
};

const durumMetin: Record<string, string> = {
  "İşleniyor": "İşleniyor",
  "Kuyrukta": "Bekliyor",
  "KismiTamamlandi": "Kısmen Başarılı",
  "Başarılı": "Tamamlandı",
  "Hatalı": "Hatalı",
  "Mükerrer": "Mükerrer",
};

const isValidSessionId = (id?: string | null) =>
  Boolean(id && id !== "00000000-0000-0000-0000-000000000000");

function hesaplaDurum(islem: FaturaYuklemeGecmisiDto): string {
  if (islem.durum === "İşleniyor" || islem.durum === "Kuyrukta") return islem.durum;
  const total = islem.dosyaSayisi;
  const basarili = islem.basariliDosyaSayisi;
  const hatali = islem.hataliDosyaSayisi ?? 0;
  const mukerrer = islem.mukerrerDosyaSayisi ?? 0;
  if (total === 0) return islem.durum;
  if (basarili > 0 && hatali > 0) return "KismiTamamlandi";
  if (basarili > 0 && hatali === 0 && mukerrer === 0) return "Başarılı";
  if (mukerrer > 0 && (basarili + mukerrer) >= total && hatali === 0) return "Başarılı";
  if (hatali >= total && hatali > 0) return "Hatalı";
  if (basarili >= total && basarili > 0) return "Başarılı";
  return islem.durum;
}

function SimpleDosyaListesi({ sessionId, onViewDetail: _onViewDetail, externalRefreshKey = 0 }: { sessionId: string; onViewDetail?: (dosyaId: string, dosyaAdi?: string) => void; externalRefreshKey?: number }) {
  const user = useSelector((s: AppState) => s.userReducer);
  const [data, setData] = useState<UploadFaturaPagedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUploadSessionFaturalar(user, sessionId, 1, 500);
      setData(result);
    } catch {
      enqueueSnackbar("Dosya listesi alınamadı", { variant: "error", autoHideDuration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  useEffect(() => { void load(); }, [load, refreshKey, externalRefreshKey]);

  if (loading && !data) {
    return (
      <Stack direction="row" alignItems="center" spacing={1} py={1}>
        <CircularProgress size={14} />
        <Typography variant="caption" color="text.secondary">Yükleniyor...</Typography>
      </Stack>
    );
  }

  if (!data) {
    return (
      <Typography variant="caption" color="text.secondary">
        Dosya listesi yüklenemedi{" "}
        <Button size="small" sx={{ p: 0, minWidth: 0, textTransform: "none", fontSize: 12 }} onClick={() => setRefreshKey(k => k + 1)}>
          Tekrar dene
        </Button>
      </Typography>
    );
  }

  if (data.items.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        Bu işlemde dosya kaydı bulunamadı.{" "}
        <Button size="small" sx={{ p: 0, minWidth: 0, textTransform: "none", fontSize: 12 }} onClick={() => setRefreshKey(k => k + 1)}>
          Yenile
        </Button>
      </Typography>
    );
  }

  const formatFaturaBilgisi = (k: UploadFaturaKayitDto) => {
    if (k.faturaNo) {
      const tarih = k.faturaTarihi ? new Date(k.faturaTarihi).toLocaleDateString("tr-TR") : "";
      return tarih ? `${k.faturaNo} (${tarih})` : k.faturaNo;
    }
    return k.dosyaAdi ?? "—";
  };

  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "auto", maxHeight: 300 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Fatura No / Dosya</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12, width: 100 }}>Durum</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Hata Mesajı</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12, width: 50 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {data.items.map((kayit) => {
            const isHatali = kayit.durum === "Hatalı" || kayit.durum?.toLowerCase().includes("hata");
            const isMukerrer = kayit.durum === "Mükerrer";
            return (
              <TableRow key={kayit.id} hover
                sx={isHatali ? { bgcolor: "error.light" } : isMukerrer ? { bgcolor: "warning.light" } : undefined}>
                <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}
                  title={formatFaturaBilgisi(kayit)}>
                  {formatFaturaBilgisi(kayit)}
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  {isMukerrer ? (
                    <Typography variant="caption" fontWeight={600} color="warning.main">Mükerrer</Typography>
                  ) : isHatali ? (
                    <Typography variant="caption" fontWeight={600} color="error">Hatalı</Typography>
                  ) : (
                    <Typography variant="caption" fontWeight={600} color="success.main">Başarılı</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, color: isHatali ? "error.main" : "text.secondary" }}
                  title={kayit.hataMesaji ?? ""}>
                  {kayit.hataMesaji ?? "—"}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => {
                    setPreviewLoadingId(kayit.id);
                    _onViewDetail?.(kayit.xmlDosyaId, kayit.dosyaAdi ?? undefined);
                    setPreviewLoadingId(null);
                  }}>
                    {previewLoadingId === kayit.id ? <CircularProgress size={14} /> : <IconEye size={14} />}
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {data.totalCount > 200 && (
        <Box px={2} py={1} sx={{ borderTop: 1, borderColor: "divider", bgcolor: "action.hover" }}>
          <Typography variant="caption" color="text.secondary">
            +{data.totalCount - 200} dosya daha var.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function UploadSessionDetay({ islem, onViewDetail }: { islem: FaturaYuklemeGecmisiDto; onViewDetail?: (dosyaId: string, dosyaAdi?: string) => void }) {
  const islenen = islem.basariliDosyaSayisi + (islem.hataliDosyaSayisi ?? 0) + (islem.mukerrerDosyaSayisi ?? 0);
  const devamEdiyor = islenen < islem.dosyaSayisi;

  return (
    <Box p={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
        {[
          { label: "Toplam", value: islem.dosyaSayisi, color: undefined },
          { label: "Başarılı", value: islem.basariliDosyaSayisi, color: "success.main" },
          { label: "Hatalı", value: islem.hataliDosyaSayisi ?? 0, color: (islem.hataliDosyaSayisi ?? 0) > 0 ? "error.main" : undefined },
          { label: "Mükerrer", value: islem.mukerrerDosyaSayisi ?? 0, color: (islem.mukerrerDosyaSayisi ?? 0) > 0 ? "warning.main" : undefined },
          { label: "Son Güncelleme", value: new Date(islem.baslamaTarihi).toLocaleString("tr-TR"), isText: true },
          { label: "Session", value: islem.uploadSessionId ? islem.uploadSessionId.slice(0, 12) + "…" : "—", isText: true },
        ].map((s) => (
          <Card key={s.label} variant="outlined" sx={{ minWidth: 100, flex: 1 }}>
            <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: s.color ?? undefined }}>
                {(s as any).isText ? s.value : typeof s.value === "number" ? s.value.toLocaleString("tr-TR") : s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {devamEdiyor && (
        <Stack direction="row" alignItems="center" spacing={1} border={1} borderColor="divider" borderRadius={1} px={2} py={1} mb={2} bgcolor="action.hover">
          <CircularProgress size={12} />
          <Typography variant="caption" color="text.secondary">
            İşlem devam ediyor — {islenen}/{islem.dosyaSayisi} dosya işlendi
          </Typography>
        </Stack>
      )}

      {islem.uploadSessionId ? (
        <SimpleDosyaListesi sessionId={islem.uploadSessionId} onViewDetail={onViewDetail as any} externalRefreshKey={islenen} />
      ) : (
        <Typography variant="caption" color="text.secondary">
          Bu kaydın eski olduğu için dosya detayı görüntülenemiyor.
        </Typography>
      )}
    </Box>
  );
}

interface DosyaTableProps {
  islemler: FaturaYuklemeGecmisiDto[];
  loading?: boolean;
  isPolling?: boolean;
  selectedSessionIds?: string[];
  onSelectChange?: (id: string | undefined) => void;
  onSelectAll?: (checked: boolean, ids?: string[]) => void;
  onRefresh?: () => void;
  onDelete?: () => void;
  onViewDetail?: (dosyaId: string, dosyaAdi?: string) => void;
}

const DosyaTable: React.FC<DosyaTableProps> = ({
  islemler,
  loading = false,
  isPolling = false,
  selectedSessionIds = [],
  onSelectChange,
  onSelectAll,
  onRefresh,
  onDelete,
  onViewDetail,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [durumFilter, setDurumFilter] = useState<string>("tumu");

  const filteredIslemler = useMemo(() => {
    if (durumFilter === "hatali") return islemler.filter(i => (i.hataliDosyaSayisi ?? 0) > 0);
    if (durumFilter === "mukerrer") return islemler.filter(i => (i.mukerrerDosyaSayisi ?? 0) > 0);
    return islemler;
  }, [islemler, durumFilter]);
  const selectableSessionIds = useMemo(
    () => filteredIslemler.map(i => i.uploadSessionId).filter((id): id is string => isValidSessionId(id)),
    [filteredIslemler]
  );
  const allSelected = selectableSessionIds.length > 0 && selectableSessionIds.every(id => selectedSessionIds.includes(id));

  const toggleExpand = (sessionId: string | undefined) => {
    const key = sessionId ?? "";
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" p={2}>
        <Typography variant="h6">
          Yükleme Geçmişi
          {islemler.length > 0 && (
            <Typography component="span" variant="body2" color="text.secondary" ml={1}>
              ({filteredIslemler.length} işlem)
            </Typography>
          )}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={durumFilter} onChange={(e) => setDurumFilter(e.target.value)}>
              <MenuItem value="tumu">Tüm İşlemler</MenuItem>
              <MenuItem value="hatali">Sadece Hatalı</MenuItem>
              <MenuItem value="mukerrer">Sadece Mükerrer</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" size="small" onClick={onRefresh} disabled={loading}>
            {loading || isPolling ? <CircularProgress size={14} sx={{ mr: 1 }} /> : <IconRefresh size={16} style={{ marginRight: 4 }} />}
            {isPolling ? "İzleniyor..." : "Yenile"}
          </Button>
          {selectedSessionIds.length > 0 && (
            <Button variant="outlined" color="error" size="small" onClick={onDelete}>
              <IconTrash size={16} style={{ marginRight: 4 }} />
              {selectedSessionIds.length} İşlem Sil
            </Button>
          )}
        </Stack>
      </Stack>

      <TableContainer sx={{ maxHeight: 400, overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: 50 }}>
                <Checkbox checked={allSelected} onChange={(e) => onSelectAll?.(e.target.checked, selectableSessionIds)} disabled={loading || selectableSessionIds.length === 0} />
              </TableCell>
              <TableCell sx={{ width: 48 }} />
              <TableCell sx={{ fontWeight: 600 }}>İşlem Adı</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fatura Tipi</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Toplam</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Başarılı</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Hatalı</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Mükerrer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && islemler.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary" mt={1}>Kayıtlar yükleniyor</Typography>
                </TableCell>
              </TableRow>
            ) : islemler.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">Henüz fatura yüklemesi yapılmamış</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredIslemler.map((islem) => {
                const sessionKey = islem.uploadSessionId ?? "";
                const canSelect = isValidSessionId(islem.uploadSessionId);
                const isExpanded = expandedRows.has(sessionKey);
                const isSelected = selectedSessionIds.includes(sessionKey);
                const durum = hesaplaDurum(islem);

                return (
                  <React.Fragment key={sessionKey}>
                    <TableRow hover selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={canSelect && isSelected} onChange={() => onSelectChange?.(islem.uploadSessionId)} disabled={loading || !canSelect} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleExpand(islem.uploadSessionId)}>
                          {isExpanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                        </IconButton>
                      </TableCell>
                      <TableCell><Typography fontWeight={500}>{islem.islemAdi}</Typography></TableCell>
                      <TableCell>
                        <Chip label={islem.tip} size="small" color={islem.tip === "Alınan" ? "primary" : "default"} variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{new Date(islem.baslamaTarihi).toLocaleString("tr-TR")}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{islem.dosyaSayisi.toLocaleString("tr-TR")}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{islem.basariliDosyaSayisi.toLocaleString("tr-TR")}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{(islem.hataliDosyaSayisi ?? 0).toLocaleString("tr-TR")}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{(islem.mukerrerDosyaSayisi ?? 0).toLocaleString("tr-TR")}</TableCell>
                      <TableCell>
                        <Chip label={durumMetin[durum] ?? durum} size="small" color={durumRenk[durum] ?? "default"} variant={durum === "İşleniyor" ? "filled" : "outlined"} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Button size="small" variant="text" onClick={() => islem.uploadSessionId && toggleExpand(islem.uploadSessionId)} sx={{ textTransform: "none", fontSize: 12 }}>
                            <IconEye size={14} style={{ marginRight: 4 }} />
                            Detay
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={11} sx={{ p: 0, border: 0, bgcolor: "action.hover" }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <UploadSessionDetay islem={islem} onViewDetail={onViewDetail} />
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DosyaTable;
