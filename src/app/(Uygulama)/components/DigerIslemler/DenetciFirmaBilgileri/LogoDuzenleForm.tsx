"use client";

import {
  Box,
  Button,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { createLogo, getLogo } from "@/api/Denetci/Denetci";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";

const LogoDuzenleForm = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down("md"));

  const [firmaLogoImage, setFirmaLogoImage] = useState<string | null>(null);
  const tempBlobUrlRef = useRef<string | null>(null);

  const revokeBlobUrl = (value?: string | null) => {
    if (value && value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
  };

  const handleFirmaLogoImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      revokeBlobUrl(tempBlobUrlRef.current);
      tempBlobUrlRef.current = objectURL;
      setFirmaLogoImage(objectURL);

      const formData = new FormData();
      formData.append("logo", file);

      try {
        const success = await createLogo(user.denetciId || 0, formData);

        if (success) {
          enqueueSnackbar("Logo Yüklendi", {
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
        } else {
          setFirmaLogoImage(null);
          enqueueSnackbar("Logo Yüklenemedi", {
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
      } catch (err) {
        console.log("Logo yükleme hatası:", err);
      }
    }
  };

  const fetchData = async () => {
    try {
      const denetciLogo = await getLogo(user.denetciId);
      if (!denetciLogo.message) {
        // Sunucudan gelen base64 kalıcı içerik; blob URL değil.
        setFirmaLogoImage(denetciLogo.logoBase64);
        revokeBlobUrl(tempBlobUrlRef.current);
        tempBlobUrlRef.current = null;
      } else {
        enqueueSnackbar(denetciLogo && denetciLogo.message, {
          variant: "warning",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.warning.dark
                : theme.palette.warning.main,
          },
        });
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      revokeBlobUrl(tempBlobUrlRef.current);
      tempBlobUrlRef.current = null;
    };
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 6,
        }}
      >
        <Box bgcolor={"info.light"} textAlign="center">
          <CardContent
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "180px",
            }}
          >
            <Grid container justifyContent={"space-between"}>
              <Grid
                mb={mdDown ? 3 : 0}
                size={{
                  xs: 12,
                  md: 6,
                  lg: 6,
                }}
              >
                <Typography
                  variant="subtitle1"
                  height={"100%"}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={mdDown ? "center" : "start"}
                >
                  Firma Logosu Yükle
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 3,
                  lg: 3,
                }}
              >
                <input
                  accept=".png,.jpg,.jpeg"
                  style={{ display: "none" }}
                  id="upload-button2"
                  type="file"
                  onChange={handleFirmaLogoImageChange}
                />
                <label htmlFor="upload-button2">
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    component="span"
                  >
                    Logo Seç
                  </Button>
                </label>
              </Grid>
            </Grid>
          </CardContent>
        </Box>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 6,
        }}
      >
        <Box bgcolor={"info.light"} textAlign="center">
          <CardContent
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "180px",
            }}
          >
            <Grid container>
              <Grid
                mb={mdDown ? 3 : 0}
                size={{
                  xs: 4,
                  md: 4,
                  lg: 4,
                }}
              >
                <Typography
                  variant="subtitle1"
                  height={"100%"}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={mdDown ? "center" : "start"}
                >
                  Yüklenen Logo:
                </Typography>
              </Grid>
              <Grid
                display="flex"
                justifyContent="center"
                alignItems="center"
                size={{
                  xs: 8,
                  md: 8,
                  lg: 8,
                }}
              >
                {firmaLogoImage && (
                  <Box
                    sx={{
                      width: "174px",
                      height: "100px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={firmaLogoImage}
                      alt="Logo"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LogoDuzenleForm;
