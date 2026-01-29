import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TableHead,
  TableFooter,
  TablePagination,
  TextField,
  Box,
  useMediaQuery,
  Checkbox,
  Button,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import TablePaginationActions from "@/components/shared/TablePaginationActions";
import { getFisListesi, saveHaricFisListesi } from "@/api/Veri/HaricFisListesi";
import { enqueueSnackbar } from "notistack";

interface Props {
  hesapNo: string;
  yevmiyeFisNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  loading: boolean;
  fisleriGosterTiklandimi: boolean;
  standartfisleriGosterTiklandimi: boolean;
  setLoading: (bool: boolean) => void;
  setFisleriGosterTiklandimi: (bool: boolean) => void;
  setStandartFisleriGosterTiklandimi: (bool: boolean) => void;
  handleGetStandartYevmiyeFisNo: () => void;
}
interface Veri {
  id: string;
  yevmiyeNo: number;
  yevmiyeTarih: string;
  kebirKodu: number;
  detayKodu: string;
  kebirAdi: string;
  hesapAdi: string;
  aciklama: string;
  borc: number;
  alacak: number;
  haricMi: boolean;
}

const HaricFisListesiTable: React.FC<Props> = ({
  hesapNo,
  yevmiyeFisNo,
  baslangicTarihi,
  bitisTarihi,
  loading,
  fisleriGosterTiklandimi,
  standartfisleriGosterTiklandimi,
  setLoading,
  setFisleriGosterTiklandimi,
  setStandartFisleriGosterTiklandimi,
  handleGetStandartYevmiyeFisNo,
}) => {
  const [rows, setRows] = useState<Veri[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

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

    // Türkçe karakterleri değiştir
    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    // Tüm boşluk, tab, satır başı/sonu karakterlerini sil
    normalized = normalized.replace(/\s+/g, "");

    // Küçük harfe çevir
    return normalized.toLowerCase();
  }

  const createSelectedRows = () => {
    const selectedRows = rows.map((row) => ({
      id: row.id,
      haricMi: selected.includes(row.id),
    }));
    return selectedRows;
  };

  const handleSaveHaricFisListesi = useCallback(async () => {
    try {
      const selectedRows = createSelectedRows();
      await saveHaricFisListesi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        selectedRows
      );
      enqueueSnackbar("Seçili Fişler Hariç Bırakıldı.", {
        variant: "success",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.success.light
              : theme.palette.success.main,
          maxWidth: "720px",
        },
      });
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  }, [rows, selected, user.token, user.denetciId, user.denetlenenId, user.yil, customizer.activeMode, theme.palette.success]);

  const fetchData = useCallback(async (isStandartFisReset = false) => {
    try {
      setLoading(true);
      const data = await getFisListesi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        hesapNo,
        yevmiyeFisNo,
        baslangicTarihi,
        bitisTarihi,
        page,
        rowsPerPage,
        debouncedSearchTerm
      );

      const fisListesi = data.items || [];
      const total = data.totalCount || 0;

      const newRows = fisListesi.map((veri: any) => ({
        id: veri.id,
        yevmiyeNo: veri.yevmiyeNo,
        yevmiyeTarih: veri.yevmiyeTarih
          ? veri.yevmiyeTarih.split("T")[0].split("-").reverse().join(".")
          : "",
        kebirKodu: veri.kebirKodu,
        detayKodu: veri.detayKodu,
        kebirAdi: veri.kebirAdi,
        hesapAdi: veri.hesapAdi,
        aciklama: veri.aciklama,
        borc: veri.borc,
        alacak: veri.alacak,
        haricMi: veri.haricMi,
      }));

      setRows(newRows);
      setTotalCount(total);

      // If it's a fresh load or standart fis reset, we might want to sync 'selected'
      // But usually 'selected' is what the user manually clicks OR what's already saved.
      // The backend returns 'haricMi' status.
      if (isStandartFisReset) {
        const selectedIds = fisListesi
          .filter((veri: any) => veri.haricMi)
          .map((veri: any) => veri.id);
        setSelected(selectedIds);
      }

      setLoading(false);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
      setLoading(false);
    }
  }, [user.token, user.denetciId, user.denetlenenId, user.yil, hesapNo, yevmiyeFisNo, baslangicTarihi, bitisTarihi, page, rowsPerPage, debouncedSearchTerm, setLoading]);

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    if (fisleriGosterTiklandimi) {
      setPage(0);
      fetchData();
      setFisleriGosterTiklandimi(false);
    }
  }, [fisleriGosterTiklandimi, fetchData]);

  useEffect(() => {
    if (standartfisleriGosterTiklandimi) {
      setSelected([]);
      setPage(0);
      fetchData(true);
      setStandartFisleriGosterTiklandimi(false);
    }
  }, [standartfisleriGosterTiklandimi, fetchData]);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = useCallback((event: any, newPage: any) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleSelectAllClick = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Select ALL records from the entire dataset
      const newSelecteds = rows.map((row) => row.id);
      setSelected(newSelecteds);
      return;
    }
    // Deselect all
    setSelected([]);
  }, [rows]);

  const handleClickRow = useCallback((id: string) => {
    setSelected((prevSelected) => {
      const selectedIndex = prevSelected.indexOf(id);
      let newSelected: string[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(prevSelected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(prevSelected.slice(1));
      } else if (selectedIndex === prevSelected.length - 1) {
        newSelected = newSelected.concat(prevSelected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          prevSelected.slice(0, selectedIndex),
          prevSelected.slice(selectedIndex + 1)
        );
      }

      return newSelected;
    });
  }, []);

  return (
    <>
      <Stack direction="row" alignItems="center" marginBottom={2}>
        <Box width={"100%"}>
          <Typography variant="h6">Fiş Listesi</Typography>
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
          maxHeight: "520px",
          minHeight: "520px",
        }}
      >
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < totalCount
                  }
                  checked={
                    rows.length > 0 &&
                    rows.every(r => selected.includes(r.id))
                  }
                  onChange={handleSelectAllClick}
                  inputProps={{ "aria-label": "select all" }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body1">Yevmiye / Fiş No</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="body1">
                  Yevmiye Tarih
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="body1">
                  Kebir Kodu
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="body1">
                  Hesap Kodu
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="body1">
                  Kebir Adı
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="body1">
                  Hesap Adı
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="body1">
                  Açıklama
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="body1">
                  Borç
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="body1">
                  Alacak
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ width: "100%" }}>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  align="center"
                  sx={{ height: "100%", p: 0 }}
                >
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      height: "100%",
                      width: "100%",
                      minHeight: "454px",
                    }}
                  >
                    <Stack direction="column" spacing={2} alignItems="center">
                      <CircularProgress size={40} />
                      <Typography variant="body1" color="textSecondary">
                        Veriler hazırlanıyor...
                      </Typography>
                    </Stack>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    key={index}
                    hover
                    onClick={() => handleClickRow(row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    tabIndex={-1}
                    style={{
                      backgroundColor:
                        index % 2 === 0
                          ? customizer.activeMode === "dark"
                            ? "#10141c"
                            : "#cccccc"
                          : customizer.activeMode === "dark"
                            ? theme.palette.background.default
                            : theme.palette.common.white,
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    <TableCell scope="row">
                      <Typography variant="body1" color="textSecondary">
                        {row.yevmiyeNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        textAlign={"right"}
                        variant="body1"
                        color="textSecondary"
                      >
                        {row.yevmiyeTarih}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        textAlign={"center"}
                        variant="body1"
                        color="textSecondary"
                      >
                        {row.kebirKodu}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        textAlign={"center"}
                        variant="body1"
                        color="textSecondary"
                      >
                        {row.detayKodu}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        textAlign={"center"}
                        variant="body1"
                        color="textSecondary"
                      >
                        {row.kebirAdi}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        textAlign={"center"}
                        variant="body1"
                        color="textSecondary"
                      >
                        {row.hesapAdi}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        textAlign={"center"}
                        variant="body1"
                        color="textSecondary"
                      >
                        {row.aciklama}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        textAlign={"right"}
                        variant="body1"
                        color="textSecondary"
                      >
                        {row.borc}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        textAlign={"right"}
                        variant="body1"
                        color="textSecondary"
                      >
                        {row.alacak}
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
      {selected.length !== 0 && (
        <>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleSaveHaricFisListesi()}
            sx={{
              position: smDown ? "relative" : "absolute",
              width: smDown ? "100%" : "auto",
              marginLeft: smDown ? "" : "10px",
              marginY: smDown ? "8px" : "12px",
            }}
          >
            {selected.length} Fişi Hariç Bırak
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleGetStandartYevmiyeFisNo()}
            sx={{
              position: smDown ? "relative" : "absolute",
              width: smDown ? "100%" : "auto",
              marginLeft: smDown ? "" : "172px",
              marginY: smDown ? "8px" : "12px",
            }}
          >
            Standart Fişleri Göster
          </Button>
        </>
      )}
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
              rowsPerPageOptions={[20, 100, 500]}
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
              labelRowsPerPage="Sayfa başına satır sayısı:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} arası / ${count !== -1 ? count : `daha fazla`
                } satır`
              }
              sx={{ mt: 0.5, border: 0 }}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
};

export default React.memo(HaricFisListesiTable);
