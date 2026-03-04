"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  MenuItem,
  Stack,
  LinearProgress,
  useMediaQuery,
  Paper,
  Button,
  useTheme,
} from "@mui/material";
import DosyaTable from "@/app/(Uygulama)/components/Veri/DosyaTable";
import { uploadAndParseKurumlarBeyannamesi } from "@/api/Musteri/MusteriIslemleri";
import { getBaglantiBilgileriByTip } from "@/api/BaglantiBilgileri/BaglantiBilgileri";
import { useDropzone } from "react-dropzone";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import VeriPaylasimBaglantisiPopUp from "@/app/(Uygulama)/components/PopUp/VeriPaylasimBaglantisiPopUp";
import { url } from "@/api/apiBase";

import axios from "axios";
import { enqueueSnackbar } from "notistack";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/DefterKVBeyannamesiYukleme",
    title: "Defter / K. V. Beyannamesi Yükleme",
  },
];

const months = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

interface DosyaType {
  id: number;
  adi: string;
  olusturulmaTarihi: string;
  durum: string;
}

interface ProgressInfo {
  fileName: string;
  percentage: number;
  status: string;
}

interface PendingUploadRow {
  fileName: string;
  status: string;
}

const normalizeStatus = (status: string) =>
  (status || "").toLocaleLowerCase("tr-TR");

const isCompletedStatus = (status: string) =>
  normalizeStatus(status).includes("tamamlandı");

const isProcessingStatus = (status: string) =>
  normalizeStatus(status).includes("işleniyor") ||
  normalizeStatus(status).includes("isleniyor");

const isQueueStatus = (status: string) =>
  normalizeStatus(status).includes("sıraya alındı") ||
  normalizeStatus(status).includes("siraya alindi") ||
  normalizeStatus(status).startsWith("sırada") ||
  normalizeStatus(status).startsWith("sirada");

const isErrorStatus = (status: string) =>
  normalizeStatus(status).includes("hata");

const getStatusOrder = (status: string) => {
  if (isProcessingStatus(status)) return 1;
  if (normalizeStatus(status).includes("yükleniyor")) return 2;
  if (isQueueStatus(status)) return 3;
  if (isErrorStatus(status)) return 4;
  if (isCompletedStatus(status)) return 5;
  return 6;
};

interface Veri {
  id: number;
  link: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  tip: string;
}

