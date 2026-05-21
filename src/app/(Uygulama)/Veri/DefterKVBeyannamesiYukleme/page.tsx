"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
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
import { createAuthorizedAxiosConfig } from "@/utils/authSession";

import axios, { AxiosProgressEvent } from "axios";
import { enqueueSnackbar } from "notistack";
import { kaydetDosyaYuklemeHatasi } from "@/api/Dosya/DosyaBilgileri";

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
  progress?: number;
}

interface ProgressInfo {
  fileName: string;
  uploadPercentage: number;
  processPercentage: number;
  percentage: number;
  status: string;
}

interface PendingUploadRow {
  fileName: string;
  status: string;
  durumMesaji?: string;
}

const MAX_FILES_PER_UPLOAD = 365;
const UPLOAD_WEIGHT = 0.35;
const PROCESS_WEIGHT = 0.65;
const OPTIMISTIC_UPLOAD_CAP = 90;
const DEFAULT_EDEFTER_UPLOAD_CONCURRENCY = 4;
const ENV_EDEFTER_UPLOAD_CONCURRENCY =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_EDEFTER_UPLOAD_CONCURRENCY?.trim()
    : undefined;

const parseUploadConcurrency = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_EDEFTER_UPLOAD_CONCURRENCY;
  return Math.max(1, Math.min(8, Math.trunc(parsed)));
};

const MAX_CONCURRENT_EDEFTER_UPLOADS = parseUploadConcurrency(
  ENV_EDEFTER_UPLOAD_CONCURRENCY
);

const clampPercent = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const sameFileName = (a?: string, b?: string) => {
  const left = (a || "").toLocaleLowerCase("tr-TR").trim();
  const right = (b || "").toLocaleLowerCase("tr-TR").trim();
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
};

const isFinalStatus = (status?: string) => {
  const normalized = normalizeStatus(status || "");
  return normalized.includes("tamamlandı") || normalized.includes("hata");
};

const calcCombinedProgress = (uploadPercentage: number, processPercentage: number, status?: string) => {
  if (isFinalStatus(status)) return 100;
  return clampPercent(uploadPercentage * UPLOAD_WEIGHT + processPercentage * PROCESS_WEIGHT);
};

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

const getUploadErrorMessage = (error: any) => {
  const data = error?.response?.data;
  const statusCode = error?.response?.status;
  const message =
    data?.message ??
    data?.Message ??
    data?.title ??
    data?.Title ??
    data?.error ??
    data?.Error ??
    error?.message;

  if (Array.isArray(data?.errors)) {
    const firstError = data.errors.find(Boolean);
    if (firstError) return String(firstError);
  }

  if (data?.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors)
      .flat()
      .find(Boolean);
    if (firstError) return String(firstError);
  }

  const rawMessage = String(message || "");
  if (/multipart body length limit/i.test(rawMessage) || /exceeded/i.test(rawMessage)) {
    const bytesMatch = rawMessage.match(/limit\s+(\d+)/i);
    const maxMb = bytesMatch ? Math.floor(Number(bytesMatch[1]) / 1024 / 1024) : null;
    return maxMb
      ? `Dosya boyutu sistem limitini aşıyor. Bu ekranda tek dosya için en fazla ${maxMb} MB yüklenebilir. Dosyayı küçültüp tekrar yükleyin.`
      : "Dosya boyutu sistem limitini aşıyor. Dosyayı küçültüp tekrar yükleyin.";
  }
  if (statusCode === 400) return message ? String(message) : "Dosya formatı veya içeriği beklenen yapıda değil.";
  if (statusCode === 401 || statusCode === 403) return "Oturum veya yetki sorunu oluştu. Sayfayı yenileyip tekrar deneyin.";
  if (statusCode === 413) return "Dosya boyutu sistem limitini aşıyor.";
  if (statusCode >= 500) return "Sunucu dosyayı işlerken hata oluştu. Dosya içeriği veya sistem logları kontrol edilmeli.";
  if (rawMessage.toLowerCase().includes("network")) return "Sunucuya ulaşılamadı. İnternet bağlantısı veya API erişimi kontrol edilmeli.";

  return message ? String(message) : "Dosya yüklenemedi. Dosya adı, uzantısı ve içeriği kontrol edilmeli.";
};

