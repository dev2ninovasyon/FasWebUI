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
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getDenetimDosya } from "@/api/DenetimDosya/DenetimDosya";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

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

  const fetchData = async () => {
    try {
      const data = await getDenetimDosya(
        user.token || "",
        user.denetimTuru || ""
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
          maxHeight: "520px",
          minHeight: "520px",
        }}
      >
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
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
                  BDS No
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" textAlign={"center"}>
                  Arşiv
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" textAlign={"center"}>
                  Link
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
                return (
                  <TableRow
                    key={index}
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
                        {row.bds}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        textAlign={"center"}
                      >
                        {row.archiveFileName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {row.url && (
                        <Link href={row.url || ""}>
                          <ArrowCircleRightIcon sx={{ color: "#1976d2" }} />
                        </Link>
                      )}
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

export default BagimsizDenetimMetodolojisiTable;