const Page: React.FC = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);

  const theme = useTheme();
  const borderColor = theme.palette.divider;
  const borderRadius = theme.shape.borderRadius;

  const [control, setControl] = useState(false);

  const [fetchedData, setFetchedData] = useState<Veri | null>(null);

  const [fileType, setFileType] = useState("E-DefterKebir");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileType(event.target.value);
  };

  const [rows, setRows] = useState<DosyaType[]>([]);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
    setControl(true);
  };

  const [uploading, setUploading] = useState(false);
  const [dosyaYuklendiMi, setDosyaYuklendiMi] = useState(true);
  const [progressInfos, setProgressInfos] = useState<ProgressInfo[]>([]);
  const [uploadLogsByFile, setUploadLogsByFile] = useState<Record<string, string[]>>({});
  const [pendingUploadRows, setPendingUploadRows] = useState<PendingUploadRow[]>([]);
  const [trackedFileNames, setTrackedFileNames] = useState<string[]>([]);
  const pendingCompletionRef = useRef(false);
  const sortedProgressInfos = useMemo(
    () =>
      [...progressInfos].sort((a, b) => {
        const statusDiff = getStatusOrder(a.status) - getStatusOrder(b.status);
        if (statusDiff !== 0) return statusDiff;
        return a.fileName.localeCompare(b.fileName, "tr");
      }),
    [progressInfos]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const appendLog = (fileName: string, message: string) => {
        const timestamp = new Date().toLocaleTimeString("tr-TR");
        const line = `[${timestamp}] ${message}`;
        setUploadLogsByFile((prev) => ({
          ...prev,
          [fileName]: [...(prev[fileName] || []), line],
        }));
      };

      if (fetchedData) {
        enqueueSnackbar(
          "Paylaşım bağlantınız varken yükleme yapılmamaktadır bağlantıyı kaldırıp yüklemeyi deneyiniz.",
          { variant: "warning", autoHideDuration: 5000 }
        );
        return;
      }

      setUploading(true);
      setDosyaYuklendiMi(false);

      const validFiles: File[] = [];

      for (const file of acceptedFiles) {
        if (
          file.name.endsWith(".xml") ||
          file.name.endsWith(".XML") ||
          fileType === "E-DefterKebir" ||
          fileType === "E-DefterYevmiye"
        ) {
          // Vergi no kontrolü kaldırıldı: uygun tipteki dosyalar doğrudan yükleme listesine alınır.
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      const currentBatchNames = validFiles.map((file) => file.name);
      const allTrackedNames = Array.from(new Set([...trackedFileNames, ...currentBatchNames]));
      setTrackedFileNames(allTrackedNames);
      setPendingUploadRows((prev) => {
        const map = new Map<string, PendingUploadRow>(prev.map((p) => [p.fileName, p]));
        currentBatchNames.forEach((fileName) => {
          map.set(fileName, { fileName, status: "İşleniyor..." });
        });
        return Array.from(map.values());
      });
      setUploadLogsByFile((prev) => {
        const next = { ...prev };
        for (const file of validFiles) {
          next[file.name] = [
            ...(prev[file.name] || []),
            `[${new Date().toLocaleTimeString("tr-TR")}] Yükleme başlatıldı. Tür: ${fileType}`,
            `[${new Date().toLocaleTimeString("tr-TR")}] Dosya adı: ${file.name}, Boyut: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
          ];
        }
        return next;
      });

      setProgressInfos((prev) => {
        const map = new Map<string, ProgressInfo>(prev.map((x) => [x.fileName, x]));
        for (const name of currentBatchNames) {
          map.set(name, { fileName: name, percentage: 0, status: "Yükleniyor..." });
        }
        return Array.from(map.values());
      });

      try {
        if (fileType === "KurumlarBeyannamesi") {
          // Kurumlar Beyannamesi: her dosya için ayrı istek (API bu şekilde çalışıyor)
          const uploadPromises = validFiles.map(async (file) => {
            let lastLoggedPercentage = 0;
            try {
              appendLog(file.name, "Sunucuya gönderim başladı.");
              const res = await uploadAndParseKurumlarBeyannamesi(
                file,
                user.denetciId || 0,
                user.yil || 0,
                user.denetlenenId || 0,
                (percentage) => {
                  if (percentage >= lastLoggedPercentage + 10 || percentage === 100) {
                    lastLoggedPercentage = percentage;
                    appendLog(file.name, `Yükleme ilerlemesi: %${percentage}`);
                  }
                  setProgressInfos((prev) =>
                    prev.map((info) =>
                      info.fileName === file.name
                        ? {
                          ...info,
                          status: "Yükleniyor...",
                          percentage: Math.max(info.percentage, Math.min(95, percentage)),
                        }
                        : info
                    )
                  );
                }
              );
              if (res.success) {
                setPendingUploadRows((prev) =>
                  prev.map((p) =>
                    p.fileName === file.name ? { ...p, status: "Tamamlandı" } : p
                  )
                );
                appendLog(file.name, "Sunucu yanıtı alındı, parse işlemi başarılı.");
                setProgressInfos((prev) => {
                  return prev.map((info) =>
                    info.fileName === file.name
                      ? { ...info, status: "Tamamlandı", percentage: 100 }
                      : info
                  );
                });
              } else {
                setPendingUploadRows((prev) =>
                  prev.map((p) =>
                    p.fileName === file.name ? { ...p, status: "Hata Oluştu" } : p
                  )
                );
                appendLog(file.name, `Hata: ${res.message || "Bilinmeyen hata"}`);
                throw new Error(res.message);
              }
            } catch (error: any) {
              setPendingUploadRows((prev) =>
                prev.map((p) =>
                  p.fileName === file.name ? { ...p, status: "Hata Oluştu" } : p
                )
              );
              appendLog(file.name, `İşlem başarısız: ${error?.message || "Bilinmeyen hata"}`);
              setProgressInfos((prev) => {
                return prev.map((info) =>
                  info.fileName === file.name
                    ? { ...info, status: "Hata!", percentage: 0 }
                    : info
                );
              });
              enqueueSnackbar(error.message || "Bilinmeyen bir hata oluştu.", { variant: "error" });
            }
          });
          await Promise.all(uploadPromises);
        } else {
          // RAM & Bağlantı Optimizasyonu: TÜM dosyaları tek FormData'ya ekleyip TEK HTTP isteği ile gönder.
          // Önceden her dosya için ayrı istek açılıyordu (12 dosya × 5 kullanıcı = 60 bağlantı).
          const formData = new FormData();
          validFiles.forEach((file) => formData.append("files", file));
          validFiles.forEach((file) => appendLog(file.name, "Toplu yükleme paketine eklendi."));

          await axios.post(
            `${url}/Veri/DosyaBilgileriYukle?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&tip=${fileType}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (event) => {
                const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 1;
                if (progress % 10 === 0 || progress === 100) {
                  currentBatchNames.forEach((fileName) =>
                    appendLog(fileName, `Toplu gönderim ilerlemesi: %${progress}`)
                  );
                }
                setProgressInfos((prev) =>
                  prev.map((info) =>
                    currentBatchNames.includes(info.fileName)
                      ? { ...info, percentage: Math.round(progress * 0.2), status: "Yükleniyor..." }
                      : info
                  )
                );
              },
            }
          );

          // Yükleme tamamlandı — tüm dosyalar kuyruğa alındı
          setProgressInfos((prev) =>
            prev.map((info) =>
              currentBatchNames.includes(info.fileName)
                ? { ...info, status: "Sıraya Alındı.", percentage: 20 }
                : info
            )
          );
          setPendingUploadRows((prev) =>
            prev.map((p) =>
              currentBatchNames.includes(p.fileName)
                ? { ...p, status: "İşleniyor..." }
                : p
            )
          );
          currentBatchNames.forEach((fileName) =>
            appendLog(fileName, "Yükleme tamamlandı, dosya kuyruğa alındı.")
          );
          enqueueSnackbar("Dosyalar kuyruğa alındı. İşlem sırası geldiğinde otomatik işlenecek.", { variant: "info" });
        }

        if (fileType === "KurumlarBeyannamesi") {
          setUploading(false);
          setDosyaYuklendiMi(true);
          setControl(true);
          return;
        }

        // Durum takibi DosyaTable bileşenindeki tek polling akışından yapılır.
        setControl(true);

      } catch (error: any) {
        console.log("Dosya yüklenirken hata oluştu:", error);
        enqueueSnackbar("İşlem sırasında bir hata oluştu.", { variant: "error" });
        setUploading(false);
      }
    },
    [user.denetciId, user.yil, user.denetlenenId, fileType, fetchedData, trackedFileNames]
  );
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      [`application/${fileType === "E-DefterKebir" || fileType === "E-DefterYevmiye"
        ? "xml"
        : "pdf"
        }`]: [
          `.${fileType === "E-DefterKebir" || fileType === "E-DefterYevmiye"
            ? "xml"
            : "pdf"
          }`,
        ],
    },
  });

  const handleDropzoneClick = () => {
    if (fetchedData) {
      enqueueSnackbar(
        "Paylaşım bağlantınız varken yükleme yapılmamaktadır bağlantıyı kaldırıp yüklemeyi deneyiniz.",
        { variant: "warning", autoHideDuration: 5000 }
      );
    } else {
      open();
    }
  };

  const fetchData = async () => {
    try {
      const baglantiBilgisi = await getBaglantiBilgileriByTip(
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.id || 0,
        user.yil || 0,
        "DefterKVBeyannamesi"
      );
      if (baglantiBilgisi && baglantiBilgisi.id) {
        // Tarihleri "DD.MM.YYYY HH:mm" formatında ayarla
        const formatDateTime = (dateTimeStr?: string) => {
          if (!dateTimeStr) return "";
          const date = new Date(dateTimeStr);
          const pad = (n: number) => n.toString().padStart(2, "0");
          return `${pad(date.getDate())}.${pad(
            date.getMonth() + 1
          )}.${date.getFullYear()} ${pad(date.getHours())}:${pad(
            date.getMinutes()
          )}`;
        };

        const newRow: Veri = {
          id: baglantiBilgisi.id,
          link: baglantiBilgisi.link,
          baslangicTarihi: formatDateTime(baglantiBilgisi.baslangicTarihi),
          bitisTarihi: formatDateTime(baglantiBilgisi.bitisTarihi),
          tip: baglantiBilgisi.tip,
        };
        setFetchedData(newRow);
      } else {
        setFetchedData(null);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (control) {
      fetchData();
      setControl(false);
    }
  }, [control]);

  useEffect(() => {
    if (!uploading) return;

    if (!dosyaYuklendiMi) {
      pendingCompletionRef.current = true;
      return;
    }

    if (pendingCompletionRef.current) {
      setUploading(false);
      setTrackedFileNames([]);
      enqueueSnackbar("Tüm dosyalar işlendi.", { variant: "success" });
      pendingCompletionRef.current = false;
    }
  }, [dosyaYuklendiMi, uploading]);

  useEffect(() => {
    if (!rows.length || !pendingUploadRows.length) return;

    const hasServerRow = (fileName: string) =>
      rows.some((row) => {
        const left = (row.adi || "").toLocaleLowerCase("tr-TR").trim();
        const right = (fileName || "").toLocaleLowerCase("tr-TR").trim();
        return left === right || left.includes(right) || right.includes(left);
      });

    setPendingUploadRows((prev) =>
      prev.filter((p) => !hasServerRow(p.fileName))
    );
  }, [rows, pendingUploadRows.length]);

  return (
    <PageContainer
      title="Defter / K. V. Beyannamesi Yükleme"
      description="this is Defter / K. V. Beyannamesi Yükleme"
    >
      <Breadcrumb title="Defter / K. V. Beyannamesi Yükleme" items={BCrumb}>
        <>
          <Grid
            container
            sx={{
              width: "95%",
              height: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
              size={{
                xs: 12,
                md: 12,
                lg: 12
              }}>
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                onClick={() => {
                  setIsPopUpOpen(true);
                }}
                sx={{ width: "100%", height: { lg: "54px", md: "54px" } }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  }}
                >
                  Paylaşım Bağlantısı
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </>
      </Breadcrumb>
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            lg: 5
          }}>
          <Box
            sx={{
              height: "550px",
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${borderColor}`,
              borderRadius: `${borderRadius}/5`,
              overflow: "hidden",
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
                  K. V. Beyannamesi
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
                  &quot;.xml&quot; Uzantılı E-Defter Kebir Dosyalarını
                  Yükleyiniz.
                </Typography>
                <Typography variant="body2" marginY={"4px"}>
                  2- Aynı İsimde Dosya Yüklenmesi Durumunda Son Yüklenen Dosya
                  Geçerli Olacaktır.
                </Typography>
              </Stack>
            )}
            <Box
              {...getRootProps({ onClick: handleDropzoneClick })}
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
                  <Grid
                    style={{ textAlign: "center" }}
                    size={{
                      sm: 12,
                      lg: 12
                    }}>
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
                  <Grid
                    style={{ textAlign: "center" }}
                    size={{
                      sm: 12,
                      lg: 12
                    }}>
                    {uploading ? (
                      <Stack
                        spacing={2}
                        padding={"16px"}
                        flexWrap={"nowrap"}
                        overflow={"auto"} // Taşmayı önler ve gerektiğinde scroll çıkarır
                        maxHeight={"240px"} // Dikey sınır, gerekirse değiştirebilirsiniz
                      >
                        {sortedProgressInfos.map((info, index) => (
                          <Box key={index} sx={{ mb: 2, textAlign: "left" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                                {info.fileName}
                              </Typography>
                              <Typography variant="caption" sx={{
                                fontWeight: 700,
                                color: info.status === "Tamamlandı" ? "success.main" :
                                  info.status === "Hata!" || info.status === "Hata Oluştu" ? "error.main" :
                                    "primary.main"
                              }}>
                                {info.status}
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={info.percentage}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: theme.palette.grey[200],
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 5,
                                  backgroundColor: info.status === "Tamamlandı" ? "success.main" :
                                    info.status === "Hata!" || info.status === "Hata Oluştu" ? "error.main" :
                                      "primary.main",
                                }
                              }}
                            />
                            <Typography variant="caption" sx={{ display: "block", textAlign: "right", mt: 0.5, color: "text.secondary" }}>
                              %{info.percentage}
                            </Typography>
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
          </Box >
        </Grid >
        <Grid
          size={{
            xs: 12,
            lg: 7
          }}>
          <Box
            sx={{
              height: smDown ? "610px" : "550px",
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${borderColor}`,
              borderRadius: `${borderRadius}/5`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <DosyaTable
              rows={rows}
              fetchedData={fetchedData}
              fileType={fileType}
              dosyaYuklendiMi={dosyaYuklendiMi}
              setDosyaYuklendiMi={(deger) => setDosyaYuklendiMi(deger)}
              setRows={setRows}
              uploadLogsByFile={uploadLogsByFile}
              pendingUploadRows={pendingUploadRows}
            />
          </Box>
        </Grid>
        {
          fileType === "E-DefterKebir" && (
            <Grid
              size={{
                xs: 12,
                lg: 12
              }}>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 12,
                    lg: 12
                  }}>
                  <Typography variant="h6" textAlign="left" mb={1}>
                    Yüklenen Defter Sayıları:
                  </Typography>
                </Grid>
                {months.map((month, index) => {
                  const monthPart = (index + 1).toString().padStart(2, "0");
                  const count = rows.filter(
                    (item: DosyaType) =>
                      item.adi.split("-")[1]?.slice(-2) === monthPart &&
                      item.durum === "Tamamlandı"
                  ).length;

                  return (
                    <Grid
                      key={index}
                      size={{
                        xs: 6,
                        md: 3,
                        lg: 2
                      }}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: "warning.light",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: "warning.dark" }}
                          textAlign={"center"}
                        >
                          {month}: {count}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          )
        }
        {
          isPopUpOpen && (
            <VeriPaylasimBaglantisiPopUp
              setControl={setControl}
              isPopUpOpen={isPopUpOpen}
              handleClosePopUp={handleClosePopUp}
            ></VeriPaylasimBaglantisiPopUp>
          )
        }
      </Grid >
    </PageContainer >
  );
};

export default Page;
