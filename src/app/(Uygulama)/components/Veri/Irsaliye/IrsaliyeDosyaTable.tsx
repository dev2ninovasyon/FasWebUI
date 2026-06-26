import React from "react";
import {
  TableContainer, Table, TableRow, TableCell, TableBody,
  Typography, TableHead, IconButton, TextField, Box,
  Checkbox, Button, Menu, MenuItem, ListItemIcon,
  Collapse, Dialog, DialogContent, CircularProgress,
  Skeleton, Stack, Chip, Tooltip, LinearProgress, useMediaQuery,
} from "@mui/material";
import {
  IconDotsVertical, IconEye, IconChevronRight,
  IconChevronDown, IconTrash, IconRefresh,
} from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { deleteIrsaliyeIslemleri, previewIrsaliyeDosyasi } from "@/api/Fatura/IrsaliyeApi";
import { enqueueSnackbar } from "notistack";
import { useLoading } from "@/contexts/LoadingContext";
import { ConfirmPopUpComponent } from "@/app/(Uygulama)/components/CalismaKagitlari/ConfirmPopUp";

type IrsaliyeDosyaRow = {
  id: string;
  dosyaAdi: string;
  durum: string;
  yuklemeTarihi: string;
};

type IrsaliyeRow = {
  id: string;
  adi: string;
  olusturulmaTarihi: string;
  tip?: string;
  total: number;
  basarili: number;
  hatali: number;
  durum: string;
  dosyalar?: IrsaliyeDosyaRow[];
};

