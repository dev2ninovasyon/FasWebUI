import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TableHead,
  IconButton,
  TableFooter,
  TablePagination,
  TextField,
  Box,
  Dialog,
  DialogContent,
  Chip,
  useMediaQuery,
  Checkbox,
  Button,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import {
  deleteDosyaBilgisiMultiple,
  getDefterYuklemeLoglari,
  getDosyaBilgileri,
} from "@/api/Dosya/DosyaBilgileri";
import { ConfirmPopUpComponent } from "@/app/(Uygulama)/components/CalismaKagitlari/ConfirmPopUp";
import WarnAlertCart from "@/app/(Uygulama)/components/Alerts/WarnAlertCart";
import { IconDotsVertical, IconEye, IconX } from "@tabler/icons-react";
import axios from "axios";

interface MyComponentProps {
  fileType: string;
  dosyaYuklendiMi: boolean;
  setDosyaYuklendiMi: (deger: boolean) => void;
}

interface DosyaType {
  id: number;
  adi: string;
  olusturulmaTarihi: string;
  durum: string;
}

const DosyaTable: React.FC<MyComponentProps> = ({
  fileType,
  dosyaYuklendiMi,
  setDosyaYuklendiMi,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [xmlBlobUrl, setXmlBlobUrl] = useState("");

  const [rows, setRows] = useState<DosyaType[]>([]);
  const [defterLoglari, setDefterLoglari] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const user = useSelector((state: AppState) => state.userReducer);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);

  const [selected, setSelected] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState(0);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const mdUp = useMediaQuery((theme: any) => theme.breakpoints.up("md"));

  const [control, setControl] = useState(false);
  const [control2, setControl2] = useState(true);

  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [message, setMessage] = useState<string>("");

  const extractParts = (
    adi: string
  ): { datePart: string; serialPart: string } => {
    const matches = adi.match(/-\d{6}-K-\d{6}\.xml/);

    if (matches) {
      const parts = matches[0].split("-");
      return { datePart: parts[1], serialPart: parts[3].split(".")[0] };
    }
    return { datePart: "", serialPart: "" };
  };

  const handleAlertPopUp = () => {
    let seri: number;
    let tarih: number;
    let aylar: number[] = [];
    rows.sort((a: DosyaType, b: DosyaType) => a.adi.localeCompare(b.adi));

    rows.forEach((row: DosyaType, index: number) => {
      const { datePart, serialPart } = extractParts(row.adi);

      const monthPart = parseInt(datePart.slice(-2));
      if (aylar.indexOf(monthPart) === -1) {
        aylar.push(monthPart);
      }

      if (seri != undefined && tarih != undefined) {
        if (parseInt(serialPart) === 0) {
          seri = -2;
          tarih = 0;
          return;
        }
        if (parseInt(serialPart) === 1) {
          seri = parseInt(serialPart);
          tarih = parseInt(datePart);
          if (index === rows.length - 1) {
            seri = parseInt(serialPart);
            tarih = parseInt(datePart);
            console.log("t");

            handleAlert();
            setMessage(
              `${parseInt(
                datePart.slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
            return;
          } else {
            return;
          }
        }
        if (parseInt(datePart) === tarih) {
          if (parseInt(serialPart) === (seri || -2) + 1) {
            seri = parseInt(serialPart);
            tarih = parseInt(datePart);
            return;
          } else {
            console.log("x");
            handleAlert();
            setMessage(
              `${parseInt(
                datePart.slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
            return;
          }
        } else {
          console.log("y");
          handleAlert();

          if (parseInt(serialPart) !== 0 || parseInt(serialPart) !== 1) {
            setMessage(
              `${parseInt(
                datePart.slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
          } else {
            setMessage(
              `${parseInt(
                tarih.toString().slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
          }
          return;
        }
      } else {
        if (parseInt(serialPart) === 0) {
          return;
        } else if (parseInt(serialPart) === 1) {
          seri = parseInt(serialPart);
          tarih = parseInt(datePart);
          if (index === rows.length - 1) {
            console.log("z");
            handleAlert();
            setMessage(
              `${parseInt(
                datePart.slice(-2)
              )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
            );
            return;
          } else {
            return;
          }
        } else {
          handleAlert();
          setMessage(
            `${parseInt(
              datePart.slice(-2)
            )}. Ay İçin Eksik E-Defter Yüklenmiştir. Kontrol Edin.`
          );
          return;
        }
      }
    });

    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    const missingMonths = allMonths.filter((month) => !aylar.includes(month));

    if (missingMonths.length > 0) {
      handleAlert();
      setMessage(
        `Tüm Aylar İçin E-Defter Yükleyin. Eksik Aylar: ${missingMonths.join(
          ", "
        )}`
      );
    }
    setControl(false);
  };

  const handleAlert = () => {
    setIsAlertOpen(true);
    setOpenCartAlert(true);
  };

  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const handleCloseConfirmPopUp = () => {
    setIsConfirmPopUpOpen(false);
  };

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePreview2 = async () => {
    try {
      var controller =
        fileType === "E-DefterKebir" ? "DosyaGoster" : "PdfDosyasiGoster";
      const response = await axios({
        url: `https://faswebapitest.azurewebsites.net/api/Veri/${controller}/${selectedId}`,
        method: "GET",
        responseType: "blob",
        headers: {
          Accept:
            fileType === "E-DefterKebir" ? "text/html" : "application/pdf",
        },
      });

      const xmlBlob = new Blob([response.data], {
        type: fileType === "E-DefterKebir" ? "text/html" : "application/pdf",
      });
      const xmlBlobUrl = window.URL.createObjectURL(xmlBlob);
      setXmlBlobUrl(xmlBlobUrl);
      setIsOpen2(true);
    } catch (error) {
      console.error("Error fetching XML:", error);
    }
  };

  const handlePreview = async (id: number) => {
    try {
      const defterYuklemeLoglari = await getDefterYuklemeLoglari(
        user.token || "",
        id
      );
      setDefterLoglari(defterYuklemeLoglari);
      setIsOpen(true);
    } catch (error) {
      console.error("Defter Logları getirilemedi");
    }
  };

  const fetchData = async () => {
    try {
      const dosyaBilgileri = await getDosyaBilgileri(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        fileType
      );
      const newRows = dosyaBilgileri.map((dosya: DosyaType) => ({
        id: dosya.id,
        adi: dosya.adi,
        olusturulmaTarihi: dosya.olusturulmaTarihi
          .split("T")[0]
          .split("-")
          .reverse()
          .join("."),
        durum: dosya.durum,
      }));
      setRows(newRows);
      setControl(true);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (control && control2) {
      handleAlertPopUp();
    }
  }, [control, control2]);

  useEffect(() => {
    fetchData();
  }, [fileType]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (dosyaYuklendiMi) {
      fetchData();
      setControl2(true);
    } else {
      const intervalId = setInterval(fetchData, 2000);
      setControl2(false);

      return () => clearInterval(intervalId);
    }
  }, [dosyaYuklendiMi]);

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
    row.adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredRows.map((row) => row.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClickRow = (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

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

  const deleteSelected = async () => {
    try {
      const result = await deleteDosyaBilgisiMultiple(
        user.token || "",
        selected || 0
      );
      if (result) {
        selected.length = 0;
        fetchData();
      } else {
        console.error("Dosya Bilgileri silinemedi");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center">
        <Box padding={"16px"} width={"100%"}>
          <Typography variant="h5">Yüklenmiş Dosya Bilgileri</Typography>
        </Box>

        <TextField
          placeholder="Arama"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ marginRight: "16px" }}
        />
      </Stack>
      <TableContainer
        sx={{
          mt: 0.5,
          maxHeight: "425px",
          minHeight: "425px",
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
                <Typography variant="h5">Dosya Adı</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h5">
                  Tarih
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h5">
                  Durum
                </Typography>
              </TableCell>
              {mdUp && <TableCell></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
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
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </TableCell>
                  <TableCell scope="row">
                    <Typography variant="h6" color="textSecondary">
                      {fileType == "E-DefterKebir" ||
                      fileType == "E-DefterYevmiye"
                        ? row.adi.split("-").slice(1).join("-")
                        : row.adi}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      textAlign={"center"}
                      variant="h6"
                      color="textSecondary"
                    >
                      {row.olusturulmaTarihi}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePreview(row.id);
                      }}
                    >
                      <Chip
                        label={row.durum}
                        sx={{
                          backgroundColor:
                            row.durum === "Tamamlandı"
                              ? (theme) => theme.palette.success.light
                              : row.durum === "İşleniyor"
                              ? (theme) => theme.palette.info.light
                              : row.durum === "Sıraya Alındı."
                              ? (theme) => theme.palette.warning.light
                              : (theme) => theme.palette.error.light,
                          color:
                            row.durum === "Tamamlandı"
                              ? (theme) => theme.palette.success.main
                              : row.durum === "İşleniyor"
                              ? (theme) => theme.palette.info.main
                              : row.durum === "Sıraya Alındı."
                              ? (theme) => theme.palette.warning.main
                              : (theme) => theme.palette.error.main,
                        }}
                      />
                    </IconButton>
                  </TableCell>
                  {mdUp && (
                    <TableCell>
                      <IconButton
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={(event) => handleClick(event, row.id)}
                      >
                        <IconDotsVertical width={18} />
                      </IconButton>

                      <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                          "aria-labelledby": "basic-button",
                        }}
                      >
                        <MenuItem onClick={() => handlePreview2()}>
                          <ListItemIcon>
                            <IconEye width={18} />
                          </ListItemIcon>
                          Göster
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  )}
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
        {fileType == "E-DefterKebir" && (
          <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            fullWidth
            maxWidth={"md"}
          >
            <DialogContent className="testdialog">
              <Stack
                direction="row"
                justifyContent={"space-between"}
                alignItems="center"
              >
                <Typography variant="h5" py={1}>
                  İşlem Logları
                </Typography>
                <IconButton size="small" onClick={() => setIsOpen(false)}>
                  <IconX size="18" />
                </IconButton>
              </Stack>
            </DialogContent>
            <Divider />
            <DialogContent>
              <Typography variant="body1" style={{ whiteSpace: "pre-line" }}>
                {defterLoglari}
              </Typography>
            </DialogContent>
          </Dialog>
        )}
        <Dialog
          open={isOpen2}
          onClose={() => setIsOpen2(false)}
          fullWidth
          maxWidth={fileType === "E-DefterKebir" ? false : "xl"}
        >
          <DialogContent>
            <iframe
              src={xmlBlobUrl}
              width="100%"
              height="800px"
              style={{
                backgroundColor: "#fff",
                border: "none",
                margin: "0 auto",
                overflow: "hidden",
              }}
            ></iframe>
          </DialogContent>
        </Dialog>
      </TableContainer>
      {selected.length !== 0 && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => {
            handleIsConfirm();
          }}
          sx={{
            position: smDown ? "relative" : "absolute",
            width: smDown ? "100%" : "auto",
            marginLeft: smDown ? "" : "10px",
            marginY: smDown ? "8px" : "12px",
          }}
        >
          {selected.length} Kayıt Sil
        </Button>
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
              rowsPerPageOptions={[5, 10, 25, { label: "Hepsi", value: -1 }]}
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
              sx={{ mt: 0.5, mr: "2px", border: 0 }}
            />
          </TableRow>
        </TableFooter>
      </Table>
      {isConfirmPopUpOpen && (
        <ConfirmPopUpComponent
          isConfirmPopUp={isConfirmPopUpOpen}
          handleClose={handleCloseConfirmPopUp}
          handleDelete={deleteSelected}
        />
      )}
      {isAlertOpen && fileType === "E-DefterKebir" && (
        <WarnAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
          message={message}
        ></WarnAlertCart>
      )}
    </>
  );
};

export default DosyaTable;
