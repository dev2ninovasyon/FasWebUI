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
import { getDenetimDosyaTransfer } from "@/api/DenetimDosya/DenetimDosya";
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

  // YENİ: ayrı seçim durumları
  const [selectedPdf, setSelectedPdf] = useState<number[]>([]);
  const [selectedWord, setSelectedWord] = useState<number[]>([]);

  const [openCartAlert, setOpenCartAlert] = useState(false);

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
    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );
    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
  }

  const flattenData = (
    data: Veri[],
    level = 0
  ): (Veri & { level: number })[] => {
    return data.flatMap((item) => [
      { ...item, level },
      ...flattenData(item.children || [], level + 1),
    ]);
  };

  // (İsterseniz halen transfer fonksiyonunu kullanabilirsiniz — dokunmadım)
  const createSelectedRowsForTransfer = () => {
    // Örn: PDF seçilenleri transfer et
    return selectedPdf.map((id) => ({
      id,
      secildiMi: true,
    }));
  };

  const fetchData = async () => {
    try {
      const data = await getDenetimDosyaTransfer(
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

  const handleChangePage = (_event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const flattened = flattenData(rows);
  const filteredRows = flattened.filter((row) =>
    normalizeString(row.name).includes(normalizeString(searchTerm))
  );

  // --- PDF seçimleri ---
  const isPdfSelected = (id: number) => selectedPdf.includes(id);
  const togglePdf = (id: number) => {
    setSelectedPdf((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleSelectAllPdf = (checked: boolean) => {
    if (!checked) {
      setSelectedPdf([]);
      return;
    }
    const leafIds = filteredRows
      .filter((r) => !r.children || r.children.length === 0)
      .map((r) => r.id);
    setSelectedPdf(leafIds);
  };

  // --- Word seçimleri ---
  const isWordSelected = (id: number) => selectedWord.includes(id);
  const toggleWord = (id: number) => {
    setSelectedWord((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleSelectAllWord = (checked: boolean) => {
    if (!checked) {
      setSelectedWord([]);
      return;
    }
    const leafIds = filteredRows
      .filter((r) => !r.children || r.children.length === 0)
      .map((r) => r.id);
    setSelectedWord(leafIds);
  };

  // Toplu butonlar
  const handleBulkPdf = async () => {
    // TODO: Burayı PDF toplu oluşturma endpoint’inize bağlayın
    // ör: await createPdfBulk(selectedPdf)
    enqueueSnackbar(`${selectedPdf.length} belge için PDF oluşturulacak.`, {
      variant: "info",
    });
  };

  const handleBulkWord = async () => {
    // TODO: Burayı Word toplu oluşturma endpoint’inize bağlayın
    // ör: await createWordBulk(selectedWord)
    enqueueSnackbar(`${selectedWord.length} belge için Word oluşturulacak.`, {
      variant: "info",
    });
  };

  const leafCount = filteredRows.filter(
    (r) => !r.children || r.children.length === 0
  ).length;

  return (
    <>
      <Stack direction="row" alignItems="center" marginBottom={2} gap={2}>
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
              {/* PDF seçim sütunu */}
              <TableCell padding={"checkbox"} sx={{ whiteSpace: "nowrap" }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Checkbox
                    indeterminate={
                      selectedPdf.length > 0 && selectedPdf.length < leafCount
                    }
                    checked={leafCount > 0 && selectedPdf.length === leafCount}
                    onChange={(e) => handleSelectAllPdf(e.target.checked)}
                  />
                  <Typography variant="body1" textAlign={"left"}>
                    Pdf Seç
                  </Typography>
                </Stack>
              </TableCell>
              {/* Word seçim sütunu */}
              <TableCell padding={"checkbox"} sx={{ whiteSpace: "nowrap" }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Checkbox
                    indeterminate={
                      selectedWord.length > 0 && selectedWord.length < leafCount
                    }
                    checked={leafCount > 0 && selectedWord.length === leafCount}
                    onChange={(e) => handleSelectAllWord(e.target.checked)}
                  />
                  <Typography variant="body1" textAlign={"left"}>
                    Word Seç
                  </Typography>
                </Stack>
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
                    sx={{ height: "100%", width: "100%", minHeight: "454px" }}
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
                          ? customizer.activeMode === "dark"
                            ? "#10141c"
                            : "#cccccc"
                          : customizer.activeMode === "dark"
                          ? theme.palette.background.default
                          : theme.palette.common.white,
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
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        textAlign={"left"}
                      >
                        <span style={{ paddingLeft: (row as any).level * 20 }}>
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
                        {isLeaf && updatedRows && updatedRows.length > 0 && (
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
                                  ? (theme: any) => theme.palette.success.light
                                  : durum === "Seçilmedi"
                                  ? (theme: any) => theme.palette.info.light
                                  : durum === "Aktarılamadı"
                                  ? (theme: any) => theme.palette.error.light
                                  : (theme: any) => theme.palette.error.light;
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
                                  ? (theme: any) => theme.palette.success.main
                                  : durum === "Seçilmedi"
                                  ? (theme: any) => theme.palette.info.main
                                  : durum === "Aktarılamadı"
                                  ? (theme: any) => theme.palette.error.main
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

      {/* ALTTaki BUTONLAR: iki ayrı toplu oluştur */}
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
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleBulkPdf}
          >
            {selectedPdf.length + selectedWord.length} Seçim Pdf Oluştur
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleBulkWord}
          >
            {selectedPdf.length + selectedWord.length} Seçim Word Oluştur
          </Button>
        </Stack>
      )}

      {/* (İsteğe bağlı) halen transfer pagination ve footer yapısı aynı */}
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
