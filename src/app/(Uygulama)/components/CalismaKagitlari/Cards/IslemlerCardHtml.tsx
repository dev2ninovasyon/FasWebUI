"use client";

import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Button, Dialog, DialogContent, Grid , useTheme} from "@mui/material";
import { IconFileTypeDocx, IconFileTypePdf } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import axios from "axios";
import { useSelector } from "@/store/hooks";
import { url } from "@/api/apiBase";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import { enqueueSnackbar } from "notistack";
interface Props {
  controller: string;
  buildHtmlAsync?: () => Promise<string>; // 🔑
  previewEndpoint?: string;               // opsiyonel override
}

const IslemlerCardHtml: React.FC<Props> = ({ controller, buildHtmlAsync, previewEndpoint }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [isOpen, setIsOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [openCartAlert, setOpenCartAlert] = useState(false);
 const customizer = useSelector((state: AppState) => state.customizer);
   const theme = useTheme();
  const handleDownload = async () => {
    try {
       setOpenCartAlert(true);
      if (!buildHtmlAsync) {
        alert("Önizleme için HTML üretici (buildHtmlAsync) bulunamadı.");
        return;
      }
       const endpoint =`${url}/ArsivIslemleri/WordDosyasiIndirHtml`;
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
          save: true, // arşive kaydet
        },
        {
          baseURL: url,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || ""}`,
          },
          responseType: "blob",
        }
      );
      const urlFile = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlFile;
      link.setAttribute("download", `${controller}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("İndirme hatası:", error);
             enqueueSnackbar("İndirme sırasında hata oluştu..", {
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

  // 🔸 Önizleme: HTML'i (PNG gömülü) üret → gönder → PDF blob aç
  const handlePreview = async () => {
    try {
      setOpenCartAlert(true);
      if (!buildHtmlAsync) {
        alert("Önizleme için HTML üretici (buildHtmlAsync) bulunamadı.");
        return;
      }

      const html = await buildHtmlAsync();
      const endpoint =`${url}/ArsivIslemleri/PreviewFromHtml`;

      const response = await axios.post(
        endpoint,
        {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
          title: controller,
          modelAdi: controller,
          html,
          save: true, // arşive kaydet
        },
        {
          baseURL: url,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || ""}`,
          },
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(pdfUrl);
      setIsOpen(true);
    } catch (error: any) {
      console.error("Önizleme/Export hatası:", error?.response || error);
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

  return (
    <Grid container>
      <Grid item xs={12} lg={12}>
        <Card sx={{ width: "100%", bgcolor: "primary.light" }}>
          <CardContent sx={{ bgcolor: "primary.light" }}>
            <Grid container sx={{ width: "100%", margin: "0 auto", justifyContent: "space-between", gap: 1 }}>
              <Grid item xs={12} lg={5.75} sx={{ display: "flex", justifyContent: "center" }}>
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

              <Grid item xs={12} lg={5.75} sx={{ display: "flex", justifyContent: "center" }}>
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
            </Grid>
          </CardContent>
        </Card>
      </Grid>

<Dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  fullWidth
  maxWidth="xl"
  // scroll="paper" // (default) kalsın; body yerine dialog kâğıdı scroll olur
>
  <DialogContent sx={{ p: 0, overflow: "hidden" }}>
    <div style={{ width: "100%", height: "80vh", overflow: "hidden" }}>
      <iframe
        src={`${pdfBlobUrl}#navpanes=0`} // yan paneli kapat
        style={{ width: "100%", height: "100%", border: 0 }}
        title="preview"
      />
    </div>
  </DialogContent>
</Dialog>


      {openCartAlert && (
        <InfoAlertCart openCartAlert={openCartAlert} setOpenCartAlert={setOpenCartAlert} />
      )}
    </Grid>
  );
};

export default IslemlerCardHtml;