const runWithConcurrencyLimit = async <T,>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>
) => {
  let currentIndex = 0;
  const runnerCount = Math.max(1, Math.min(limit, items.length));

  const runners = Array.from({ length: runnerCount }, async () => {
    while (true) {
      const itemIndex = currentIndex++;
      if (itemIndex >= items.length) return;
      await worker(items[itemIndex], itemIndex);
    }
  });

  await Promise.all(runners);
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
  const [pendingUploadRows, setPendingUploadRows] = useState<PendingUploadRow[]>([]);
  const [trackedFileNames, setTrackedFileNames] = useState<string[]>([]);
  const pendingCompletionRef = useRef(false);
  const failedUploadRowsRef = useRef<Map<string, PendingUploadRow>>(new Map());
  const optimisticUploadTimersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const sortedProgressInfos = useMemo(
    () =>
      [...progressInfos].sort((a, b) => {
        const statusDiff = getStatusOrder(a.status) - getStatusOrder(b.status);
        if (statusDiff !== 0) return statusDiff;
        return a.fileName.localeCompare(b.fileName, "tr");
      }),
    [progressInfos]
  );
  const upsertPendingUploadRows = useCallback((fileNames: string[], status: string, durumMesaji?: string) => {
    if (!fileNames.length) return;

    setPendingUploadRows((prev) => {
      const map = new Map<string, PendingUploadRow>(prev.map((row) => [row.fileName, row]));
      for (const fileName of fileNames) {
        map.set(fileName, { fileName, status, durumMesaji });
      }
      return Array.from(map.values());
    });
  }, []);
  const recordUploadFailure = useCallback(
    async (fileName: string, error: any) => {
      const message = getUploadErrorMessage(error);
      const status = "Hata";
      const row = { fileName, status, durumMesaji: message };
      failedUploadRowsRef.current.set(fileName, row);
      upsertPendingUploadRows([fileName], status, message);
      setProgressInfos((prev) =>
        prev.map((info) =>
          info.fileName === fileName
            ? { ...info, status, processPercentage: 100, percentage: 100 }
            : info
        )
      );
      await kaydetDosyaYuklemeHatasi(
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        fileType,
        fileName,
        message
      );
      return status;
    },
    [fileType, upsertPendingUploadRows, user.denetciId, user.denetlenenId, user.yil]
  );
  const stopOptimisticUploadProgress = useCallback((fileNames?: string[]) => {
    const timers = optimisticUploadTimersRef.current;
    const namesToStop = fileNames && fileNames.length ? fileNames : Array.from(timers.keys());

    for (const fileName of namesToStop) {
      const timer = timers.get(fileName);
      if (timer) {
        clearInterval(timer);
        timers.delete(fileName);
      }
    }
  }, []);
  const startOptimisticUploadProgress = useCallback((fileNames: string[]) => {
    if (!fileNames.length) return;

    setProgressInfos((prev) =>
      prev.map((info) =>
        fileNames.includes(info.fileName) &&
        !isFinalStatus(info.status) &&
        normalizeStatus(info.status).includes("upload")
          ? {
            ...info,
            uploadPercentage: Math.max(info.uploadPercentage, 3),
            percentage: Math.max(
              info.percentage,
              calcCombinedProgress(
                Math.max(info.uploadPercentage, 3),
                info.processPercentage,
                "Upload Ediliyor..."
              )
            ),
          }
          : info
      )
    );

    for (const fileName of fileNames) {
      if (optimisticUploadTimersRef.current.has(fileName)) continue;

      const timer = setInterval(() => {
        setProgressInfos((prev) =>
          prev.map((info) => {
            if (info.fileName !== fileName) return info;
            if (isFinalStatus(info.status) || !normalizeStatus(info.status).includes("upload")) {
              return info;
            }

            const currentUpload = clampPercent(info.uploadPercentage);
            if (currentUpload >= OPTIMISTIC_UPLOAD_CAP) return info;

            const step = currentUpload < 20 ? 6 : currentUpload < 50 ? 4 : 2;
            const nextUpload = Math.min(
              OPTIMISTIC_UPLOAD_CAP,
              Math.max(currentUpload + step, 3)
            );

            return {
              ...info,
              uploadPercentage: nextUpload,
              percentage: Math.max(
                info.percentage,
                calcCombinedProgress(nextUpload, info.processPercentage, "Upload Ediliyor...")
              ),
            };
          })
        );
      }, 250);

      optimisticUploadTimersRef.current.set(fileName, timer);
    }
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (fetchedData) {
        enqueueSnackbar(
          "Paylaşım bağlantınız varken yükleme yapılmamaktadır bağlantıyı kaldırıp yüklemeyi deneyiniz.",
          { variant: "warning", autoHideDuration: 5000 }
        );
        return;
      }

      if (acceptedFiles.length > MAX_FILES_PER_UPLOAD) {
        enqueueSnackbar(
          `Tek seferde en fazla ${MAX_FILES_PER_UPLOAD} dosya seçebilirsiniz. İlk ${MAX_FILES_PER_UPLOAD} dosya işlenecek.`,
          { variant: "warning", autoHideDuration: 7000 }
        );
      }

      setUploading(true);
      setDosyaYuklendiMi(false);

      const validFiles: File[] = [];

      for (const file of acceptedFiles.slice(0, MAX_FILES_PER_UPLOAD)) {
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
      currentBatchNames.forEach((fileName) => failedUploadRowsRef.current.delete(fileName));
      setTrackedFileNames((prev) => Array.from(new Set([...prev, ...currentBatchNames])));
      upsertPendingUploadRows(currentBatchNames, "Upload Ediliyor...");

      setProgressInfos((prev) => {
        const map = new Map<string, ProgressInfo>(prev.map((x) => [x.fileName, x]));
        for (const name of currentBatchNames) {
          map.set(name, {
            fileName: name,
            uploadPercentage: 0,
            processPercentage: 0,
            percentage: 0,
            status: "Upload Ediliyor...",
          });
        }
        return Array.from(map.values());
      });

      try {
        if (fileType === "KurumlarBeyannamesi") {
          // Kurumlar Beyannamesi: her dosya için ayrı istek (API bu şekilde çalışıyor)
          const uploadPromises = validFiles.map(async (file) => {
            startOptimisticUploadProgress([file.name]);
            try {
              const res = await uploadAndParseKurumlarBeyannamesi(
                file,
                user.denetciId || 0,
                user.yil || 0,
                user.denetlenenId || 0,
                (percentage) => {
                  setProgressInfos((prev) =>
                    prev.map((info) =>
                      info.fileName === file.name
                        ? (() => {
                          const nextUpload = Math.max(info.uploadPercentage, clampPercent(percentage));
                          if (nextUpload < 100 && nextUpload < info.uploadPercentage + 2) return info;
                          return {
                            ...info,
                            status: "Upload Ediliyor...",
                            uploadPercentage: nextUpload,
                            percentage: Math.max(
                              info.percentage,
                              calcCombinedProgress(nextUpload, info.processPercentage, "Upload Ediliyor...")
                            ),
                          };
                        })()
                        : info
                    )
                  );
                }
              );
              if (res.success) {
                failedUploadRowsRef.current.delete(file.name);
                stopOptimisticUploadProgress([file.name]);
                upsertPendingUploadRows([file.name], "Tamamlandı");
                setProgressInfos((prev) => {
                  return prev.map((info) =>
                    info.fileName === file.name
                      ? {
                        ...info,
                        status: "Tamamlandı",
                        uploadPercentage: 100,
                        processPercentage: 100,
                        percentage: 100,
                      }
                      : info
                  );
                });
              } else {
                throw new Error(res.message);
              }
            } catch (error: any) {
              stopOptimisticUploadProgress([file.name]);
              const status = await recordUploadFailure(file.name, error);
              enqueueSnackbar(status, { variant: "error" });
            }
          });
          await Promise.all(uploadPromises);
          setDosyaYuklendiMi(true);
        } else {
          let hasUploadFailure = false;

          await runWithConcurrencyLimit(
            validFiles,
            MAX_CONCURRENT_EDEFTER_UPLOADS,
            async (file) => {
              const formData = new FormData();
              formData.append("files", file);

              setProgressInfos((prev) =>
                prev.map((info) =>
                  info.fileName === file.name
                    ? {
                      ...info,
                      status: "Upload Ediliyor...",
                      uploadPercentage: Math.max(info.uploadPercentage, 3),
                      percentage: Math.max(
                        info.percentage,
                        calcCombinedProgress(
                          Math.max(info.uploadPercentage, 3),
                          info.processPercentage,
                          "Upload Ediliyor..."
                        )
                      ),
                    }
                    : info
                )
              );
              startOptimisticUploadProgress([file.name]);

              try {
                await axios.post(
                  `${url}/Veri/DosyaBilgileriYukle?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&tip=${fileType}`,
                  formData,
                  createAuthorizedAxiosConfig({
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (event: AxiosProgressEvent) => {
                      const loaded = event.loaded || 0;
                      const total = event.total || file.size || 0;
                      const uploadPct = total
                        ? clampPercent((loaded / total) * 100)
                        : 1;

                      setProgressInfos((prev) =>
                        prev.map((info) =>
                          info.fileName === file.name
                            ? (() => {
                              if (uploadPct < 100 && uploadPct < info.uploadPercentage + 2) {
                                return info;
                              }

                              return {
                                ...info,
                                status: "Upload Ediliyor...",
                                uploadPercentage: Math.max(info.uploadPercentage, uploadPct),
                                percentage: Math.max(
                                  info.percentage,
                                  calcCombinedProgress(
                                    Math.max(info.uploadPercentage, uploadPct),
                                    info.processPercentage,
                                    "Upload Ediliyor..."
                                  )
                                ),
                              };
                            })()
                            : info
                        )
                      );
                    },
                  }, user.token)
                );

                failedUploadRowsRef.current.delete(file.name);
                stopOptimisticUploadProgress([file.name]);
                upsertPendingUploadRows([file.name], "Sıraya Alındı.");
                setProgressInfos((prev) =>
                  prev.map((info) =>
                    info.fileName === file.name
                      ? {
                        ...info,
                        status: "Sıraya Alındı.",
                        uploadPercentage: 100,
                        percentage: Math.max(
                          info.percentage,
                          calcCombinedProgress(100, info.processPercentage, "Sıraya Alındı.")
                        ),
                      }
                      : info
                  )
                );
              } catch (fileError: any) {
                hasUploadFailure = true;
                stopOptimisticUploadProgress([file.name]);
                await recordUploadFailure(file.name, fileError);
              }
            }
          );

          if (hasUploadFailure) {
            enqueueSnackbar("Bazı dosyalar yüklenemedi. Detayları listedeki durum alanından kontrol edin.", {
              variant: "warning",
            });
          } else {
            enqueueSnackbar("Dosyalar kuyruğa alındı. İşlem sırası geldiğinde otomatik işlenecek.", {
              variant: "info",
            });
          }
        }

        // Durum takibi DosyaTable bileşenindeki tek polling akışından yapılır.
        setControl(true);

      } catch (error: any) {
        stopOptimisticUploadProgress(currentBatchNames);
        await Promise.all(currentBatchNames.map((fileName) => recordUploadFailure(fileName, error)));
        console.log("Dosya yüklenirken hata oluştu:", error);
        enqueueSnackbar("İşlem sırasında bir hata oluştu.", { variant: "error" });
        setUploading(false);
      }
    },
    [
      fileType,
      fetchedData,
      recordUploadFailure,
      startOptimisticUploadProgress,
      stopOptimisticUploadProgress,
      upsertPendingUploadRows,
      user.denetciId,
      user.denetlenenId,
      user.token,
      user.yil,
    ]
  );
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    maxFiles: MAX_FILES_PER_UPLOAD,
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
          tip: baglantiBilgisi.tip || "",
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
      const failedRowsByName = new Map<string, PendingUploadRow>(failedUploadRowsRef.current);
      pendingUploadRows
        .filter((row) => isErrorStatus(row.status))
        .forEach((row) => failedRowsByName.set(row.fileName, row));
      const failedPendingRows = Array.from(failedRowsByName.values());
      const hasFailedRows = failedPendingRows.length > 0;

      setUploading(false);
      setTrackedFileNames([]);
      setPendingUploadRows(failedPendingRows);
      setProgressInfos((prev) => prev.filter((info) => isErrorStatus(info.status)));
      enqueueSnackbar(
        hasFailedRows
          ? "Bazı dosyalar yüklenemedi. Hatalı dosyalar listede tutuldu."
          : "Tüm dosyalar işlendi.",
        { variant: hasFailedRows ? "warning" : "success" }
      );
      pendingCompletionRef.current = false;
    }
  }, [dosyaYuklendiMi, pendingUploadRows, uploading]);

  useEffect(() => {
    if (!rows.length || !pendingUploadRows.length) return;

    const hasServerRow = (fileName: string) =>
      rows.some((row) => {
        if (row.id < 0) return false;
        const left = (row.adi || "").toLocaleLowerCase("tr-TR").trim();
        const right = (fileName || "").toLocaleLowerCase("tr-TR").trim();
        return left === right || left.includes(right) || right.includes(left);
      });

    setPendingUploadRows((prev) =>
      prev.filter((p) => !hasServerRow(p.fileName))
    );
  }, [rows, pendingUploadRows.length]);
  useEffect(() => {
    return () => {
      stopOptimisticUploadProgress();
    };
  }, [stopOptimisticUploadProgress]);

  const handleServerRowsChange = useCallback(
    (serverRows: DosyaType[]) => {
      if (!trackedFileNames.length) return;

      setProgressInfos((prev) =>
        prev.map((info) => {
          const row = serverRows.find((r) => sameFileName(r.adi, info.fileName));
          if (!row) return info;

          const nextStatus = row.durum || info.status;
          const nextProcess = isFinalStatus(nextStatus)
            ? 100
            : Math.max(info.processPercentage, clampPercent(row.progress));
          const nextUpload = Math.max(info.uploadPercentage, 100);
          const nextCombined = Math.max(
            info.percentage,
            calcCombinedProgress(nextUpload, nextProcess, nextStatus)
          );

          if (
            nextStatus === info.status &&
            nextProcess === info.processPercentage &&
            nextUpload === info.uploadPercentage &&
            nextCombined === info.percentage
          ) {
            return info;
          }

          return {
            ...info,
            status: nextStatus,
            uploadPercentage: nextUpload,
            processPercentage: nextProcess,
            percentage: nextCombined,
          };
        })
      );

      const allFinished = trackedFileNames.every((fileName) => {
        const row = serverRows.find((r) => sameFileName(r.adi, fileName));
        return row && isFinalStatus(row.durum);
      });

      if (allFinished) {
        setDosyaYuklendiMi(true);
      }
    },
    [trackedFileNames]
  );

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
                        <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
                          Limit: Tek seferde en fazla 365 dosya.
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
              pendingUploadRows={pendingUploadRows}
              onlyShowFinalizedRows={false}
              onServerRowsChange={handleServerRowsChange}
              openLogsFromStatusChip={true}
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
