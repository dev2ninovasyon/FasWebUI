"use client";

import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  IconButton,
  Divider,
  DialogActions,
  Button,
} from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import VadeliBankaMevduatiManuelSiniflama from "./VadeliBankaMevduatiManuelSiniflama";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX, IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import VadeliBankaMevduatiManuelSiniflamaOrnekFisler from "./VadeliBankaMevduatiManuelSiniflamaOrnekFisler";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const BCrumb = [
  {
    to: "/Hesaplamalar",
    title: "Hesaplamalar",
  },
  {
    to: "/Hesaplamalar/VadeliBankaMevduati",
    title: "Vadeli Banka Mevduatı",
  },
  {
    to: "/Hesaplamalar/VadeliBankaMevduati/VadeliBankaMevduatiManuelSiniflama",
    title: "Vadeli Banka Mevduatı Manuel Sınıflama",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [hasData, setHasData] = useState(false);
  const [warn, setWarn] = useState(true);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] = useState(false);
  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [json, setJson] = useState<any>();

  const handleDataCount = (count: number) => {
    if (count > 0) {
      setHasData(true);
    } else {
      setHasData(false);
    }
  };

  const handleSelectedRowsChange = (rows: any[]) => {
    setSelectedRows(rows);
    if (rows.length > 0) {
      setWarn(false);
    } else {
      setWarn(true);
    }
  };

  const handleJson = async () => {
    try {
      const keys = [
        "denetciId",
        "denetlenenId",
        "yil",
        "kebirKodu",
        "detayKodu",
        "hesapAdi",
        "borcTutari",
        "alacakTutari",
        "netBakiye",
        "paraBirimi",
      ];

      const jsonData = selectedRows.map((item: any[]) => {
        let obj: { [key: string]: any } = {};
        keys.forEach((key, index) => {
          if (key === "denetciId") {
            obj[key] = user.denetciId;
          } else if (key === "denetlenenId") {
            obj[key] = user.denetlenenId;
          } else if (key === "yil") {
            obj[key] = user.yil;
          } else {
            obj[key] = item[index - 1];
          }
        });
        return obj;
      });
      setJson(jsonData);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (floatingButtonTiklandimi) {
      handleJson();
    }
  }, [floatingButtonTiklandimi]);

  return (
    <PageContainer
      title="Vadeli Banka Mevduatı Manuel Sınıflama"
      description="this is Vadeli Banka Mevduatı Manuel Sınıflama"
    >
      <Breadcrumb
        title="Vadeli Banka Mevduatı Manuel Sınıflama"
        items={BCrumb}
      />
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
          <VadeliBankaMevduatiManuelSiniflama
            onDataCount={handleDataCount}
            onSelectedRowsChange={handleSelectedRowsChange}
          />
        </Grid>
        {hasData && (
          <FloatingButtonFisler
            warn={warn}
            handleClick={() => setFloatingButtonTiklandimi(true)}
          />
        )}
      </Grid>

      <Dialog
        open={floatingButtonTiklandimi}
        onClose={() => setFloatingButtonTiklandimi(false)}
        fullWidth
        maxWidth={false}
        fullScreen={isFullScreen}
        PaperProps={isFullScreen ? {} : { sx: { maxWidth: "98vw" } }}
      >
        <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" p={1}>
                Sizin için oluşturduğum fişleri kaydetmek ister misiniz?
              </Typography>
              <Typography variant="body1" p={1}>
                Sizin için oluşturduğum fiş kayıtlarının doğruluğunu mutlaka
                kontrol edin. Fişlerinizi kontrol etmeden kaydetmek, hatalı
                kayıtların oluşmasına yol açabilir. Unutmayın, bu alanda
                gerçekleştirdiğiniz işlemlerden kaynaklanan hatalı kayıtlar
                <strong> tamamen sizin sorumluluğunuzdadır</strong>.
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <IconButton
                size="small"
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                {isFullScreen ? (
                  <IconArrowsMinimize size="24" />
                ) : (
                  <IconArrowsMaximize size="24" />
                )}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setFloatingButtonTiklandimi(false)}
              >
                <IconX size="24" />
              </IconButton>
            </Box>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogContent>
          <VadeliBankaMevduatiManuelSiniflamaOrnekFisler
            json={json}
            kaydetTiklandimi={kaydetTiklandimi}
            setkaydetTiklandimi={setKaydetTiklandimi}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
          <Button
            variant="outlined"
            color="success"
            onClick={() => {
              setKaydetTiklandimi(true);
              setFloatingButtonTiklandimi(false);
            }}
            sx={{ width: "20%" }}
          >
            Evet, Kaydet
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setFloatingButtonTiklandimi(false)}
            sx={{ width: "20%" }}
          >
            Hayır, Vazgeç
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Page;
