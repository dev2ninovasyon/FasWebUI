// src/app/(Uygulama)/components/CalismaKagitlari/EkBelgeYukleButton.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Typography,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Grid,
  Paper,
  Divider,
  Checkbox,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import {
  uploadEkBelge,
  getEkBelgeler,
  downloadEkBelge,
  EkBelgeDto,
  deleteEkBelge,
} from "@/api/CalismaKagitlari/CalismaKagitlariEkBelge";
// en üst kısma ekle
import { jsPDF } from "jspdf";

interface EkBelgeYukleButtonProps {
  formKodu: string;
  text?: string;
  fullWidth?: boolean;
  onUploaded?: () => void;
}

const EkBelgeYukleButton: React.FC<EkBelgeYukleButtonProps> = ({
  formKodu,
  text = "Ek Belge Yükle",
  fullWidth = true,
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [ekBelgeler, setEkBelgeler] = useState<EkBelgeDto[]>([]);
  const [open, setOpen] = useState(false);

  // PDF önizleme için:
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");

  // Seçerek silme için:
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Drag & drop highlight
  const [isDragging, setIsDragging] = useState(false);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const canLoad =
    !!user.token && !!user.denetciId && !!user.denetlenenId && !!user.yil;

  const isAllSelected =
    ekBelgeler.length > 0 && selectedIds.length === ekBelgeler.length;

  // Sadece PDF olan belgeleri tespit etmek için helper
  const isPdfBelge = (belge: EkBelgeDto) => {
    const fileName = (belge.orijinalDosyaAdi || "").toLowerCase();
    const contentType = belge.contentType?.toLowerCase() || "";
    return contentType.includes("pdf") || fileName.endsWith(".pdf");
  };

  const loadEkBelgeler = async () => {
    if (!canLoad) return;

    try {
      setIsLoadingList(true);
      const list = await getEkBelgeler(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        formKodu
      );
      setEkBelgeler(list);
      setSelectedIds([]); // liste yenilenince seçimleri temizle
    } catch (error) {
      console.error("Ek belgeler alınırken hata oluştu:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    await loadEkBelgeler();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickUploadButton = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };
// PNG dosyasını tek sayfalık PDF'e çevirir
const convertPngToPdf = async (file: File): Promise<File> => {
  return new Promise<File>(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blobUrl = URL.createObjectURL(new Blob([arrayBuffer]));
      const img = new Image();
      img.src = blobUrl;
      img.onload = () => {
        try {
          const pdf = new jsPDF({
            orientation: img.width > img.height ? "l" : "p",
            unit: "pt",
            format: [img.width, img.height],
          });

          pdf.addImage(img, "PNG", 0, 0, img.width, img.height);
          const pdfBlob = pdf.output("blob");
          URL.revokeObjectURL(blobUrl);

          const pdfFile = new File(
            [pdfBlob],
            file.name.replace(/\.png$/i, ".pdf"),
            { type: "application/pdf" }
          );

          resolve(pdfFile);
        } catch (err) {
          URL.revokeObjectURL(blobUrl);
          reject(err);
        }
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(blobUrl);
        reject(e);
      };
    } catch (err) {
      reject(err);
    }
  });
};

  // Ortak dosya işleme fonksiyonu (input + drag&drop)
// Ortak dosya işleme fonksiyonu (input + drag&drop)
const handleFiles = async (files: FileList | File[] | null) => {
  if (!files || (files as FileList).length === 0) return;

  if (!canLoad) {
    enqueueSnackbar(
      "Kullanıcı veya denetim bilgileri eksik. Lütfen sayfayı yenileyin.",
      {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
        },
      }
    );
    return;
  }

  const allFiles = Array.from(files as FileList);

  // İzin verilen uzantılar
  const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "xlsm", "png"];

  const invalidFiles: string[] = [];
  const candidateFiles: File[] = [];

  for (const file of allFiles) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(ext)) {
      invalidFiles.push(file.name);
    } else {
      candidateFiles.push(file);
    }
  }

  // Geçersiz dosya varsa, hiçbirini yükleme; hata ver
  if (invalidFiles.length > 0) {
    enqueueSnackbar(
      `Sadece PDF, Word (doc/docx), Excel (xls/xlsx/xlsm) ve PNG dosyaları yüklenebilir. Geçersiz dosyalar: ${invalidFiles.join(
        ", "
      )}`,
      {
        variant: "error",
        autoHideDuration: 7000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.dark
              : theme.palette.error.main,
        },
      }
    );
    return;
  }

  if (candidateFiles.length === 0) {
    enqueueSnackbar("Yüklenecek uygun dosya bulunamadı.", {
      variant: "info",
      autoHideDuration: 4000,
    });
    return;
  }

  // PNG'leri PDF'e çevir
  const processedFiles: File[] = [];
  try {
    for (const file of candidateFiles) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (ext === "png") {
        const pdfFile = await convertPngToPdf(file);
        processedFiles.push(pdfFile);
      } else {
        processedFiles.push(file);
      }
    }
  } catch (err) {
    console.error("PNG dosyası PDF'e dönüştürülürken hata oluştu:", err);
    enqueueSnackbar(
      "PNG dosyası PDF'e dönüştürülürken bir hata oluştu. Lütfen tekrar deneyin.",
      {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.dark
              : theme.palette.error.main,
        },
      }
    );
    return;
  }

  const formData = new FormData();
  processedFiles.forEach((file) => {
    formData.append("files", file);
  });

  formData.append("FormKodu", formKodu);
  formData.append("DenetciId", String(user.denetciId));
  formData.append("DenetlenenId", String(user.denetlenenId));
  formData.append("Yil", String(user.yil));

  try {
    setIsUploading(true);

    const result = await uploadEkBelge(user.token || "", formData);

    if (result === true || (typeof result === "object" && result?.success)) {
      enqueueSnackbar("Ek belge(ler) başarıyla yüklendi.", {
        variant: "success",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.success.light
              : theme.palette.success.main,
        },
      });

      await loadEkBelgeler();
      if (onUploaded) onUploaded();
    } else {
      enqueueSnackbar(
        (typeof result === "object" &&
          (result.message || (result as any).error)) ||
          "Ek belgeler yüklenirken bir hata oluştu.",
        {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.dark
                : theme.palette.error.main,
          },
        }
      );
    }
  } catch (error) {
    console.error("Ek belge yüklenirken hata oluştu:", error);
    enqueueSnackbar("Ek belgeler yüklenirken beklenmeyen bir hata oluştu.", {
      variant: "error",
      autoHideDuration: 5000,
      style: {
        backgroundColor:
          customizer.activeMode === "dark"
            ? theme.palette.error.dark
            : theme.palette.error.main,
      },
    });
  } finally {
    setIsUploading(false);
  }
};

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    await handleFiles(files);
  };

  const handleDownload = async (belge: EkBelgeDto) => {
    if (!user.token) return;

    try {
      const { blob, fileName } = await downloadEkBelge(
        user.token || "",
        belge.id
      );
      console.log(fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || belge.orijinalDosyaAdi || "ek_belge";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ek belge indirilirken hata:", error);
      enqueueSnackbar("Ek belge indirilirken bir hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.dark
              : theme.palette.error.main,
        },
      });
    }
  };

  const handleView = async (belge: EkBelgeDto) => {
    if (!user.token) return;

    try {
      const { blob } = await downloadEkBelge(user.token || "", belge.id);

      const isPdf =
        belge.contentType?.toLowerCase().includes("pdf") ||
        belge.orijinalDosyaAdi.toLowerCase().endsWith(".pdf");

      const url = window.URL.createObjectURL(blob);

      if (isPdf) {
        setPreviewUrl(url);
        setPreviewFileName(belge.orijinalDosyaAdi || "ek_belge.pdf");
        setPreviewOpen(true);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = belge.orijinalDosyaAdi || "ek_belge";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Ek belge görüntülenirken hata:", error);
      enqueueSnackbar("Ek belge görüntülenirken bir hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.dark
              : theme.palette.error.main,
        },
      });
    }
  };

  // Tek tek seçim toggle
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Tümünü seç / temizle
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ekBelgeler.map((b) => b.id));
    }
  };

  // Silme butonuna basılınca sadece onay dialogunu aç
  const handleDeleteSelectedClick = () => {
    if (selectedIds.length === 0) {
      enqueueSnackbar("Lütfen silmek için en az bir belge seçin.", {
        variant: "info",
        autoHideDuration: 4000,
      });
      return;
    }
    setDeleteConfirmOpen(true);
  };

  // Onay popup'ından gerçekten sil
  const handleConfirmDeleteSelected = async () => {
    if (!user.token) return;
    if (selectedIds.length === 0) {
      setDeleteConfirmOpen(false);
      return;
    }

    try {
      setIsDeletingSelected(true);

      const promises = selectedIds.map((id) =>
        deleteEkBelge(user.token || "", id)
      );
      const results = await Promise.all(promises);

      const successIds = selectedIds.filter((_, idx) => results[idx]);
      const failedCount = selectedIds.length - successIds.length;

      if (successIds.length > 0) {
        setEkBelgeler((prev) => prev.filter((b) => !successIds.includes(b.id)));
        setSelectedIds([]);

        enqueueSnackbar(
          failedCount > 0
            ? `${successIds.length} belge silindi, ${failedCount} belge silinirken hata oluştu.`
            : "Seçilen ek belgeler başarıyla silindi.",
          {
            variant: failedCount > 0 ? "warning" : "success",
            autoHideDuration: 5000,
            style: {
              backgroundColor:
                customizer.activeMode === "dark"
                  ? failedCount > 0
                    ? theme.palette.warning.dark
                    : theme.palette.success.light
                  : failedCount > 0
                  ? theme.palette.warning.main
                  : theme.palette.success.main,
            },
          }
        );

        if (onUploaded) onUploaded();
      } else {
        enqueueSnackbar("Ek belgeler silinirken bir hata oluştu.", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.dark
                : theme.palette.error.main,
          },
        });
      }
    } catch (error) {
      console.error("Seçilen ek belgeler silinirken hata oluştu:", error);
      enqueueSnackbar(
        "Seçilen ek belgeler silinirken beklenmeyen bir hata oluştu.",
        {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.dark
                : theme.palette.error.main,
          },
        }
      );
    } finally {
      setIsDeletingSelected(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  // Drag & drop eventleri
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    await handleFiles(files);
  };

  // Preview URL cleanup
  useEffect(() => {
    if (!previewOpen && previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewOpen, previewUrl]);

  return (
    <>
      {/* Ana buton */}
      <Grid
        container
        sx={{
          width: "100%",
          height: "100%",
          margin: "0 auto",
          justifyContent: "space-between",
        }}
      >
        <Grid
          onClick={handleOpen}
          item
          xs={10}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            sx={{ width: "100%" }}
          >
            <Typography variant="body1">{text}</Typography>
          </Button>
        </Grid>
      </Grid>

      {/* gizli input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: "none" }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.xlsm,.png"
        onChange={handleFileChange}
      />

      {/* Ek belgeler popup */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle
          sx={{
            pb: 1,
            px: 3,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5">Ek Belge Yükle</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Çalışma kağıdınızla ilişkili ek belgeleri buradan
                yönetebilirsiniz.
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            px: 3,
            py: 3,
            bgcolor:
              theme.palette.mode === "dark"
                ? "background.default"
                : "#F8FAFC",
          }}
        >
          <Grid container spacing={3}>
            {/* Yükleme alanı */}
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: isDragging
                    ? theme.palette.primary.main
                    : "divider",
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: isDragging
                    ? theme.palette.mode === "dark"
                      ? "rgba(96,165,250,0.1)"
                      : "#E0F2FE"
                    : theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.02)"
                    : "background.paper",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.04)"
                        : "#F1F5F9",
                  },
                }}
                onClick={handleClickUploadButton}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Stack spacing={1.5} alignItems="center">
                  <CloudUploadIcon
                    fontSize="large"
                    color="primary"
                    sx={{ mb: 0.5 }}
                  />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Dosya bırakın ya da seçin
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                   Sadece PDF, Word, Excel ve PNG formatları desteklenir. Diğer formatlar yüklenemez.
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickUploadButton();
                    }}
                    disabled={isUploading}
                    sx={{ mt: 1.5 }}
                  >
                    {isUploading ? "Yükleniyor..." : "Dosya Seç"}
                  </Button>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Birden fazla dosya seçebilir veya buraya sürükleyip
                    bırakabilirsiniz.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            {/* Liste alanı */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Daha Önce Yüklenen Belgeler
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ ml: 1 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {ekBelgeler.length} belge
                    </Typography>
                    {ekBelgeler.length > 0 && (
                      <>
                        <Button
                          size="small"
                          variant="text"
                          onClick={handleToggleSelectAll}
                        >
                          {isAllSelected ? "Tümünü Kaldır" : "Tümünü Seç"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleDeleteSelectedClick}
                          disabled={
                            selectedIds.length === 0 || isDeletingSelected
                          }
                        >
                          {`Seçilenleri Sil (${selectedIds.length || 0})`}
                        </Button>
                      </>
                    )}
                  </Stack>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {isLoadingList ? (
                  <Typography variant="body2">Yükleniyor...</Typography>
                ) : ekBelgeler.length === 0 ? (
                  <Box
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    py={4}
                  >
                    <InsertDriveFileIcon
                      fontSize="large"
                      color="disabled"
                      sx={{ mb: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      Henüz ek belge yüklenmemiş.
                    </Typography>
                  </Box>
                ) : (
                  <List
                    dense
                    sx={{
                      maxHeight: 320,
                      overflowY: "auto",
                    }}
                  >
                    {ekBelgeler.map((belge) => {
                      const checked = selectedIds.includes(belge.id);
                      return (
                        <ListItem
                          key={belge.id}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            "&:hover": {
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.04)"
                                  : "#F1F5F9",
                            },
                          }}
                        >
                          <Checkbox
                            edge="start"
                            checked={checked}
                            onChange={() => toggleSelect(belge.id)}
                            tabIndex={-1}
                            disableRipple
                            sx={{ mr: 1 }}
                          />
                          <InsertDriveFileIcon
                            fontSize="small"
                            style={{ marginRight: 8 }}
                            color="action"
                          />
                          <ListItemText
                            primary={
                              <Typography variant="body2" noWrap>
                                {belge.orijinalDosyaAdi}
                              </Typography>
                            }
                            secondary={
                              belge.yuklemeTarihi
                                ? new Date(
                                    belge.yuklemeTarihi
                                  ).toLocaleString("tr-TR")
                                : undefined
                            }
                          />
                          <ListItemSecondaryAction>
                            {isPdfBelge(belge) && (
                              <IconButton
                                edge="end"
                                aria-label="görüntüle"
                                onClick={() => handleView(belge)}
                                sx={{ mr: 0.5 }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton
                              edge="end"
                              aria-label="indir"
                              onClick={() => handleDownload(belge)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 1.5,
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={handleClose}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Seçilenleri silme onay popup'ı */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={
          isDeletingSelected ? undefined : () => setDeleteConfirmOpen(false)
        }
      >
        <DialogTitle>Seçilen ek belgeleri sil</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            {selectedIds.length} adet ek belgeyi silmek istediğinize emin
            misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={isDeletingSelected}
          >
            Vazgeç
          </Button>
          <Button
            onClick={handleConfirmDeleteSelected}
            color="error"
            variant="contained"
            disabled={isDeletingSelected}
          >
            {isDeletingSelected ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Önizleme popup */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 1.5,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" noWrap>
              PDF Önizleme{previewFileName ? ` - ${previewFileName}` : ""}
            </Typography>
            <IconButton onClick={handleClosePreview} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            p: 2,
            height: "80vh",
            bgcolor:
              theme.palette.mode === "dark" ? "#1E1E1E" : "#F9FAFB",
          }}
        >
          {previewUrl && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 1,
              }}
            >
              <iframe
                src={previewUrl}
                title={previewFileName || "pdf-preview"}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 1.5,
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => {
              if (previewUrl) {
                window.open(previewUrl, "_blank");
              }
            }}
          >
            Yeni sekmede aç
          </Button>
          <Button onClick={handleClosePreview}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EkBelgeYukleButton;
