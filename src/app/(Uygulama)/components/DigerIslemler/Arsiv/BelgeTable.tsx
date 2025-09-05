import React, { useRef, useState } from "react";
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
  useMediaQuery,
  Checkbox,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { Stack } from "@mui/system";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { ConfirmPopUpComponent } from "@/app/(Uygulama)/components/CalismaKagitlari/ConfirmPopUp";
import { IconDotsVertical, IconDownload } from "@tabler/icons-react";

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

interface MyComponentProps {
  title: string;
  data: Veri[];
}

const BelgeTable: React.FC<MyComponentProps> = ({ title, data }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selected, setSelected] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState(0);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  const mdUp = useMediaQuery((theme: any) => theme.breakpoints.up("md"));

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

  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Seçilen dosyalar:", files);
      // Burada dosyaları işleyebilirsin
    }
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = data.filter((row) =>
    normalizeString(row.name).includes(normalizeString(searchTerm))
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
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" pl={2} mb={1}>
        <Box width={"100%"}>
          <Typography variant="h6">{title}</Typography>
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
          maxHeight: "434px",
          minHeight: "434px",
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
                <Typography variant="h6">Belge Adı</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h6">
                  Tarih
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h6">
                  Boyut
                </Typography>
              </TableCell>
              <TableCell></TableCell>
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
                  <TableCell padding="checkbox" sx={{ paddingY: 0 }}>
                    <Checkbox
                      checked={isItemSelected}
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </TableCell>
                  <TableCell sx={{ paddingY: 0 }}>
                    <Typography variant="body1" color="textSecondary">
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ paddingY: 0 }}>
                    <Typography
                      textAlign={"center"}
                      variant="body1"
                      color="textSecondary"
                    >
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ paddingY: 0 }}>
                    <Typography
                      textAlign={"center"}
                      variant="body1"
                      color="textSecondary"
                    >
                      10KB
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ paddingY: 0 }}>
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
                      <MenuItem>
                        <ListItemIcon>
                          <IconDownload width={18} />
                        </ListItemIcon>
                        İndir
                      </MenuItem>
                    </Menu>
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
      {selected.length !== 0 && (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => {}}
          sx={{
            position: smDown ? "relative" : "absolute",
            width: smDown ? "100%" : "auto",
            marginLeft: smDown ? "" : "100px",
            marginY: smDown ? "8px" : "12px",
          }}
        >
          {selected.length} Kayıt İndir
        </Button>
      )}
      {selected.length === 0 && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleButtonClick}
            sx={{
              position: smDown ? "relative" : "absolute",
              width: smDown ? "100%" : "auto",
              marginLeft: smDown ? "" : "10px",
              marginY: smDown ? "8px" : "12px",
            }}
          >
            Yükle
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
    </>
  );
};

export default BelgeTable;
