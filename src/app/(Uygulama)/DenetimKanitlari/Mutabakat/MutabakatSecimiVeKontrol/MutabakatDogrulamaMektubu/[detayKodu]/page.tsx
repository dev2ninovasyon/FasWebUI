"use client";

import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  useTheme,
} from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { getMutabakatDogrulamaMektubu } from "@/api/DenetimKanitlari/DenetimKanitlari";
import {
  getMutabakatMektupBelge,
  uploadMutabakatMektubu,
  downloadMutabakatMektup,
  deleteMutabakatMektup,
  generateMutabakatUploadLink,
  MutabakatMektupBelgeDto,
} from "@/api/DenetimKanitlari/MutabakatMektup";
import { usePathname } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import dynamic from "next/dynamic";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import { enqueueSnackbar } from "notistack";

const CustomEditorWVeri = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditorWVeri"),
  { ssr: false }
);

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Mutabakat",
    title: "Mutabakat",
  },
  {
    to: "/DenetimKanitlari/Mutabakat/MutabakatSecimiVeKontrol",
    title: "Mutabakat Seçimi Ve Kontrol",
  },
  {
    to: "/DenetimKanitlari/Mutabakat/MutabakatSecimiVeKontrol/MutabakatDogrulamaMektubu",
    title: "Mutabakat Doğrulama Mektubu",
  },
];

interface Veri {
  id: number;
  metin: string;
}

