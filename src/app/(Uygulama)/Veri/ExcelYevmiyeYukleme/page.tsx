"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Stack,
  MenuItem,
  useTheme,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import DosyaTable from "@/app/(Uygulama)/components/Veri/DosyaTable";
import { IconDownload } from "@tabler/icons-react";
import { url } from "@/api/apiBase";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/ExcelYevmiyeYukleme",
    title: "Excel Yevmiye Yükleme",
  },
];

const Page: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [dosyaYuklendiMi, setDosyaYuklendiMi] = useState(true);

  const user = useSelector((state: AppState) => state.userReducer);

  const theme = useTheme();
  const borderColor = theme.palette.divider;
  const borderRadius = theme.shape.borderRadius;
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [fileType, setFileType] = React.useState("ExcelYevmiye");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileType(event.target.value);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);

      try {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
          formData.append("files", file);
        });

        setDosyaYuklendiMi(false);
        const response = await axios.post(
          `${url}/Veri/DosyaBilgileriYukle?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&tip=${fileType}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status >= 200 && response.status < 300) {
          setDosyaYuklendiMi(true);
        }
      } catch (error: any) {
        console.error("Dosya yüklenirken hata oluştu:", error);
      } finally {
        setUploading(false);
      }
    },
    [user.denetciId, user.yil, user.denetlenenId, fileType]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/docx": [".xlsx"],
    },
  });

  return (
    <PageContainer
      title="Excel Yevmiye Veri Yükleme"
      description="this is Excel Yevmiye Veri Yükleme"
    >
      <Breadcrumb title="Excel Yevmiye Veri Yükleme" items={BCrumb} />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Box
            sx={{
              height: "550px",
              border: `1px solid ${borderColor}`,
              borderRadius: `${borderRadius}/5`,
            }}
          >
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="h5" padding={"16px"}>
                Dosya Yükle
              </Typography>
              <CustomSelect
                labelId="excel"
                id="excel"
                size="small"
                value={fileType}
                onChange={handleChange}
                sx={{
                  height: "32px",
                  minWidth: "120px",
                  marginRight: "16px",
                  //color: "#5D87FF",
                }}
              >
                <MenuItem value={"ExcelYevmiye"}>Excel Yevmiye</MenuItem>
              </CustomSelect>
            </Stack>
            <Box
              {...getRootProps()}
              sx={{
                border: `2px dashed ${borderColor}`,
                borderRadius: `${borderRadius}/5`,
                padding: "20px",
                margin: "16px",
                textAlign: "center",
                cursor: "pointer",
                height: "285px",
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Grid
                  container
                  style={{ height: "100%" }}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Grid item sm={12} lg={12} style={{ textAlign: "center" }}>
                    <Typography>Dosyaları buraya bırakın...</Typography>
                  </Grid>
                </Grid>
              ) : (
                <Grid
                  container
                  style={{ height: "100%" }}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Grid item sm={12} lg={12} style={{ textAlign: "center" }}>
                    {uploading ? (
                      <Typography>Yükleniyor...</Typography>
                    ) : (
                      <>
                        <Typography variant="h6" mb={3}>
                          Dosyayı buraya sürükleyin veya tıklayıp seçin.
                        </Typography>
                        <Typography variant="body2">
                          Sadece EXCEL dosyası yükleyebilirsiniz.
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              )}
            </Box>
            <Stack direction={"row"} justifyContent={"end"} padding={"16px"}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<IconDownload width={18} />}
              >
                Format İndir
              </Button>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Box
            sx={{
              height: smDown ? "610px" : "550px",
              border: `1px solid ${borderColor}`,
              borderRadius: `${borderRadius}/5`,
            }}
          >
            <DosyaTable
              fileType={fileType}
              dosyaYuklendiMi={dosyaYuklendiMi}
              setDosyaYuklendiMi={(deger) => setDosyaYuklendiMi(deger)}
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
