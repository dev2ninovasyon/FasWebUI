"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DosyaTable from "@/app/(Uygulama)/components/Veri/DosyaTable";
import { useDropzone } from "react-dropzone";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import axios from "axios";
import {
  getCariDosya,
  getSurekliDosya,
} from "@/api/MaddiDogrulama/MaddiDogrulama";

const BCrumb = [
  {
    to: "/MusteriBelgeleri",
    title: "Müşteri Belgeleri",
  },
];

interface DosyaType {
  id: number;
  adi: string;
  olusturulmaTarihi: string;
  durum: string;
}

interface Veri {
  id: number;
  parentId?: number;
  name: string;
  bds?: string;
  code?: string;
  url?: string;
  reference?: string;
  archiveFileName?: string;
  children: Veri[];
}

const Page = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);

  const theme = useTheme();
  const borderColor = theme.palette.divider;
  const borderRadius = theme.shape.borderRadius;

  const [fetchedData, setFetchedData2] = useState<Veri[] | null>(null);

  const [fileType, setFileType] = useState("CariDosya");
  const [fileType2, setFileType2] = useState("-");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileType(event.target.value);
  };

  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileType2(event.target.value);
  };

  const [rows, setRows] = useState<DosyaType[]>([]);

  const [uploading, setUploading] = useState(false);
  const [dosyaYuklendiMi, setDosyaYuklendiMi] = useState(true);
  const [progressInfos, setProgressInfos] = useState<any[]>([]);

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
        const response = await axios.post(``, formData, {
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
        });
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
    accept: { "*/*": [] },
  });

  const fetchData = async () => {
    try {
      if (fileType === "CariDosya") {
        const data = await getCariDosya(
          user.token || "",
          user.denetimTuru || ""
        );
        setFetchedData2(data);
      }
      if (fileType === "SürekliDosya") {
        const data = await getSurekliDosya(
          user.token || "",
          user.denetimTuru || ""
        );
        setFetchedData2(data);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    setFileType2("-");
    fetchData();
  }, [fileType]);
  return (
    <PageContainer
      title="Müşteri Belgeleri"
      description="this is Müşteri Belgeleri"
    >
      <Breadcrumb title="Müşteri Belgeleri" items={BCrumb} />
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
                <MenuItem value={"CariDosya"}>Cari Dosya</MenuItem>
                <MenuItem value={"SürekliDosya"}>Sürekli Dosya</MenuItem>
                <MenuItem value={"ToplantıTutanakları"}>
                  Toplantı Tutanakları
                </MenuItem>
              </CustomSelect>
            </Stack>
            {fileType === "CariDosya" && (
              <Grid container mt={1} padding={"16px"}>
                <Grid item xs={12} lg={12}>
                  <CustomSelect
                    labelId="cariDosya"
                    id="cariDosya"
                    size="small"
                    value={fileType2}
                    fullWidth
                    onChange={handleChange2}
                    sx={{
                      height: "32px",
                      minWidth: "120px",
                    }}
                  >
                    <MenuItem value={"-"}>
                      Yüklemek istediğiniz dosya türünü seçiniz
                    </MenuItem>
                    {fetchedData &&
                      fetchedData.map((item: Veri) => (
                        <MenuItem key={item.id} value={item.name}>
                          {item.archiveFileName}
                          {item.reference} {item.name}
                        </MenuItem>
                      ))}
                  </CustomSelect>
                </Grid>
              </Grid>
            )}
            {fileType === "SürekliDosya" && (
              <Grid container mt={1} padding={"16px"}>
                <Grid item xs={12} lg={12}>
                  <CustomSelect
                    labelId="surekliDosya"
                    id="surekliDosya"
                    size="small"
                    value={fileType2}
                    fullWidth
                    onChange={handleChange2}
                    sx={{
                      height: "32px",
                      minWidth: "120px",
                    }}
                  >
                    <MenuItem value={"-"}>
                      Yüklemek istediğiniz dosya türünü seçiniz
                    </MenuItem>
                    {fetchedData &&
                      fetchedData.map((item: Veri) => (
                        <MenuItem key={item.id} value={item.name}>
                          {item.archiveFileName}
                          {item.reference} {item.name}
                        </MenuItem>
                      ))}
                  </CustomSelect>
                </Grid>
              </Grid>
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
                pointerEvents: "visible",
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
                          Tek seferde maximum 200 adet dosya yükleyebilirsiniz.
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
              rows={rows}
              fetchedData={null}
              fileType={fileType}
              dosyaYuklendiMi={dosyaYuklendiMi}
              setDosyaYuklendiMi={(deger) => setDosyaYuklendiMi(deger)}
              setRows={setRows}
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
