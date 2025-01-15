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
  MenuItem,
  Stack,
  LinearProgress,
  useMediaQuery,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material/styles";
import { url } from "@/api/apiBase";
import DosyaTable from "@/app/(Uygulama)/components/Veri/DosyaTable";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/DefterYukleme",
    title: "Defter Yükleme",
  },
];

const Page: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [dosyaYuklendiMi, setDosyaYuklendiMi] = useState(true);
  const [progressInfos, setProgressInfos] = useState<any[]>([]);
  const user = useSelector((state: AppState) => state.userReducer);

  const theme = useTheme();
  const borderColor = theme.palette.divider;
  const borderRadius = theme.shape.borderRadius;
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [fileType, setFileType] = useState("E-DefterKebir");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileType(event.target.value);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      const _progressInfos = acceptedFiles.map((file) => ({
        fileName: file.name,
        percentage: 0,
      }));

      setProgressInfos(_progressInfos);

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
            onUploadProgress: (event) => {
              const progress = event.total
                ? Math.round((100 * event.loaded) / event.total)
                : 1;

              const updatedProgressInfos = _progressInfos.map((info) => {
                return {
                  ...info,
                  percentage: progress,
                };
              });
              setProgressInfos(updatedProgressInfos);
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
      [`application/${
        fileType === "E-DefterKebir" || fileType === "E-DefterYevmiye"
          ? "xml"
          : "pdf"
      }`]: [
        `.${
          fileType === "E-DefterKebir" || fileType === "E-DefterYevmiye"
            ? "xml"
            : "pdf"
        }`,
      ],
    },
  });

  return (
    <PageContainer title="Defter Yükleme" description="this is Defter Yükleme">
      <Breadcrumb title="Defter Yükleme" items={BCrumb} />

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
                labelId="defter"
                id="defter"
                size="small"
                value={fileType}
                onChange={handleChange}
                sx={{
                  height: "32px",
                  minWidth: "120px",
                  marginRight: "16px",
                }}
              >
                <MenuItem value={"E-DefterKebir"}>E-Defter Kebir</MenuItem>
                <MenuItem value={"E-DefterYevmiye"}>E-Defter Yevmiye</MenuItem>
                <MenuItem value={"KurumlarBeyannamesi"}>
                  Kurumlar Beyannamesi
                </MenuItem>
              </CustomSelect>
            </Stack>
            {fileType === "E-DefterKebir" && (
              <Stack direction={"column"} padding={"16px"}>
                <Typography variant="body2" marginY={"4px"}>
                  UYARI!
                </Typography>
                <Typography variant="body2" marginY={"4px"}>
                  1- Örnek Dosya Adı &quot;1716152123-202001-K-000000.xml&quot;
                  Şeklinde Olan, Sadece &quot;K&quot; Harfini İçeren
                  &quot;.xml&quot; Uzantılı EDefter Kebir Dosyalarını
                  Yükleyiniz.
                </Typography>
                <Typography variant="body2" marginY={"4px"}>
                  2- Aynı İsimde Dosya Yüklenmesi Durumunda Son Yüklenen Dosya
                  Geçerli Olacaktır.
                </Typography>
              </Stack>
            )}

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
                mt: 3,
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
                      <Stack
                        spacing={2}
                        padding={"16px"}
                        flexWrap={"nowrap"}
                        overflow={"auto"} // Taşmayı önler ve gerektiğinde scroll çıkarır
                        maxHeight={"240px"} // Dikey sınır, gerekirse değiştirebilirsiniz
                      >
                        {progressInfos.map((info, index) => (
                          <Box key={index}>
                            <Typography>{info.fileName}</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={info.percentage}
                            />
                            <Typography>{info.percentage}%</Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <>
                        <Typography variant="h6" mb={3}>
                          Dosyayı buraya sürükleyin veya tıklayıp seçin.
                        </Typography>
                        <Typography variant="body2">
                          Sadece{" "}
                          {fileType === "E-DefterKebir" ||
                          fileType === "E-DefterYevmiye"
                            ? "XML "
                            : "PDF "}
                          dosyası yükleyebilirsiniz.
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              )}
            </Box>
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
