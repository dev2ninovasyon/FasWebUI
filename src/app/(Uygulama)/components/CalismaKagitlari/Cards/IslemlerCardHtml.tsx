"use client";

import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, Typography, useTheme } from "@mui/material";
import { IconArchive, IconFileTypeDocx, IconFileTypePdf, IconTrash } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import axios from "axios";
import { useSelector } from "@/store/hooks";
import { url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";

import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { enqueueSnackbar } from "notistack";
import { deleteArsiv, getArsiv } from "@/api/Arsiv/Arsiv";

interface Props {
  controller: string;
  buildHtmlAsync?: () => Promise<string>;
  previewEndpoint?: string;
  onBeforeAction?: () => Promise<boolean | void>;
}

interface ArsivNode {
  id: number;
  name: string;
  url?: string;
  children?: ArsivNode[];
}

const IslemlerCardHtml: React.FC<Props> = ({
  controller,
  buildHtmlAsync,
  previewEndpoint,
  onBeforeAction,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [openCartAlert, setOpenCartAlert] = useState(false);
  const [archiveDeleteOpen, setArchiveDeleteOpen] = useState(false);
  const [archiveChecking, setArchiveChecking] = useState(false);
  const [archiveDeleting, setArchiveDeleting] = useState(false);
  const [archiveOverwriteOpen, setArchiveOverwriteOpen] = useState(false);
  const [currentArchivePath, setCurrentArchivePath] = useState("");
  const [currentArchiveName, setCurrentArchiveName] = useState("");

  const revokeBlobUrl = (value?: string | null) => {
    if (value && value.startsWith("blob:")) {
      window.URL.revokeObjectURL(value);
    }
  };

  const runBeforeAction = async () => {
    if (!onBeforeAction) return true;

    const result = await onBeforeAction();
    return result !== false;
  };

  const expectedArchiveFileName = `${controller}-${user.yil}.docx`;

  const flattenArsivNodes = (nodes: ArsivNode[] | undefined): ArsivNode[] => {
    if (!nodes?.length) return [];
    return nodes.flatMap((node) => [node, ...flattenArsivNodes(node.children)]);
  };

  const refreshArchiveStatus = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;

    try {
      setArchiveChecking(true);
      const arsiv = (await getArsiv(
        user.denetciId,
        user.yil,
        user.denetlenenId
      )) as ArsivNode[] | undefined;

      const tumBelgeler = flattenArsivNodes(arsiv);
      const match = tumBelgeler.find(
        (item) =>
          (item.name ?? "").toLocaleLowerCase("tr-TR") ===
          expectedArchiveFileName.toLocaleLowerCase("tr-TR")
      );

      setCurrentArchivePath(match?.url ?? "");
      setCurrentArchiveName(match?.name ?? "");
    } catch (error) {
      console.log("Arşiv durumu alınamadı:", error);
      setCurrentArchivePath("");
      setCurrentArchiveName("");
    } finally {
      setArchiveChecking(false);
    }
  };

  const handleDownload = async () => {
    try {
      setOpenCartAlert(true);
      const canContinue = await runBeforeAction();
      if (!canContinue) return;

      if (!buildHtmlAsync) {
        alert("Önizleme için HTML üretici (buildHtmlAsync) bulunamadı.");
        return;
      }

      const endpoint = `/ArsivIslemleri/WordDosyasiIndirHtml`;
      const html = await buildHtmlAsync();

      const response = await axios.post(
        endpoint,
        {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
          title: controller,
          modelAdi: controller,
          html,
          save: true,
        },
        createAuthorizedAxiosConfig(
          {
            baseURL: url,
            headers: {
              "Content-Type": "application/json",
            },
            responseType: "blob",
          },
          user.token
        )
      );

      const urlFile = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlFile;
      link.setAttribute("download", `${controller}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(urlFile), 0);
    } catch (error) {
      console.log("İndirme hatası:", error);
      enqueueSnackbar("İndirme sırasında hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.light
              : theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setOpenCartAlert(false);
    }
  };

  const handlePreview = async () => {
    try {
      setOpenCartAlert(true);
      const canContinue = await runBeforeAction();
      if (!canContinue) return;

      if (!buildHtmlAsync) {
        alert("Önizleme için HTML üretici (buildHtmlAsync) bulunamadı.");
        return;
      }

      const html = await buildHtmlAsync();
      const endpoint = previewEndpoint || `/ArsivIslemleri/PreviewFromHtml`;

      const response = await axios.post(
        endpoint,
        {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
          title: controller,
          modelAdi: controller,
          html,
          save: true,
        },
        createAuthorizedAxiosConfig(
          {
            baseURL: url,
            headers: {
              "Content-Type": "application/json",
            },
            responseType: "blob",
          },
          user.token
        )
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const nextPdfUrl = window.URL.createObjectURL(pdfBlob);
      setPdfBlobUrl((prev) => {
        revokeBlobUrl(prev);
        return nextPdfUrl;
      });
      setIsOpen(true);
    } catch (error: any) {
      console.log("Önizleme/Export hatası:", error?.response || error);
      enqueueSnackbar("Önizleme sırasında hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.light
              : theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setOpenCartAlert(false);
    }
  };

  const doArchive = async () => {
    try {
      setOpenCartAlert(true);
      const canContinue = await runBeforeAction();
      if (!canContinue) return;

      if (!buildHtmlAsync) {
        alert("Arşive kaydetme için HTML üretici (buildHtmlAsync) bulunamadı.");
        return;
      }

      const html = await buildHtmlAsync();
      const endpoint = `/ArsivIslemleri/ArsiveKaydetHtml`;

      await axios.post(
        endpoint,
        {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
          title: controller,
          modelAdi: controller,
          html,
          save: true,
        },
        createAuthorizedAxiosConfig(
          {
            baseURL: url,
            headers: {
              "Content-Type": "application/json",
            },
          },
          user.token
        )
      );

      enqueueSnackbar("Belge başarıyla arşive kaydedildi.", {
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
      await refreshArchiveStatus();
    } catch (error: any) {
      console.log("Arşive kaydetme hatası:", error?.response || error);
      enqueueSnackbar("Arşive kaydedilirken hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.light
              : theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setOpenCartAlert(false);
    }
  };

  const handleArchive = () => {
    if (currentArchivePath) {
      setArchiveOverwriteOpen(true);
    } else {
      doArchive();
    }
  };

  const handleArchiveDelete = async () => {
    if (!currentArchivePath) {
      enqueueSnackbar("Silinecek arşiv dosyası bulunamadı.", {
        variant: "warning",
        autoHideDuration: 5000,
      });
      setArchiveDeleteOpen(false);
      return;
    }

    try {
      setArchiveDeleting(true);
      const ok = await deleteArsiv(currentArchivePath);
      if (ok) {
        enqueueSnackbar("Arşivdeki belge silindi.", {
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
        setCurrentArchivePath("");
        setCurrentArchiveName("");
      } else {
        enqueueSnackbar("Arşivdeki belge silinemedi.", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error: any) {
      console.log("Arşivden silme hatası:", error?.response || error);
      enqueueSnackbar("Arşivden silinirken hata oluştu.", {
        variant: "error",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.error.light
              : theme.palette.error.main,
          maxWidth: "720px",
        },
      });
    } finally {
      setArchiveDeleting(false);
      setArchiveDeleteOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      revokeBlobUrl(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  useEffect(() => {
    refreshArchiveStatus();
  }, [user.denetciId, user.denetlenenId, user.yil, controller]);

  return (
    <Grid container>
      <Grid
        size={{
          xs: 12,
          lg: 12,
        }}
      >
        <Card sx={{ width: "100%", bgcolor: "primary.light" }}>
          <CardContent sx={{ bgcolor: "primary.light" }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              sx={{ mb: 1.5 }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Dışa aktarma ve arşiv işlemleri
              </Typography>
              <Chip
                size="small"
                color={currentArchivePath ? "success" : "default"}
                variant="outlined"
                label={
                  archiveChecking
                    ? "Arşiv kontrol ediliyor"
                    : currentArchivePath
                    ? `Arşivde var: ${currentArchiveName}`
                    : "Arşivde kayıt yok"
                }
              />
            </Stack>
            <Grid
              container
              sx={{
                width: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={{
                  xs: 12,
                  lg: 2.8,
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  startIcon={<IconFileTypePdf width={18} />}
                  disabled={openCartAlert}
                  onClick={handlePreview}
                  sx={{ width: "100%" }}
                >
                  Önizleme
                </Button>
              </Grid>

              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={{
                  xs: 12,
                  lg: 2.8,
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  startIcon={<IconFileTypeDocx width={18} />}
                  disabled={openCartAlert}
                  onClick={handleDownload}
                  sx={{ width: "100%" }}
                >
                  İndir
                </Button>
              </Grid>

              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={{
                  xs: 12,
                  lg: 2.8,
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  startIcon={<IconArchive width={18} />}
                  disabled={openCartAlert}
                  onClick={handleArchive}
                  sx={{ width: "100%" }}
                >
                  Arşive Kaydet
                </Button>
              </Grid>

              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={{
                  xs: 12,
                  lg: 2.8,
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  color="error"
                  startIcon={<IconTrash width={18} />}
                  disabled={openCartAlert || archiveChecking || !currentArchivePath}
                  onClick={() => setArchiveDeleteOpen(true)}
                  sx={{ width: "100%" }}
                >
                  Arşivden Sil
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setPdfBlobUrl((prev) => {
            revokeBlobUrl(prev);
            return "";
          });
        }}
        fullWidth
        maxWidth="xl"
      >
        <DialogContent sx={{ p: 0, overflow: "hidden" }}>
          <div style={{ width: "100%", height: "80vh", overflow: "hidden" }}>
            {pdfBlobUrl && (
              <object
                data={pdfBlobUrl}
                type="application/pdf"
                style={{ width: "100%", height: "100%", border: 0 }}
              >
                <iframe
                  src={pdfBlobUrl}
                  style={{ width: "100%", height: "100%", border: 0 }}
                  title="preview"
                />
              </object>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        />
      )}
      <Dialog
        open={archiveOverwriteOpen}
        onClose={() => setArchiveOverwriteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mevcut Belgenin Üzerine Yazılacak</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {`"${currentArchiveName}" arşivde zaten mevcut. Devam ederseniz mevcut belgenin üzerine yazılacak. Onaylıyor musunuz?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveOverwriteOpen(false)}>
            Vazgeç
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => {
              setArchiveOverwriteOpen(false);
              doArchive();
            }}
          >
            Üzerine Yaz
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={archiveDeleteOpen}
        onClose={() => !archiveDeleting && setArchiveDeleteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Arşiv Kaydını Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {currentArchiveName
              ? `"${currentArchiveName}" arşivden silinecek. Bu işlem yalnızca arşiv kaydını kaldırır; ekrandaki verileri silmez.`
              : "Bu form için arşiv kaydı bulunamadı."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setArchiveDeleteOpen(false)}
            disabled={archiveDeleting}
          >
            Vazgeç
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleArchiveDelete}
            disabled={archiveDeleting || !currentArchivePath}
          >
            {archiveDeleting ? "Siliniyor..." : "Arşivden Sil"}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default IslemlerCardHtml;
