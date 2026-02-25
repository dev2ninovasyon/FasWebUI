import React, { useEffect, useMemo, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  TableSortLabel,
  Tooltip,
  Box,
} from "@mui/material";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import {
  deleteDenetlenenById,
  getDenetlenenByDenetciId,
  getImportJobSummariesByDenetciId,
} from "@/api/Musteri/MusteriIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";
import { enqueueSnackbar } from "notistack";
import ImportProgressDialog from "./ImportProgressDialog";

interface Props {
  refreshKey?: number;
  searchTerm?: string;
}

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("tr-TR");
};

const normalize = (value?: string | null) =>
  (value || "").toLocaleLowerCase("tr-TR").trim();

type SortField = "date" | "firmaAdi";
type SortDirection = "desc" | "asc";

const MusteriTable = ({ refreshKey = 0, searchTerm = "" }: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedLogJobId, setSelectedLogJobId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const open = Boolean(anchorEl);
  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const filteredRows = useMemo(() => {
    const q = normalize(searchTerm);
    if (!q) return rows;
    return rows.filter((row) => normalize(row.firmaAdi).includes(q));
  }, [rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const toSortDate = (row: any) => {
      const summary = row.importSummary;
      const isImported = row.kayitKaynagi === "OldDbImport";
      const rawDate = isImported
        ? summary?.updatedAt || summary?.createdAt || row.importedAt || row.createdAt
        : row.createdAt;
      const timestamp = rawDate ? new Date(rawDate).getTime() : 0;
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    return [...filteredRows].sort((a, b) => {
      if (sortField === "firmaAdi") {
        const aName = normalize(a.firmaAdi);
        const bName = normalize(b.firmaAdi);
        return sortDirection === "asc"
          ? aName.localeCompare(bName, "tr")
          : bName.localeCompare(aName, "tr");
      }

      const aTime = toSortDate(a);
      const bTime = toSortDate(b);
      return sortDirection === "desc" ? bTime - aTime : aTime - bTime;
    });
  }, [filteredRows, sortDirection, sortField]);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleClose = () => setAnchorEl(null);

  const handleDuzenle = () => {
    handleClose();
    router.push(`/Musteri/MusteriIslemleri/MusteriDuzenle/${selectedId}`);
  };

  const handleDetay = () => {
    handleClose();
    router.push(`/Musteri/MusteriIslemleri/MusteriDetay/${selectedId}`);
  };

  const handleDelete = () => {
    handleClose();
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleOpenImportLog = (jobId?: string | null) => {
    if (!jobId) {
      enqueueSnackbar("Bu kayıt için taşıma logu bulunamadı.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    setSelectedLogJobId(jobId);
    setLogDialogOpen(true);
  };

  const handleDateSortToggle = () => {
    if (sortField !== "date") {
      setSortField("date");
      setSortDirection("desc");
      return;
    }
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleFirmaSortToggle = () => {
    if (sortField !== "firmaAdi") {
      setSortField("firmaAdi");
      setSortDirection("asc");
      return;
    }
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const fetchData = async () => {
    try {
      const denetciId = user.denetciId || 0;
      const [musteriVerileri, importSummaries] = await Promise.all([
        getDenetlenenByDenetciId(denetciId),
        getImportJobSummariesByDenetciId(denetciId),
      ]);

      const summaryMap: Record<number, any> = {};
      (importSummaries || []).forEach((summary: any) => {
        summaryMap[summary.companyId] = summary;
      });

      const newRows = (musteriVerileri || []).map((musteri: any) => ({
        id: musteri.id,
        denetciId: musteri.denetciId,
        firmaAdi: musteri.firmaAdi,
        yetkili: musteri.yetkili,
        tel: musteri.tel,
        adres: musteri.adres,
        email: musteri.email,
        createdAt: musteri.createdAt || null,
        kayitKaynagi: musteri.kayitKaynagi || "Manual",
        importedAt: musteri.importedAt || null,
        importJobId: musteri.importJobId || null,
        importSummary: summaryMap[musteri.id] || null,
      }));

      setRows(newRows);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteDenetlenenById(selectedId || 0);
      if (result) {
        await fetchData();
        setOpenDeleteDialog(false);
        enqueueSnackbar("Şirket başarıyla silindi", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } else {
        setOpenDeleteDialog(false);
        enqueueSnackbar("Şirket silinemedi. Lütfen tekrar deneyin.", {
          variant: "error",
          autoHideDuration: 5000,
        });
      }
    } catch (error) {
      setOpenDeleteDialog(false);
      enqueueSnackbar("Bir hata oluştu. Lütfen tekrar deneyin.", {
        variant: "error",
        autoHideDuration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey, user.denetciId]);

  return (
    <BlankCard>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === "firmaAdi"}
                  direction={sortField === "firmaAdi" ? sortDirection : "asc"}
                  onClick={handleFirmaSortToggle}
                  hideSortIcon={false}
                  sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                >
                  <Typography variant="h6">Firma Adı</Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Yetkili
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Telefon
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Email
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  <Typography variant="h6">Durum</Typography>
                  <Tooltip
                    title="'Taşındı' durumundaki müşterilere tıklayarak taşıma logunu görüntüleyebilirsiniz."
                    arrow
                    placement="top"
                  >
                    <Box component="span" sx={{ display: "flex", alignItems: "center", color: "text.secondary", cursor: "help" }}>
                      <IconInfoCircle size={15} />
                    </Box>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "date"}
                  direction={sortField === "date" ? sortDirection : "desc"}
                  onClick={handleDateSortToggle}
                  hideSortIcon={false}
                  sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                >
                  <Typography textAlign="center" variant="h6">
                    Tarih
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.map((row: any) => {
              const summary = row.importSummary;
              const isImported = row.kayitKaynagi === "OldDbImport";
              const displayDate = formatDate(
                isImported
                  ? summary?.updatedAt ||
                  summary?.createdAt ||
                  row.importedAt ||
                  row.createdAt
                  : row.createdAt
              );
              const logJobId = summary?.jobId || row.importJobId;

              return (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="h6">{row.firmaAdi}</Typography>
                  </TableCell>
                  <TableCell scope="row">
                    <Typography
                      textAlign="center"
                      variant="subtitle1"
                      color="textSecondary"
                    >
                      {row.yetkili}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      textAlign="center"
                      variant="subtitle1"
                      color="textSecondary"
                    >
                      {row.tel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      textAlign="center"
                      variant="subtitle1"
                      color="textSecondary"
                    >
                      {row.email}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {isImported ? (
                      <Chip
                        size="small"
                        color="success"
                        label="Taşındı"
                        onClick={() => handleOpenImportLog(logJobId)}
                        sx={{
                          minWidth: 90,
                          height: 24,
                          cursor: "pointer",
                          fontWeight: 600,
                          transition: "box-shadow 0.15s",
                          "&:hover": {
                            boxShadow: "0 0 0 3px rgba(76,175,80,0.25)",
                          },
                        }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="Oluşturuldu"
                        sx={{ minWidth: 90, height: 24 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{displayDate}</Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      id="basic-button2"
                      aria-controls={open ? "basic-menu2" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "false" : undefined}
                      onClick={(event) => handleClick(event, row.id)}
                    >
                      <IconDotsVertical width={18} />
                    </IconButton>
                    <Menu
                      id="basic-menu2"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{
                        "aria-labelledby": "basic-button2",
                      }}
                    >
                      <MenuItem onClick={() => handleDuzenle()}>
                        <ListItemIcon>
                          <IconEdit width={18} />
                        </ListItemIcon>
                        Düzenle
                      </MenuItem>
                      <MenuItem onClick={() => handleDetay()}>
                        <ListItemIcon>
                          <IconEye width={18} />
                        </ListItemIcon>
                        Detay
                      </MenuItem>
                      <MenuItem onClick={() => handleDelete()}>
                        <ListItemIcon>
                          <IconTrash width={18} />
                        </ListItemIcon>
                        Sil
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Şirketi Silmek İstediğinize Emin Misiniz?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bu işlem geri alınamaz. Onayladığınız takdirde şirkete ait <b>tüm veriler ve dosyalar kalıcı olarak silinecek</b> ve asla geri getirilemeyecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary" disabled={isDeleting}>
            İptal
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? "İşlem Yapılıyor..." : "Evet, Sil"}
          </Button>
        </DialogActions>
      </Dialog>

      <ImportProgressDialog
        open={logDialogOpen}
        jobId={selectedLogJobId}
        onClose={() => setLogDialogOpen(false)}
      />
    </BlankCard>
  );
};

export default MusteriTable;
