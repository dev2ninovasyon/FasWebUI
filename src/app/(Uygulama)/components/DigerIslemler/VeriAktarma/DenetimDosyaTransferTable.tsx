import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  denetimDosyaTransfer,
  getDenetimDosyaTransfer,
} from "@/api/DenetimDosya/DenetimDosya";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";

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

interface Props {
  kaynakId: number;
  hedefId: number;
  kaynakYil: number;
  hedefYil: number;
  kaynakDenetimTuru: string;
  setKaynakId: (deger: number) => void;
  setHedefId: (deger: number) => void;
  setKaynakYil: (deger: number) => void;
  setHedefYil: (deger: number) => void;
  verileriAktarTiklandimi: boolean;
  setVerileriAktarTiklandimi: (bool: boolean) => void;
}

const DenetimDosyaTransferTable: React.FC<Props> = ({
  kaynakId,
  hedefId,
  kaynakYil,
  hedefYil,
  kaynakDenetimTuru,
  setKaynakId,
  setHedefId,
  setKaynakYil,
  setHedefYil,
  verileriAktarTiklandimi,
  setVerileriAktarTiklandimi,
}) => {
  const [rows, setRows] = useState<Veri[]>([]);
  const [updatedRows, setUpdatedRows] = useState<Veri2[]>([]);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [selected, setSelected] = useState<string[]>([]);

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

  // recursive şekilde children'ları düz liste haline getirelim
  const flattenData = (
    data: Veri[],
    level = 0
  ): (Veri & { level: number })[] => {
    return data.flatMap((item) => [
      { ...item, level },
      ...flattenData(item.children || [], level + 1),
    ]);
  };

  const createSelectedRows = () => {
    return selected.map((row) => ({
      id: row,
      secildiMi: true,
    }));
  };

  const handleVeriAktar = async () => {
    setVerileriAktarTiklandimi(true);
    try {
      const selectedRows = createSelectedRows();

      const result = await denetimDosyaTransfer(
        user.token || "",
        user.denetciId || 0,
        kaynakId,
        hedefId,
        kaynakYil,
        hedefYil,
        selectedRows
      );
      if (!result.message) {
        setUpdatedRows(result);
        setVerileriAktarTiklandimi(false);
        enqueueSnackbar("İşlem Tamamlandı", {
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
      } else {
        setVerileriAktarTiklandimi(false);
        enqueueSnackbar(result && result.message, {
          variant: "warning",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.warning.dark
                : theme.palette.warning.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const data = await getDenetimDosyaTransfer(
        user.token || "",
        kaynakDenetimTuru
      );

      setRows(data);
      setLoading(false);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = flattenData(rows).filter((row) =>
    normalizeString(row.name).includes(normalizeString(searchTerm))
  );

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredRows.map((row) => row.id.toString());
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
          maxHeight: "500px",
          minHeight: "500px",
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
              <TableCell sx={{ width: "50%" }}>
                <Typography variant="body1" textAlign={"left"}>
                  Belge Adı
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" textAlign={"center"}>
                  Referans No
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" textAlign={"center"}>
                  Durum
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
                const isItemSelected = isSelected(row.id.toString());
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow
                    key={index}
                    hover
                    onClick={() =>
                      row.children &&
                      row.children.length === 0 &&
                      handleClickRow(row.id.toString())
                    }
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
                      {row.children && row.children.length === 0 && (
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        textAlign={"left"}
                      >
                        <span style={{ paddingLeft: row.level * 20 }}>
                          {row.name}
                        </span>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        textAlign={"center"}
                      >
                        {row.reference &&
                          `${row.archiveFileName}${row.reference}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        textAlign={"center"}
                      >
                        {row.children &&
                          row.children.length === 0 &&
                          updatedRows &&
                          updatedRows.length > 0 && (
                            <Chip
                              label={(() => {
                                const matched = updatedRows.find(
                                  (r) => r.id === row.id
                                );
                                return matched
                                  ? matched.secildiMi
                                    ? "Aktarıldı"
                                    : "Aktarılamadı"
                                  : row.durum || "";
                              })()}
                              sx={{
                                backgroundColor: (() => {
                                  const matched = updatedRows.find(
                                    (r) => r.id === row.id
                                  );
                                  const durum = matched
                                    ? matched.secildiMi
                                      ? "Aktarıldı"
                                      : "Aktarılamadı"
                                    : row.durum;

                                  return durum === "Aktarıldı"
                                    ? (theme) => theme.palette.success.light
                                    : durum === "Seçilmedi"
                                    ? (theme) => theme.palette.info.light
                                    : durum === "Aktarılamadı"
                                    ? (theme) => theme.palette.error.light
                                    : (theme) => theme.palette.error.light;
                                })(),
                                color: (() => {
                                  const matched = updatedRows.find(
                                    (r) => r.id === row.id
                                  );
                                  const durum = matched
                                    ? matched.secildiMi
                                      ? "Aktarıldı"
                                      : "Aktarılamadı"
                                    : row.durum;

                                  return durum === "Aktarıldı"
                                    ? (theme) => theme.palette.success.main
                                    : durum === "Seçilmedi"
                                    ? (theme) => theme.palette.info.main
                                    : durum === "Aktarılamadı"
                                    ? (theme) => theme.palette.error.main
                                    : (theme) => theme.palette.error.main;
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
      {selected.length !== 0 && (
        <>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleVeriAktar()}
            sx={{
              position: smDown ? "relative" : "absolute",
              width: smDown ? "100%" : "auto",
              marginLeft: smDown ? "" : "10px",
              marginY: smDown ? "8px" : "12px",
            }}
          >
            {selected.length} Veri Aktar
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
      {verileriAktarTiklandimi && (
        <InfoAlertCart
          openCartAlert={verileriAktarTiklandimi}
          setOpenCartAlert={setVerileriAktarTiklandimi}
        ></InfoAlertCart>
      )}
    </>
  );
};

export default DenetimDosyaTransferTable;
