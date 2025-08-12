import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { Stack } from "@mui/system";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import {
  getFisListesiHaric,
  saveHaricFisListesiHaric,
} from "@/api/Veri/HaricFisListesi";
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

const HaricFisListesiEnflasyonHaricTable: React.FC<Props> = ({
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

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [selected, setSelected] = useState<string[]>([]);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const createSelectedRows = () => {
    const selectedRows = rows.map((row) => ({
      id: row.id,
      haricMi: selected.includes(row.id),
    }));
    return selectedRows;
  };

  const handleSaveHaricFisListesi = async () => {
    try {
      const selectedRows = createSelectedRows();
      await saveHaricFisListesiHaric(
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
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const fisListesi = await getFisListesiHaric(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        hesapNo,
        yevmiyeFisNo,
        baslangicTarihi,
        bitisTarihi
      );
      const newRows = fisListesi.map((veri: Veri) => ({
        id: veri.id,
        yevmiyeNo: veri.yevmiyeNo,
        yevmiyeTarih: veri.yevmiyeTarih
          .split("T")[0]
          .split("-")
          .reverse()
          .join("."),
        kebirKodu: veri.kebirKodu,
        detayKodu: veri.detayKodu,
        kebirAdi: veri.kebirAdi,
        hesapAdi: veri.hesapAdi,
        aciklama: veri.aciklama,
        borc: veri.borc,
        alacak: veri.alacak,
        haricMi: veri.haricMi,
      }));

      const selectedIds = fisListesi
        .filter((veri: Veri) => veri.haricMi)
        .map((veri: Veri) => veri.id);

      setRows(newRows);
      setSelected(selectedIds);
      setLoading(false);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (fisleriGosterTiklandimi) {
      fetchData();
      setFisleriGosterTiklandimi(false);
    }
  }, [fisleriGosterTiklandimi]);

  useEffect(() => {
    if (standartfisleriGosterTiklandimi) {
      setSelected([]);
      fetchData();
      setStandartFisleriGosterTiklandimi(false);
    }
  }, [standartfisleriGosterTiklandimi]);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = rows.filter((row) =>
    row.aciklama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredRows.map((row) => row.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClickRow = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

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
                    selected.length > 0 && selected.length < filteredRows.length
                  }
                  checked={
                    filteredRows.length > 0 &&
                    selected.length === filteredRows.length
                  }
                  onChange={handleSelectAllClick}
                  inputProps={{ "aria-label": "select all desserts" }}
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
                    <Typography variant="body1">Yükleniyor...</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              (rowsPerPage > 0
                ? filteredRows.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : filteredRows
              ).map((row, index) => {
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
              rowsPerPageOptions={[20, 100, 500, { label: "Hepsi", value: -1 }]}
              count={filteredRows.length}
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
                `${from}-${to} arası / ${
                  count !== -1 ? count : `daha fazla`
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

export default HaricFisListesiEnflasyonHaricTable;
