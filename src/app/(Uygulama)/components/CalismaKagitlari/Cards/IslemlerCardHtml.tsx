"use client";

import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Button, Dialog, DialogContent, Grid, useTheme } from "@mui/material";
import { IconFileTypeDocx, IconFileTypePdf, IconArchive } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import axios from "axios";
import { useSelector } from "@/store/hooks";
import { url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";

import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { enqueueSnackbar } from "notistack";

interface Props {
  controller: string;
  buildHtmlAsync?: () => Promise<string>;
  previewEndpoint?: string;
  onBeforeAction?: () => Promise<boolean | void>;
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

  const handleArchive = async () => {
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

  useEffect(() => {
    return () => {
      revokeBlobUrl(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

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
                  lg: 3.75,
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
                  lg: 3.75,
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
                  lg: 3.75,
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
            <iframe
              src={`${pdfBlobUrl}#navpanes=0`}
              sandbox="allow-same-origin allow-scripts allow-forms"
              style={{ width: "100%", height: "100%", border: 0 }}
              title="preview"
            />
          </div>
        </DialogContent>
      </Dialog>
      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        />
      )}
    </Grid>
  );
};

export default IslemlerCardHtml;
