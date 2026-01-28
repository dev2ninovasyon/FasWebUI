import React, { useEffect, useState, useMemo } from "react";
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TablePagination,
  Typography,
  useTheme,
  TableFooter,
  Stack,
  Box,
  TextField,
  Checkbox,
  Button,
  useMediaQuery,
  Chip,
  CircularProgress, // â¬…ï¸ eklendi
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getDenetimDosyaTransfer,
  createBirlesikPdfByFormat,
  getLastBirlesikPdf,
  createAndFetchBirlesikPdf, // binary -> blobUrl + fileName döner (güncel API)
} from "@/api/DenetimDosya/DenetimDosya";
import TablePaginationActions from "@/components/shared/TablePaginationActions";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

interface Veri {
  id: number;
  parentId?: number;
  name: string;
  bds?: string;
  code?: string;
  url?: string;
  reference?: string;
  archiveFileName?: string;
  durum?: string;
  children: Veri[];
}

interface Veri2 {
  id: number;
  secildiMi: boolean;
}

interface SelectionItem {
  id: number;
  pdf: boolean;
  word: boolean;
}

interface Props {}

const DenetimDosyaYazdirTable: React.FC<Props> = ({}) => {
  const [rows, setRows] = useState<Veri[]>([]);
  const [updatedRows, setUpdatedRows] = useState<Veri2[]>([]);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // PDF & Word seçimleri
  const [selectedPdf, setSelectedPdf] = useState<number[]>([]);
  const [selectedWord, setSelectedWord] = useState<number[]>([]);

  const [openCartAlert, setOpenCartAlert] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  // En altta gösterilecek birleştirilmiş PDF
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedPdfName, setMergedPdfName] = useState<string>("Birlesik.pdf");

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  function normalizeString(str: string): string {
    const tr: Record<string, string> = {
      ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
      Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
    };
    let n = str.replace(/[çğıöşüÇĞÖŞÜıİ]/g, (m) => tr[m] || m);
    n = n.replace(/\s+/g, "");
    return n.toLowerCase();
  }

  const flattenData = (data: Veri[], level = 0): (Veri & { level: number })[] =>
    data.flatMap((item) => [{ ...item, level }, ...flattenData(item.children || [], level + 1)]);

  // Liste + varsa önceki birleşik PDF'i getir
  const fetchData = async () => {
    try {
      const data = await getDenetimDosyaTransfer(user.token || "", user.denetimTuru || "");
      setRows(data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Liste yüklenemedi.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingMergedPdf = async () => {
    try {
      const res = await getLastBirlesikPdf(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      if (res) {
        setMergedPdfUrl(res.blobUrl);
        setMergedPdfName(res.fileName || "Birlesik.pdf");
      } else {
        enqueueSnackbar("Daha önce oluşturulmuş bir PDF bulunamadı.", { variant: "info" });
      }
    } catch (err) {
      console.log("getLastBirlesikPdf hata:", err);
      enqueueSnackbar("Birleştirilmiş PDF alınamadı.", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchData();
    fetchExistingMergedPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // blob URL temizliği
  useEffect(() => {
    return () => {
      if (mergedPdfUrl?.startsWith("blob:")) URL.revokeObjectURL(mergedPdfUrl);
    };
  }, [mergedPdfUrl]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: any) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const flattened = flattenData(rows);
  const filteredRows = flattened.filter((row) =>
    normalizeString(row.name).includes(normalizeString(searchTerm))
  );

  // --- PDF seçimleri ---
  const isPdfSelected = (id: number) => selectedPdf.includes(id);
  const togglePdf = (id: number) => {
    setSelectedPdf((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleSelectAllPdf = (checked: boolean) => {
    if (!checked) return setSelectedPdf([]);
    const leafIds = filteredRows.filter((r) => !r.children || r.children.length === 0).map((r) => r.id);
    setSelectedPdf(leafIds);
  };

  // --- Word seçimleri ---
  const isWordSelected = (id: number) => selectedWord.includes(id);
  const toggleWord = (id: number) => {
    setSelectedWord((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleSelectAllWord = (checked: boolean) => {
    if (!checked) return setSelectedWord([]);
    const leafIds = filteredRows.filter((r) => !r.children || r.children.length === 0).map((r) => r.id);
    setSelectedWord(leafIds);
  };

  // Tekil satır sayısı (buton üstü)
  const selectedRowIds = useMemo(
    () => Array.from(new Set([...selectedPdf, ...selectedWord])),
    [selectedPdf, selectedWord]
  );

  // Endpoint'e gidecek payload: [{ id, pdf, word }]
  const selections: SelectionItem[] = useMemo(() => {
    const map = new Map<number, SelectionItem>();
    selectedPdf.forEach((id) => map.set(id, { id, pdf: true, word: map.get(id)?.word ?? false }));
    selectedWord.forEach((id) => {
      const cur = map.get(id);
      if (cur) cur.word = true; else map.set(id, { id, pdf: false, word: true });
    });
    return Array.from(map.values());
  }, [selectedPdf, selectedWord]);

  // Dosya indirme helper
  const downloadUrl = (urlStr: string, fileName = "Birlesik.pdf") => {
    try {
      const a = document.createElement("a");
      a.href = urlStr;
      a.download = fileName; // cross-origin ise tarayıcı yok sayabilir
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      window.open(urlStr, "_blank");
    }
  };

  // Birleştirilmiş PDF oluştur
  const handleMergedPdf = async () => {
    if (selections.length === 0) {
      enqueueSnackbar("Lütfen en az bir belge seçin.", { variant: "warning" });
      return;
    }
    setIsMerging(true);
    try {
      const { last } = await createAndFetchBirlesikPdf(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        selections,
        user.denetimTuru || "",
        { maxRetries: 6, retryDelayMs: 1200 }
      );
      console.log(last);
      if (!last) {
        enqueueSnackbar("PDF oluşturulamadı veya henüz hazır değil.", { variant: "warning" });
      } else {
        setMergedPdfUrl(last.blobUrl);
        setMergedPdfName(last.fileName);
        enqueueSnackbar("Birleştirilmiş PDF hazır.", { variant: "success" });
      }
    } catch {
      enqueueSnackbar("Beklenmeyen bir hata oluştu.", { variant: "error" });
    } finally {
      setIsMerging(false);
    }
  };

  const leafCount = filteredRows.filter((r) => !r.children || r.children.length === 0).length;

  return (
    <>
       {/* Birleştirilen PDF alanı (tablonun en altında) */}
      {mergedPdfUrl && (
        <Stack
          direction={smDown ? "column" : "row"}
          spacing={1.5}
          alignItems="center"
          sx={{ mt: 2 }}
          margin={2}
          bgcolor={"#e0e0e0"}
          padding={3}
          borderRadius={2}
          
        >
          <Typography variant="subtitle2">Birleştirilen PDF:</Typography>

          {/* Görüntüle */}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            component="a"
            href={mergedPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Görüntüle
          </Button>

          {/* İndir */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => downloadUrl(mergedPdfUrl!, mergedPdfName)}
          >
            İndir
          </Button>

          <Typography variant="body2" sx={{ wordBreak: "break-all", opacity: 0.8 }}>
            {mergedPdfName}
          </Typography>
        </Stack>
      )}
      <Stack  direction="row" alignItems="center" marginBottom={2} gap={2}>
        <Box width={"100%"}>
          <Typography variant="h6">Denetim Dosya Listesi V2</Typography>
        </Box>
        <TextField
          placeholder="Arama"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </Stack>

      <TableContainer sx={{ mt: 0.5, maxHeight: "500px", minHeight: "500px", position: "relative" }}>
        {/* â¬‡ï¸ Oluşturma sırasında tablo ortasında ring */}
        {isMerging && (
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              backgroundColor: "rgba(255,255,255,0.7)", // tema koyuysa isterseniz rgba(0,0,0,0.3)
            }}
          >
            <CircularProgress />
          </Stack>
        )}

        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {/* PDF seçim sütunu */}
              <TableCell padding="checkbox" sx={{ whiteSpace: "nowrap" }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Checkbox
                    indeterminate={selectedPdf.length > 0 && selectedPdf.length < leafCount}
                    checked={leafCount > 0 && selectedPdf.length === leafCount}
                    onChange={(e) => handleSelectAllPdf(e.target.checked)}
                  />
                  <Typography variant="body1" textAlign="left">Pdf Seç</Typography>
                </Stack>
              </TableCell>

              {/* Word seçim sütunu */}
              <TableCell padding="checkbox" sx={{ whiteSpace: "nowrap" }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Checkbox
                    indeterminate={selectedWord.length > 0 && selectedWord.length < leafCount}
                    checked={leafCount > 0 && selectedWord.length === leafCount}
                    onChange={(e) => handleSelectAllWord(e.target.checked)}
                  />
                  <Typography variant="body1" textAlign="left">Word Seç</Typography>
                </Stack>
              </TableCell>

              <TableCell sx={{ width: "50%" }}>
                <Typography variant="body1" textAlign="left">Belge Adı</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" textAlign="center">Referans No</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" textAlign="center">Durum</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody sx={{ width: "100%" }}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ height: "100%", p: 0 }}>
                  <Stack direction="row" justifyContent="center" alignItems="center" sx={{ height: "100%", width: "100%", minHeight: "454px" }}>
                    <Typography variant="body1">Yükleniyor...</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              (rowsPerPage > 0
                ? filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : filteredRows
              ).map((row, index) => {
                const isLeaf = !row.children || row.children.length === 0;
                const labelId = `row-${index}`;
                return (
                  <TableRow
                    key={row.id}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    style={{
                      backgroundColor:
                        row.parentId == null
                          ? (customizer.activeMode === "dark" ? "#10141c" : "#cccccc")
                          : (customizer.activeMode === "dark" ? theme.palette.background.default : theme.palette.common.white),
                    }}
                  >
                    {/* PDF checkbox */}
                    <TableCell padding="checkbox">
                      {isLeaf && (
                        <Checkbox
                          checked={isPdfSelected(row.id)}
                          inputProps={{ "aria-labelledby": labelId }}
                          onChange={() => togglePdf(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </TableCell>

                    {/* Word checkbox */}
                    <TableCell padding="checkbox">
                      {isLeaf && (
                        <Checkbox
                          checked={isWordSelected(row.id)}
                          inputProps={{ "aria-labelledby": labelId }}
                          onChange={() => toggleWord(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body1" color="textSecondary" textAlign="left">
                        <span style={{ paddingLeft: (row as any).level * 20 }}>{row.name}</span>
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body1" color="textSecondary" textAlign="center">
                        {row.reference && `${row.archiveFileName}${row.reference}`}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body1" color="textSecondary" textAlign="center">
                        {isLeaf && updatedRows && updatedRows.length > 0 && (
                          <Chip
                            label={(() => {
                              const matched = updatedRows.find((r) => r.id === row.id);
                              return matched ? (matched.secildiMi ? "Aktarıldı" : "Aktarılamadı") : row.durum || "";
                            })()}
                            sx={{
                              backgroundColor: (() => {
                                const matched = updatedRows.find((r) => r.id === row.id);
                                const durum = matched ? (matched.secildiMi ? "Aktarıldı" : "Aktarılamadı") : row.durum;
                                return durum === "Aktarıldı"
                                  ? (theme: any) => theme.palette.success.light
                                  : durum === "Seçilmedi"
                                  ? (theme: any) => theme.palette.info.light
                                  : (theme: any) => theme.palette.error.light;
                              })(),
                              color: (() => {
                                const matched = updatedRows.find((r) => r.id === row.id);
                                const durum = matched ? (matched.secildiMi ? "Aktarıldı" : "Aktarılamadı") : row.durum;
                                return durum === "Aktarıldı"
                                  ? (theme: any) => theme.palette.success.main
                                  : durum === "Seçilmedi"
                                  ? (theme: any) => theme.palette.info.main
                                  : (theme: any) => theme.palette.error.main;
                              })(),
                            }}
                          />
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ALT BUTON: tek buton (tekil satır sayısı) */}
      {(selectedPdf.length > 0 || selectedWord.length > 0) && (
        <Stack
          direction={smDown ? "column" : "row"}
          gap={1}
          sx={{
            position: smDown ? "relative" : "absolute",
            marginLeft: smDown ? 0 : "10px",
            marginY: smDown ? "8px" : "12px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleMergedPdf}
            disabled={isMerging}
          >
            {isMerging
              ? "Oluşturuluyor..."
              : `Birleştirilmiş Pdf Oluştur (${selectedRowIds.length})`}
          </Button>
        </Stack>
      )}

      {/* Footer / pagination */}
      <Table>
        <TableFooter
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            border: 0,
          }}
        >
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[20, 100, 500, { label: "Hepsi", value: -1 }]}
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{ native: true }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
              labelRowsPerPage="Sayfa başına satır sayısı:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} arası / ${count !== -1 ? count : `daha fazla`} satır`
              }
              sx={{ mt: 0.5, border: 0 }}
            />
          </TableRow>
        </TableFooter>
      </Table>

   

      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        />
      )}
    </>
  );
};

export default DenetimDosyaYazdirTable;
