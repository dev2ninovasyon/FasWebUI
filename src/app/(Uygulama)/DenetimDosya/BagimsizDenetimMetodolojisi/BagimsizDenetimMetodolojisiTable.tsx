import React, { useEffect, useState, useCallback } from "react";
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  useTheme,
  Stack,
  Box,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getDenetimDosya } from "@/api/DenetimDosya/DenetimDosya";
import {
  getEkBelgeler,
  downloadEkBelge,
  EkBelgeDto,
} from "@/api/CalismaKagitlari/CalismaKagitlariEkBelge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";

interface Veri {
  id: number;
  parentId?: number;
  name: string;
  bds?: string;
  code?: string;
  url?: string;
  reference?: string;
  archiveFileName?: string;
  children: Veri[];
}

const BagimsizDenetimMetodolojisiTable = () => {
  const [rows, setRows] = useState<Veri[]>([]);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // EkBelge durum haritası: formKodu -> EkBelgeDto[]
  const [ekBelgeDurumMap, setEkBelgeDurumMap] = useState<
    Record<string, EkBelgeDto[]>
  >({});
  const [durumLoading, setDurumLoading] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogBelgeler, setDialogBelgeler] = useState<EkBelgeDto[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Açılır/kapanır state: kapalı olan parent id'leri
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };

    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
  }

  // Açılır/kapanır toggle
  const toggleCollapse = (id: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // recursive şekilde children'ları düz liste haline getirelim
  // collapsedIds'deki parent'ların children'larını atla
  const flattenData = (
    data: Veri[],
    level = 0,
    isMaddiDogrulamaChild = false
  ): (Veri & { level: number; isForcedLeaf?: boolean })[] => {
    return data.flatMap((item) => {
      const isMaddiDogrulamaRoot = item.id === 166 || (level === 0 && normalizeString(item.name).includes("maddidogrulamaprosdurleri"));
      const isMaddiDogrulamaLevel1 = isMaddiDogrulamaChild && level === 1;

      return [
        { ...item, level, isForcedLeaf: isMaddiDogrulamaLevel1 },
        ...(collapsedIds.has(item.id) || isMaddiDogrulamaLevel1
          ? []
          : flattenData(
            item.children || [],
            level + 1,
            isMaddiDogrulamaChild || isMaddiDogrulamaRoot
          )),
      ];
    });
  };

  // Tüm formKodu'ları topla (recursive)
  const collectFormKodlari = useCallback((data: Veri[]): string[] => {
    const kodlar: string[] = [];
    const traverse = (items: Veri[]) => {
      for (const item of items) {
        if (item.code) {
          kodlar.push(item.code);
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      }
    };
    traverse(data);
    return kodlar;
  }, []);

  const fetchData = async () => {
    try {
      const data = await getDenetimDosya(user.denetimTuru || "");
      setRows(data);
      setLoading(false);

      // EkBelge durumlarını kontrol et
      if (data && user.token && user.denetciId && user.denetlenenId && user.yil) {
        setDurumLoading(true);
        const formKodlari = collectFormKodlari(data);
        const map: Record<string, EkBelgeDto[]> = {};

        // Paralel istekler (batch halinde)
        const batchSize = 10;
        for (let i = 0; i < formKodlari.length; i += batchSize) {
          const batch = formKodlari.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(async (formKodu) => {
              try {
                const belgeler = await getEkBelgeler(
                  user.denetciId!,
                  user.denetlenenId!,
                  user.yil!,
                  formKodu
                );
                return { formKodu, belgeler };
              } catch {
                return { formKodu, belgeler: [] };
              }
            })
          );
          for (const { formKodu, belgeler } of results) {
            map[formKodu] = belgeler;
          }
        }

        setEkBelgeDurumMap(map);
        setDurumLoading(false);
      }
    } catch (error) {
      console.log("An error occurred:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDurumClick = (formKodu: string, belgeAdi: string) => {
    const belgeler = ekBelgeDurumMap[formKodu] || [];
    setDialogBelgeler(belgeler);
    setDialogTitle(belgeAdi);
    setDialogOpen(true);
  };

  const handleDownload = async (belge: EkBelgeDto) => {
    try {
      setDownloadingId(belge.id);
      const { blob, fileName } = await downloadEkBelge(belge.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || belge.orijinalDosyaAdi;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("İndirme hatası:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredRows = flattenData(rows).filter((row) =>
    normalizeString(row.name).includes(normalizeString(searchTerm))
  );

  return (
    <>
      <Stack direction="row" alignItems="center" marginBottom={2}>
        <Box width={"100%"}>
          <Typography variant="h6">Denetim Dosya Listesi</Typography>
        </Box>
        <TextField
          placeholder="Arama"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </Stack>
      <TableContainer
        sx={{
          mt: 0.5,
          borderRadius: "8px",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        }}
      >
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: "45%",
                  backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                  borderBottom: `2px solid ${theme.palette.divider}`,
                  px: 0
                }}
              >
                <Typography variant="subtitle2" fontWeight="700" sx={{ pl: 2.5 }}>
                  Belge Adı
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                  borderBottom: `2px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight="700" textAlign="center">
                  Referans No
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                  borderBottom: `2px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight="700" textAlign="center">
                  BDS No
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                  borderBottom: `2px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight="700" textAlign="center">
                  Arşiv
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  width: "8%",
                  backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                  borderBottom: `2px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight="700" textAlign="center">
                  Durum
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                  borderBottom: `2px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight="700" textAlign="center">
                  Link
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ width: "100%" }}>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <CircularProgress size={40} thickness={4} />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Veriler yükleniyor...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row, index) => {
                const isParent = row.parentId == null;
                const hasChildren =
                  row.children && row.children.length > 0 && !row.isForcedLeaf;
                const hasFormKodu = !!row.code;
                const isLeaf = !hasChildren && hasFormKodu;
                const isCollapsible = (isParent || hasChildren) && !row.isForcedLeaf;
                const isCollapsed = collapsedIds.has(row.id);

                // Durum kontrolü
                const ekBelgeler = row.code
                  ? ekBelgeDurumMap[row.code] || []
                  : [];
                const hasEkBelge = ekBelgeler.length > 0;

                return (
                  <TableRow
                    key={index}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    style={{
                      backgroundColor: isParent
                        ? customizer.activeMode === "dark"
                          ? "#1c222d"
                          : "#f1f3f5"
                        : hasChildren
                          ? customizer.activeMode === "dark"
                            ? "#232a37"
                            : "#f8f9fa"
                          : "transparent",
                      cursor: isCollapsible ? "pointer" : "default",
                    }}
                    sx={{
                      "&:hover": {
                        backgroundColor: customizer.activeMode === "dark"
                          ? "rgba(255, 255, 255, 0.05) !important"
                          : "rgba(0, 0, 0, 0.04) !important",
                      }
                    }}
                    onClick={
                      isCollapsible
                        ? () => toggleCollapse(row.id)
                        : undefined
                    }
                  >
                    <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0 }}>
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        sx={{ pl: row.level * 2 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            minWidth: 28,
                            mt: 0.1,
                            mr: 0.5
                          }}
                        >
                          {isCollapsible && (
                            <IconButton
                              size="small"
                              sx={{
                                p: 0.2,
                                color: theme.palette.text.secondary,
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCollapse(row.id);
                              }}
                            >
                              {isCollapsed ? (
                                <ChevronRightIcon sx={{ fontSize: '1.3rem' }} />
                              ) : (
                                <ExpandMoreIcon sx={{ fontSize: '1.3rem' }} />
                              )}
                            </IconButton>
                          )}
                        </Box>
                        <Tooltip
                          title={row.name.length > 70 ? row.name : ""}
                          placement="top-start"
                          enterDelay={500}
                        >
                          <Typography
                            variant="body2"
                            color="textPrimary"
                            textAlign={"left"}
                            fontWeight={isParent || hasChildren ? "600" : "400"}
                            sx={{
                              fontSize: isParent ? "0.875rem" : "0.825rem",
                              lineHeight: 1.3,
                              flex: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: isParent ? 1 : 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordBreak: 'break-word',
                              mt: 0.15
                            }}
                          >
                            {row.name}
                          </Typography>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        textAlign={"center"}
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {row.reference &&
                          `${row.archiveFileName}${row.reference}`}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        textAlign={"center"}
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {row.bds}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        textAlign={"center"}
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {row.archiveFileName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                      {isLeaf && (
                        <>
                          {durumLoading ? (
                            <CircularProgress size={16} />
                          ) : hasEkBelge ? (
                            <Tooltip title="Yüklenmiş belgeleri görüntüle">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDurumClick(row.code!, row.name);
                                }}
                                sx={{ backgroundColor: "rgba(76, 175, 80, 0.1)", "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.2)" } }}
                              >
                                <CheckCircleIcon
                                  sx={{
                                    color: "#4caf50",
                                    fontSize: 20,
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Belge yüklenmemiş">
                              <IconButton
                                size="small"
                                disabled
                                sx={{
                                  backgroundColor: "rgba(244, 67, 54, 0.08)",
                                  "&.Mui-disabled": {
                                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                                  }
                                }}
                              >
                                <CancelIcon
                                  sx={{
                                    color: "#f44336",
                                    fontSize: 20,
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                      {row.url && (
                        <Link href={row.url || ""} onClick={(e) => e.stopPropagation()}>
                          <IconButton size="small" color="primary" sx={{ p: 0.1 }}>
                            <ArrowCircleRightIcon sx={{ fontSize: '1.3rem' }} />
                          </IconButton>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Yüklenen Belgeler Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5">Yüklenen Belgeler</Typography>
          <Typography variant="body2" color="textSecondary">
            {dialogTitle}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {dialogBelgeler.length === 0 ? (
            <Box p={3}>
              <Typography variant="body2" color="textSecondary">
                Yüklenmiş belge bulunamadı.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Dosya Adı</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} width={150}>Yükleme Tarihi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} width={80} align="center">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dialogBelgeler.map((belge) => (
                    <TableRow key={belge.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <InsertDriveFileIcon color="primary" fontSize="small" />
                          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                            {belge.orijinalDosyaAdi}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {belge.yuklemeTarihi
                            ? new Date(belge.yuklemeTarihi).toLocaleDateString("tr-TR")
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="İndir">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(belge)}
                            disabled={downloadingId === belge.id}
                          >
                            {downloadingId === belge.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DownloadIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BagimsizDenetimMetodolojisiTable;
