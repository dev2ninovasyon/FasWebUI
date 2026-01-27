import React from "react";
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
  CircularProgress,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getDenetimDosyaTransfer, sendBulkOnay } from "@/api/DenetimDosya/DenetimDosya";
import TablePaginationActions from "@/components/shared/TablePaginationActions";
import { enqueueSnackbar } from "notistack";

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

interface RowResult {
  id: number;
  secildiMi: boolean; // true: Aktarıldı, false: Aktarılamadı
}

interface Props {
  hazirlayanId?: number;
  onaylayanId?: number;
  kaliteKontrolId?: number;
  refreshKey?: number; // (opsiyonel) dışarıdan tabloyu yeniletmek için
}

const DenetimDosyaOnayTable: React.FC<Props> = ({
  hazirlayanId,
  onaylayanId,
  kaliteKontrolId,
  refreshKey,
}) => {
  const [rows, setRows] = React.useState<Veri[]>([]);
  const [updatedRows, setUpdatedRows] = React.useState<RowResult[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const smDown = useMediaQuery((t: any) => t.breakpoints.down("sm"));

  const [searchTerm, setSearchTerm] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);

  // --- helpers ---
  const normalizeString = (str: string): string => {
    const map: Record<string, string> = {
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
    let n = str.replace(/[çğıöşüÇĞÖŞÜıİ]/g, (m) => map[m] || m);
    n = n.replace(/\s+/g, "");
    return n.toLowerCase();
  };

  const flattenData = React.useCallback(
    (data: Veri[], level = 0): (Veri & { level: number })[] =>
      data.flatMap((item) => [{ ...item, level }, ...flattenData(item.children || [], level + 1)]),
    [] // pure
  );

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDenetimDosyaTransfer(user.token || "", user.denetimTuru || "");
      setRows(data || []);
      setUpdatedRows([]); // yeni liste çekilince sonuçları sıfırla
      setSelectedIds([]); // seçimleri de sıfırla
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Liste yüklenemedi.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user.token, user.denetimTuru]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // dışarıdan refresh tetikleme
  React.useEffect(() => {
    if (typeof refreshKey === "number") {
      fetchData();
    }
  }, [refreshKey, fetchData]);

  const flattened = React.useMemo(() => flattenData(rows), [rows, flattenData]);
  const filteredRows = React.useMemo(
    () => flattened.filter((row) => normalizeString(row.name).includes(normalizeString(searchTerm))),
    [flattened, searchTerm]
  );
  const leafRows = React.useMemo(
    () => filteredRows.filter((r) => !r.children || r.children.length === 0),
    [filteredRows]
  );
  const leafCount = leafRows.length;

  // --- seçim ---
  const isSelected = (id: number) => selectedIds.includes(id);
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleSelectAll = (checked: boolean) => {
    if (!checked) return setSelectedIds([]);
    setSelectedIds(leafRows.map((r) => r.id));
  };

  // --- pagination ---
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;
  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: any) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // --- toplu onay tek istek ---
  const handleTopluOnay = async () => {
    if (selectedIds.length === 0) {
      enqueueSnackbar("Lütfen en az bir belge seçin.", { variant: "warning" });
      return;
    }
    if (!hazirlayanId && !onaylayanId && !kaliteKontrolId) {
      enqueueSnackbar("Hazırlayan / Onaylayan / Kalite Kontrol alanlarından en az biri seçilmeli.", {
        variant: "warning",
      });
      return;
    }

    setIsSending(true);
    try {
      const selectedLeafRows = leafRows.filter((r) => selectedIds.includes(r.id));
      const payload = {
        denetciId: user.denetciId || 0,
        denetlenenId: user.denetlenenId || 0,
        yil: user.yil || 0,
        denetimTuru: user.denetimTuru || "",
        hazirlayanId: hazirlayanId ?? null,
        onaylayanId: onaylayanId ?? null,
        kaliteKontrolId: kaliteKontrolId ?? null,
        items: selectedLeafRows.map((r) => ({
          belgeId: r.id,
          belgeAdi: r.name,
          formKodu:r.code?? ""
        })),
      };

      console.log(payload)
      const result = await sendBulkOnay(user.token || "", payload);
      // beklenen response: { results: [{ belgeId, success, message? }]}
      const next: RowResult[] = selectedLeafRows.map((r) => {
        const found = result?.results?.find((x: any) => x.belgeId === r.id);
        return { id: r.id, secildiMi: !!found?.success };
      });
      setUpdatedRows(next);

      const successCount = next.filter((x) => x.secildiMi).length;
      enqueueSnackbar(`İşlem tamamlandı. Başarılı: ${successCount} / ${selectedIds.length}`, {
        variant: successCount === selectedIds.length ? "success" : successCount > 0 ? "info" : "error",
      });
    } catch (e) {
      console.log(e);
      enqueueSnackbar("Toplu işlem sırasında beklenmeyen bir hata oluştu.", { variant: "error" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" mb={2} gap={2}>
        <Box flex={1}>
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

      <TableContainer sx={{ mt: 0.5, maxHeight: 500, minHeight: 500, position: "relative" }}>
        {isSending && (
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              backgroundColor: "rgba(0,0,0,0.15)",
              backdropFilter: "blur(1px)",
            }}
          >
            <CircularProgress />
          </Stack>
        )}

        <Table stickyHeader aria-label="denetim-dosya-table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ whiteSpace: "nowrap" }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < leafCount}
                    checked={leafCount > 0 && selectedIds.length === leafCount}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <Typography variant="body1">Seç</Typography>
                </Stack>
              </TableCell>
              <TableCell sx={{ width: "60%" }}>
                <Typography variant="body1">Belge Adı</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" textAlign="center">
                  Referans No
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" textAlign="center">
                  Durum
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ height: "100%", p: 0 }}>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ height: "100%", width: "100%", minHeight: 454 }}
                  >
                    <Typography>Yükleniyor...</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              (rowsPerPage > 0
                ? filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : filteredRows
              ).map((row, index) => {
                const isLeaf = !row.children || row.children.length === 0;
                const paddingLeft = (row as any).level * 20;
                const match = updatedRows.find((r) => r.id === row.id);

                return (
                  <TableRow
                    key={row.id}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    style={{
                      backgroundColor:
                        row.parentId == null
                          ? customizer.activeMode === "dark"
                            ? "#10141c"
                            : "#cccccc"
                          : customizer.activeMode === "dark"
                          ? theme.palette.background.default
                          : theme.palette.common.white,
                    }}
                  >
                    <TableCell padding="checkbox">
                      {isLeaf && (
                        <Checkbox
                          checked={isSelected(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body1" color="textSecondary">
                        <span style={{ paddingLeft }}>{row.name}</span>
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body1" color="textSecondary" textAlign="center">
                        {row.reference && `${row.archiveFileName ?? ""}${row.reference}`}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body1" color="textSecondary" textAlign="center">
                        {isLeaf && match && (
                          <Chip
                            label={match.secildiMi ? "Aktarıldı" : "Aktarılamadı"}
                            sx={{
                              backgroundColor: match.secildiMi
                                ? (t: any) => t.palette.success.light
                                : (t: any) => t.palette.error.light,
                              color: match.secildiMi
                                ? (t: any) => t.palette.success.main
                                : (t: any) => t.palette.error.main,
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
                <TableCell colSpan={4} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Alt aksiyon butonu */}
      {selectedIds.length > 0 && (
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
            onClick={handleTopluOnay}
            disabled={isSending}
          >
            {isSending ? "Gönderiliyor..." : `Toplu Onay Gönder (${selectedIds.length})`}
          </Button>
        </Stack>
      )}

      {/* Footer / pagination */}
      <Table>
        <TableFooter sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", border: 0 }}>
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
    </>
  );
};

export default DenetimDosyaOnayTable;
