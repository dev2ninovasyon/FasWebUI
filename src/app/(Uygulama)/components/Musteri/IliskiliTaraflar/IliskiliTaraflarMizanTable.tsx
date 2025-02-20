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
import { getMizanVerileriByHesapNo } from "@/api/Veri/Mizan";
import { useRouter } from "next/navigation";
import { createIliskiliTaraflarListe } from "@/api/Musteri/MusteriIslemleri";

interface Veri {
  id: string;
  detayKodu: number;
  detayHesapAdi: string;
}

interface Props {
  hesapNo: string;
  verileriGetirTiklandimi: boolean;
  setVerileriGetirTiklandimi: (bool: boolean) => void;
}
const IliskiliTaraflarMizanTable: React.FC<Props> = ({
  hesapNo,
  verileriGetirTiklandimi,
  setVerileriGetirTiklandimi,
}) => {
  const [rows, setRows] = useState<Veri[]>([]);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [selected, setSelected] = useState<string[]>([]);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const createSelectedRows = () => {
    const selectedRows = rows
      .filter((x) => selected.includes(x.id))
      .map((y) => y.detayHesapAdi);
    return selectedRows;
  };

  const handleCreateIliskiliTaraflarListesi = async () => {
    try {
      const selectedRows = createSelectedRows();
      await createIliskiliTaraflarListe(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        selectedRows
      );
      router.push("/Musteri/IliskiliTaraflar");
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const mizanVerileri = await getMizanVerileriByHesapNo(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        "E-Defter",
        hesapNo
      );
      const mizanVerileri2 = await getMizanVerileriByHesapNo(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        "VukMizan",
        hesapNo
      );

      const rowsAll: any = [];
      if (mizanVerileri.length > 0)
        mizanVerileri.forEach((veri: any) => {
          const newRow: Veri = {
            id: veri.id,
            detayKodu: veri.detayKodu,
            detayHesapAdi: veri.detayHesapAdi,
          };
          if (veri.detayKodu.length > 3) {
            rowsAll.push(newRow);
          }
        });
      else if (mizanVerileri2.length > 0) {
        mizanVerileri2.forEach((veri: any) => {
          const newRow: Veri = {
            id: veri.id,
            detayKodu: veri.detayKodu,
            detayHesapAdi: veri.detayHesapAdi,
          };
          if (veri.detayKodu.length > 3) {
            rowsAll.push(newRow);
          }
        });
      }
      rowsAll.sort((a: Veri, b: Veri) => (a.detayKodu > b.detayKodu ? 1 : -1));

      setRows(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    const fetchDataAsync = async () => {
      if (verileriGetirTiklandimi) {
        await fetchData();
        setVerileriGetirTiklandimi(false);
      }
    };

    fetchDataAsync();
  }, [verileriGetirTiklandimi]);

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
    row.detayHesapAdi.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Typography variant="h6">Mizan</Typography>
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
                <Typography variant="body1">Detay Kodu</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="body1">
                  Detay Hesap Adı
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ width: "100%" }}>
            {(rowsPerPage > 0
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
                      {row.detayKodu}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      textAlign={"center"}
                      color="textSecondary"
                    >
                      {row.detayHesapAdi}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
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
            onClick={() => handleCreateIliskiliTaraflarListesi()}
            sx={{
              position: smDown ? "relative" : "absolute",
              width: smDown ? "100%" : "auto",
              marginLeft: smDown ? "" : "10px",
              marginY: smDown ? "8px" : "12px",
            }}
          >
            {selected.length} İliskili Taraf Tanımla
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

export default IliskiliTaraflarMizanTable;