const SkeletonRows: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
  <TableBody>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        <TableCell padding="checkbox"><Skeleton variant="rectangular" width={18} height={18} /></TableCell>
        <TableCell width={48}><Skeleton variant="circular" width={24} height={24} /></TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="text" width="50%" height={22} />
            <Skeleton variant="rectangular" width={84} height={22} sx={{ borderRadius: 999 }} />
          </Stack>
        </TableCell>
        <TableCell align="center"><Skeleton variant="text" width={96} height={22} sx={{ mx: "auto" }} /></TableCell>
        <TableCell align="center"><Skeleton variant="text" width={56} height={22} sx={{ mx: "auto" }} /></TableCell>
        <TableCell align="right"><Skeleton variant="circular" width={24} height={24} sx={{ ml: "auto" }} /></TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const IrsaliyeDosyaTable: React.FC<{
  rows: IrsaliyeRow[];
  initialLoading?: boolean;
  onRefresh?: () => void;
}> = ({ rows, initialLoading = false, onRefresh }) => {
  const user = useSelector((s: AppState) => s.userReducer);
  const { setLoading } = useLoading();

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rpp, setRpp] = React.useState(10);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewErr, setPreviewErr] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = React.useState(false);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const filtered = rows.filter((r) =>
    (r.adi || "").toLowerCase().includes(search.toLowerCase())
  );

  const toast = (msg: string, variant: "success" | "error" | "warning" | "info" = "info") =>
    enqueueSnackbar(msg, { variant, autoHideDuration: 3500, style: { maxWidth: 720 } });

  const toggleExpand = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const checkAll = (checked: boolean) => setSelected(checked ? filtered.map((f) => f.id) : []);

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    try {
      setIsDeleting(true);
      await deleteIrsaliyeIslemleri(user, selected);
      toast(`${selected.length} kayıt silindi.`, "success");
      setSelected([]);
      onRefresh?.();
      setIsConfirmPopUpOpen(false);
    } catch { toast("Silme sırasında hata oluştu.", "error"); }
    finally { setIsDeleting(false); }
  };

  const handlePreviewClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setPreviewErr(null); setPreviewOpen(false);
  };

  React.useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  return (
    <>
      <Box p={2} display="flex" gap={2} alignItems="center">
        <Typography variant="h5" sx={{ flexShrink: 0 }}>İrsaliye İşlemleri</Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <TextField placeholder="Arama" size="small" value={search}
            onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1, minWidth: 0 }} />
          <IconButton aria-label="Yenile" onClick={() => onRefresh?.()}><IconRefresh size={18} /></IconButton>
        </Stack>
      </Box>

      <TableContainer sx={{ mt: 0.5, maxHeight: 425, minHeight: 425, overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox checked={selected.length > 0 && selected.length === filtered.length && filtered.length > 0}
                  indeterminate={selected.length > 0 && selected.length < filtered.length}
                  onChange={(e) => checkAll(e.target.checked)} />
              </TableCell>
              <TableCell />
              <TableCell>İşlem Adı</TableCell>
              <TableCell align="center">Tarih</TableCell>
              <TableCell align="center">Durum</TableCell>
              <TableCell align="right">İşlem</TableCell>
            </TableRow>
          </TableHead>

          {initialLoading ? <SkeletonRows rows={8} /> : (
            <TableBody>
              {(rpp > 0 ? filtered.slice(page * rpp, page * rpp + rpp) : filtered).map((row) => {
                const processed = row.basarili + row.hatali;
                const showChip = row.total > 0 && processed < row.total;
                const pct = row.total > 0 ? Math.round((processed / row.total) * 100) : 0;
                const chipColor: "default" | "success" | "warning" | "error" =
                  showChip ? (row.hatali > 0 ? "warning" : "default") : "success";

                return (
                  <React.Fragment key={row.id}>
                    <TableRow hover selected={selected.includes(row.id)}
                      onClick={() => setSelected(s => s.includes(row.id) ? s.filter(x => x !== row.id) : [...s, row.id])}>
                      <TableCell padding="checkbox"><Checkbox checked={selected.includes(row.id)} /></TableCell>
                      <TableCell width={48}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleExpand(row.id); }}>
                          {expanded[row.id] ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography>{row.adi}</Typography>
                          {showChip && (
                            <Tooltip title={row.hatali > 0 ? `Hatalı: ${row.hatali}` : "İşleniyor"}>
                              <Chip label="İşleniyor" size="small" color={chipColor} variant="filled" />
                            </Tooltip>
                          )}
                          {!showChip && row.total > 0 && (
                            <Chip label="Tamamlandı" size="small" color="success" variant="outlined" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">{row.olusturulmaTarihi}</TableCell>
                      <TableCell align="center">
                        <Stack spacing={0.5} sx={{ minWidth: 140 }}>
                          <Typography variant="caption" sx={{ fontWeight: "bold" }}>{pct}%</Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Box sx={{ flex: 1, minWidth: 60 }}>
                              <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 1 }} />
                            </Box>
                            <Typography variant="caption" sx={{ minWidth: 50, textAlign: "right" }}>
                              {processed}/{row.total}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuOpen(true); }}>
                          <IconDotsVertical width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                        <Collapse in={!!expanded[row.id]} timeout="auto" unmountOnExit>
                          <Box px={2} py={1}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>İrsaliye Dosyaları</Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Dosya Adı</TableCell>
                                  <TableCell>Durum</TableCell>
                                  <TableCell>Tarih</TableCell>
                                  <TableCell align="right">Önizleme</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(row.dosyalar || []).map((d) => (
                                  <TableRow key={d.id} hover>
                                    <TableCell>{d.dosyaAdi}</TableCell>
                                    <TableCell>{d.durum}</TableCell>
                                    <TableCell>{d.yuklemeTarihi}</TableCell>
                                    <TableCell align="right">
                                      <Button size="small" startIcon={previewLoading ? <CircularProgress size={14} /> : <IconEye size={16} />}
                                        disabled={previewLoading}
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            setPreviewLoading(true); setPreviewErr(null);
                                            const blob = await previewIrsaliyeDosyasi(user, d.id);
                                            setPreviewUrl(URL.createObjectURL(blob)); setPreviewOpen(true);
                                          } catch { setPreviewErr("Önizleme açılamadı."); }
                                          finally { setPreviewLoading(false); }
                                        }}>
                                        Göster
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {(!row.dosyalar || row.dosyalar.length === 0) && (
                                  <TableRow><TableCell colSpan={4}><Typography color="text.secondary">Kayıt yok</Typography></TableCell></TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {selected.length !== 0 && (
        <Box mt={1} ml={1}>
          <Button variant="outlined" color="error" size="small" startIcon={<IconTrash size={16} />}
            loading={isDeleting} onClick={() => setIsConfirmPopUpOpen(true)} sx={{ minWidth: 100 }}>
            {selected.length} Kayıt Sil
          </Button>
        </Box>
      )}

      <Menu anchorEl={menuAnchor} open={menuOpen} onClose={() => setMenuOpen(false)}>
        <MenuItem disabled><ListItemIcon><IconDotsVertical width={18} /></ListItemIcon>İşlemler</MenuItem>
      </Menu>

      <Dialog open={previewOpen} onClose={handlePreviewClose} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          {previewErr ? <Box p={3}>{previewErr}</Box>
            : previewUrl ? <iframe title="İrsaliye Önizleme" src={previewUrl} width="100%" height="800" style={{ border: "none" }} />
            : <Box p={3} display="flex" alignItems="center" gap={1}><CircularProgress size={18} /> Yükleniyor…</Box>}
        </DialogContent>
      </Dialog>

      {isConfirmPopUpOpen && (
        <ConfirmPopUpComponent isConfirmPopUp={isConfirmPopUpOpen}
          handleClose={() => setIsConfirmPopUpOpen(false)}
          handleDelete={handleDeleteSelected} isLoading={isDeleting} />
      )}
    </>
  );
};

export default IrsaliyeDosyaTable;