const controller = "MutabakatDogrulamaMektubu";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("MutabakatDogrulamaMektubu") + 1;
  const pathDetayKodu = segments[idIndex];

  const [veriler, setVeriler] = useState<Veri>();
  const [mektupBelge, setMektupBelge] = useState<MutabakatMektupBelgeDto | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("");
  const [aliciAdi, setAliciAdi] = useState("");
  const [hesapAdi, setHesapAdi] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [gecerlilikGun, setGecerlilikGun] = useState(7);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  // PDF preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const mutabakatDogrulamaMektubuVerileri =
        await getMutabakatDogrulamaMektubu(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          pathDetayKodu || ""
        );
      if (mutabakatDogrulamaMektubuVerileri) {
        const newVeri = {
          id: mutabakatDogrulamaMektubuVerileri.id,
          metin: mutabakatDogrulamaMektubuVerileri.metin,
        };
        setVeriler(newVeri);
      } else {
        console.warn("No data found");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchMektupBelge = async () => {
    try {
      const belge = await getMutabakatMektupBelge(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        pathDetayKodu || ""
      );
      setMektupBelge(belge);
    } catch (error) {
      console.error("Mektup bilgisi alınamadı:", error);
    }
  };

  // Extract recipient name from editor content (after "Sayın:")
  const extractAliciAdiFromMetin = (htmlContent: string): string => {
    if (!htmlContent) return "";

    // Remove HTML tags and get plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    // Look for "Sayın:" and extract the text after it
    const sayinIndex = plainText.indexOf("Sayın:");
    if (sayinIndex === -1) return "";

    // Get text after "Sayın:"
    const afterSayin = plainText.substring(sayinIndex + 6).trim();

    // Find the index of "Mutabakat" keyword
    const mutabakatIndex = afterSayin.indexOf("Mutabakat");

    // Extract until "Mutabakat", newline, or comma (whichever comes first)
    let endIndex = afterSayin.search(/[\n,]/);

    if (mutabakatIndex !== -1 && (endIndex === -1 || mutabakatIndex < endIndex)) {
      // "Mutabakat" comes before newline/comma or there's no newline/comma
      return afterSayin.substring(0, mutabakatIndex).trim();
    }

    if (endIndex !== -1) {
      return afterSayin.substring(0, endIndex).trim();
    }

    // No stopping point found, take the next 100 characters max
    return afterSayin.substring(0, 100).trim();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Check if mektup is PDF
  const isPdfMektup = (belge: MutabakatMektupBelgeDto) => {
    const contentType = belge.contentType?.toLowerCase() || "";
    const name = (belge.orijinalDosyaAdi || "").toLowerCase();
    return contentType.includes("pdf") || name.endsWith(".pdf");
  };

  // Drag & drop handlers
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadMektup = async () => {
    if (!selectedFile) {
      enqueueSnackbar("Lütfen bir dosya seçin", { variant: "warning" });
      return;
    }

    try {
      setIsUploading(true);
      await uploadMutabakatMektubu(
        user.token || "",
        selectedFile,
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        pathDetayKodu || "",
        user.id || 0,
        aciklama
      );

      enqueueSnackbar("Mektup başarıyla yüklendi", {
        variant: "success",
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.success.dark
              : theme.palette.success.main,
        },
      });

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setAciklama("");
      await fetchMektupBelge();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Mektup yüklenemedi", {
        variant: "error",
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

  const handleDownloadMektup = async () => {
    if (!mektupBelge) return;

    try {
      const { blob, fileName } = await downloadMutabakatMektup(
        user.token || "",
        mektupBelge.id
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Mektup indirildi", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Mektup indirilemedi", { variant: "error" });
    }
  };

  const handleDeleteMektup = async () => {
    if (!mektupBelge) return;

    if (!confirm("Mektubu silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteMutabakatMektup(user.token || "", mektupBelge.id, user.id || 0);
      enqueueSnackbar("Mektup silindi", {
        variant: "success",
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.success.dark
              : theme.palette.success.main,
        },
      });
      setMektupBelge(null);
    } catch (error) {
      enqueueSnackbar("Mektup silinemedi", {
        variant: "error",
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.dark
              : theme.palette.error.main,
        },
      });
    }
  };

  const handleViewMektup = async () => {
    if (!mektupBelge) return;

    try {
      const { blob, fileName } = await downloadMutabakatMektup(
        user.token || "",
        mektupBelge.id
      );
      const url = window.URL.createObjectURL(blob);

      // PDF ise popup'ta göster, değilse direkt indir
      if (isPdfMektup(mektupBelge)) {
        setPreviewUrl(url);
        setPreviewOpen(true);
      } else {
        // PDF değilse direkt indir
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        enqueueSnackbar("Dosya indiriliyor", { variant: "info" });
      }
    } catch (error) {
      enqueueSnackbar("Dosya görüntülenemedi", {
        variant: "error",
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.dark
              : theme.palette.error.main,
        },
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleGenerateLink = async () => {
    try {
      const response = await generateMutabakatUploadLink(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        pathDetayKodu || "",
        user.id || 0,
        gecerlilikGun,
        aliciAdi,
        hesapAdi,
        aciklama
      );

      setGeneratedLink(response.uploadUrl);
      setLinkExpiry(new Date(response.sonKullanmaTarihi).toLocaleString("tr-TR"));

      enqueueSnackbar("Link oluşturuldu", {
        variant: "success",
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.success.dark
              : theme.palette.success.main,
        },
      });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Link oluşturulamadı", {
        variant: "error",
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.dark
              : theme.palette.error.main,
        },
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    enqueueSnackbar("Link panoya kopyalandı", { variant: "info" });
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    setGeneratedLink("");
    setAliciAdi("");
    setHesapAdi("");
    setAciklama("");
    setGecerlilikGun(7);
  };

  useEffect(() => {
    fetchData();
    fetchMektupBelge();
  }, []);

  return (

    <>
      <Breadcrumb title="Mutabakat Doğrulama Mektubu" items={BCrumb}>
        <Grid
          container
          sx={{
            width: "95%",
            height: "100%",
            margin: "0 auto",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setUploadDialogOpen(true)}
              color="primary"
              size="medium"
              sx={{ width: "100%" }}
            >
              <Typography
                variant="body1"
                sx={{
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                }}
              >
                Mektup Yükle
              </Typography>{" "}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                // Extract and set Alıcı Adı from editor content
                if (veriler?.metin) {
                  const extractedName = extractAliciAdiFromMetin(veriler.metin);
                  setAliciAdi(extractedName);
                }
                setLinkDialogOpen(true);
              }}
              color="primary"
              size="medium"
              sx={{ width: "100%" }}
            >
              <Typography
                variant="body1"
                sx={{
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                }}
              >
                Link Üret
              </Typography>{" "}
            </Button>
          </Grid>
        </Grid>
      </Breadcrumb >
      <PageContainer
        title="Mutabakat Doğrulama Mektubu"
        description="this is Mutabakat Doğrulama Mektubu"
      >


        {/* File info if exists */}
        {mektupBelge && (
          <Box
            mb={2}
            p={2}
            sx={{
              borderRadius: 1,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
              <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                <Chip
                  label={`Yüklü Mektup: ${mektupBelge.orijinalDosyaAdi}`}
                  color="success"
                  variant="outlined"
                  size="medium"
                />
                <Typography variant="caption" color="text.secondary">
                  Yüklenme: {new Date(mektupBelge.yuklemeTarihi).toLocaleString("tr-TR")}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadMektup}
                  color="info"
                  size="small"
                >
                  İndir
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={handleViewMektup}
                  color="success"
                  size="small"
                >
                  Görüntüle
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteMektup}
                  color="error"
                  size="small"
                >
                  Sil
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}


        <Grid container spacing={3}>

          {/* Editor */}
          {veriler && (
            <Grid item xs={12} lg={12}>
              <CustomEditorWVeri controller={controller} veri={veriler} />
            </Grid>
          )}
        </Grid>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <div>
                <Typography variant="h6">Mektup Yükle</Typography>
                <Typography variant="body2" color="text.secondary">
                  Dosyayı sürükleyip bırakın veya tıklayarak seçin
                </Typography>
              </div>
              <IconButton onClick={() => setUploadDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              {/* Drag & Drop Upload Zone */}
              <Box
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                sx={{
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  padding: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  transition: "all 0.15s ease-in-out",
                }}
              >
                {isUploading ? (
                  <Typography variant="body2">Dosya yükleniyor...</Typography>
                ) : (
                  <Stack spacing={2} alignItems="center">
                    <CloudUploadIcon
                      fontSize="large"
                      color="primary"
                      sx={{ fontSize: 48 }}
                    />
                    <Typography variant="h6">
                      Dosyayı buraya sürükleyin veya tıklayıp seçin
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PDF, Word (doc/docx), PNG veya JPG formatları desteklenir
                    </Typography>
                    {selectedFile && (
                      <Chip
                        label={`Seçili dosya: ${selectedFile.name}`}
                        color="primary"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Stack>
                )}
              </Box>

              {/* Hidden file input */}
              <input
                id="file-input"
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
              />

              {/* Açıklama alanı */}
              <TextField
                label="Açıklama (Opsiyonel)"
                multiline
                rows={3}
                fullWidth
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>İptal</Button>
            <Button
              onClick={handleUploadMektup}
              variant="contained"
              disabled={!selectedFile || isUploading}
              startIcon={<CloudUploadIcon />}
            >
              {isUploading ? "Yükleniyor..." : "Yükle"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Link Generation Dialog */}
        <Dialog open={linkDialogOpen} onClose={handleCloseLinkDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Yükleme Linki Oluştur
              <IconButton onClick={handleCloseLinkDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              {!generatedLink ? (
                <>
                  <TextField
                    label="Alıcı Adı (Opsiyonel)"
                    fullWidth
                    value={aliciAdi}
                    onChange={(e) => setAliciAdi(e.target.value)}
                    placeholder="Örn: ABC Şirketi"
                  />

                  <TextField
                    label="Geçerlilik Süresi (Gün)"
                    type="number"
                    fullWidth
                    value={gecerlilikGun}
                    onChange={(e) => setGecerlilikGun(Number(e.target.value))}
                    inputProps={{ min: 1, max: 30 }}
                  />
                  <TextField
                    label="Açıklama (Opsiyonel)"
                    multiline
                    rows={3}
                    fullWidth
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Typography variant="body1" fontWeight="bold">
                    Link başarıyla oluşturuldu!
                  </Typography>
                  <TextField
                    label="Yükleme Linki"
                    fullWidth
                    value={generatedLink}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton onClick={handleCopyLink}>
                          <ContentCopyIcon />
                        </IconButton>
                      ),
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Son kullanma tarihi: {linkExpiry}
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    Bu linki ilgili kişiye göndererek mektup yüklemesini sağlayabilirsiniz.
                  </Typography>
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLinkDialog}>Kapat</Button>
            {!generatedLink && (
              <Button onClick={handleGenerateLink} variant="contained">
                Link Oluştur
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* PDF Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={handleClosePreview}
          maxWidth="lg"
          fullScreen
          sx={{ '& .MuiDialog-paper': { margin: 0, maxHeight: '100%' } }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Mektup Önizleme: {mektupBelge?.orijinalDosyaAdi}
              </Typography>
              <Box>
                <IconButton onClick={handleDownloadMektup} sx={{ mr: 1 }}>
                  <DownloadIcon />
                </IconButton>
                <IconButton onClick={handleClosePreview}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0, height: '100%', bgcolor: '#525659' }}>
            {previewUrl && (
              <iframe
                src={previewUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="PDF Preview"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDownloadMektup} startIcon={<DownloadIcon />} variant="outlined">
              İndir
            </Button>
            <Button onClick={handleClosePreview} variant="contained">
              Kapat
            </Button>
          </DialogActions>
        </Dialog>
      </PageContainer>
    </>
  );
};

export default Page;
