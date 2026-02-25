import { Grid, Button, MenuItem, useTheme, Box, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Alert } from "@mui/material";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  createDenetlenen,
  getDenetlenenByDenetciId,
  getDenetlenenKonsolideAnaSirketByDenetciId,
  getSektorKodlari,
  uploadAndParseKurumlarBeyannamesi,
  importDenetlenen,
  startImportFromOldJob,
  getImportJobStatus,
  getImportJobNotifications,
  getImportFromOldTransferTables,
} from "@/api/Musteri/MusteriIslemleri";
import { getDenetciOdemeBilgileri } from "@/api/Denetci/Denetci";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { enqueueSnackbar } from "notistack";
import Autocomplete from "@mui/material/Autocomplete";
import { useDropzone } from "react-dropzone";

interface Veri {
  id: number;
  firmaAdi: string;
}
interface Veri2 {
  id: number;
  adi: string;
  kirilim: number;
  parentId: number | null;
}

interface TransferTableInfo {
  key: string;
  name: string;
}

interface MusteriEkleFormProps {
  onCustomerCreated?: (customerId: number, customerData: any) => void;
  skipNavigation?: boolean;
  initialData?: any;
  showNavigationButtons?: boolean;
  onBack?: () => void;
  isWizardView?: boolean;
  showPdfUpload?: boolean;
  isImportMode?: boolean;
  submitLabel?: string;
  submitAlign?: "start" | "end";
  onImportJobStarted?: (jobId: string) => void;
}

const MusteriEkleForm = ({
  onCustomerCreated,
  skipNavigation = false,
  initialData,
  showNavigationButtons = false,
  onBack,
  isWizardView = false,
  showPdfUpload = true,
  isImportMode = false,
  submitLabel,
  submitAlign,
  onImportJobStarted
}: MusteriEkleFormProps = {}) => {
  const [firmaAdi, setFirmaAdi] = useState(initialData?.firmaAdi || initialData?.unvan || "");
  const [yetkili, setYetkili] = useState(initialData?.yetkili || "");
  const [tel, setTel] = useState(initialData?.tel || initialData?.telefon || "");
  const [adres, setAdres] = useState(initialData?.adres || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [webAdresi, setWebAdresi] = useState(initialData?.webAdresi || "");
  const [ticaretSicilNo, setTicaretSicilNo] = useState(initialData?.ticaretSicilNo || "");
  const [vergiDairesi, setVergiDairesi] = useState(initialData?.vergiDairesi || "");
  const [vergiNo, setVergiNo] = useState(initialData?.vergiNo || "");
  const [konsolideMi, setKonsolideMi] = useState(initialData?.konsolideMi || "Hayır");
  const [konsolideTipi, setKonsolideTipi] = useState(initialData?.konsolideTipi || "Ana Şirket");
  const [konsolideBagliSirketId, setKonsolideBagliSirketId] = useState(initialData?.konsolideBagliSirketId || 0);
  const [sektor1Id, setSektor1Id] = useState(initialData?.sektor1Id ?? initialData?.Sektor1Id ?? 0);
  const [sektor2Id, setSektor2Id] = useState(initialData?.sektor2Id ?? initialData?.Sektor2Id ?? 0);
  const [sektor3Id, setSektor3Id] = useState(initialData?.sektor3Id ?? initialData?.Sektor3Id ?? 0);

  // New financial fields state
  const [aktifBuyukluk, setAktifBuyukluk] = useState<number | null>(null);
  const [ciro, setCiro] = useState<number | null>(null);
  const [netKar, setNetKar] = useState<number | null>(null);
  const [calisanSayisi, setCalisanSayisi] = useState<number | null>(null);
  const [istirakTutari, setIstirakTutari] = useState<number | null>(null);

  const [sektor1List, setSektor1List] = useState<Veri2[]>([]);
  const [sektor2List, setSektor2List] = useState<Veri2[]>([]);
  const [sektor3List, setSektor3List] = useState<Veri2[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfYil, setPdfYil] = useState<number | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [control, setControl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [polling, setPolling] = useState(false);
  const [startImportConfirmOpen, setStartImportConfirmOpen] = useState(false);
  const [transferTables, setTransferTables] = useState<TransferTableInfo[]>([]);
  const [transferTablesLoading, setTransferTablesLoading] = useState(false);

  const textFieldRef = useRef<HTMLInputElement | null>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();

  const denetciId = user.denetciId;
  const [rows, setRows] = useState<Veri[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setLoading(true);

    try {
      const result = await uploadAndParseKurumlarBeyannamesi(file,
        user.denetciId || 0,
        user.yil || 0,
        0 // denetlenenId is 0 for new company
      );

      if (result.success) {
        const data = result.data;
        setFirmaAdi(data.firmaAdi ?? "");
        setTel(data.tel ?? "");
        setEmail(data.email ?? "");
        setTicaretSicilNo(data.ticaretSicilNo ?? "");
        setVergiDairesi(data.vergiDairesi ?? "");
        setVergiNo(data.vergiNo ?? "");

        // Set financial fields
        setAktifBuyukluk(data.aktifBuyukluk ?? null);
        setCiro(data.ciro ?? null);
        setNetKar(data.netKar ?? null);
        setCalisanSayisi(data.calisanSayisi ?? null);
        setIstirakTutari(data.istirakTutari ?? null);


        // Set extracted year if available
        if (data.yil) {
          setPdfYil(data.yil);
        }

        setPdfFile(file); // Store the file for later upload
        enqueueSnackbar("PDF verisi başarıyla çekildi.", { variant: "success" });
      } else {
        enqueueSnackbar(result.message || "PDF okunamadı.", { variant: "error" });
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Beklenmedik bir hata oluştu.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  // Job polling effect
  useEffect(() => {
    if (!jobId) return;
    setPolling(true);
    let interval = setInterval(async () => {
      try {
        const status = await getImportJobStatus(jobId);
        setJobStatus(status);
        const notifs = await getImportJobNotifications(jobId);
        setNotifications(notifs);
        if (status.status === "Succeeded" || status.status === "Failed" || status.status === "Cancelled") {
          clearInterval(interval);
          setPolling(false);
          setLoading(false);
          if (status.status === "Succeeded") {
            enqueueSnackbar("Müşteri verileri başarıyla aktarıldı.", { variant: "success" });
          }
        }
      } catch (e) {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  const checkCompanyQuotaBeforeImport = async (): Promise<boolean> => {
    try {
      const currentDenetciId = denetciId || 0;
      const odemeBilgileri = await getDenetciOdemeBilgileri(currentDenetciId);
      const sirketKota = Number(odemeBilgileri?.sirketKota ?? 0);

      // Kota bilgisi yoksa akışı engelleme
      if (!sirketKota || sirketKota < 1) return true;

      let mevcutFirmaSayisi = Number(odemeBilgileri?.mevcutFirmaSayisi ?? -1);
      if (mevcutFirmaSayisi < 0) {
        const denetlenenler = await getDenetlenenByDenetciId(currentDenetciId);
        mevcutFirmaSayisi = Array.isArray(denetlenenler) ? denetlenenler.length : 0;
      }

      if (mevcutFirmaSayisi >= sirketKota) {
        enqueueSnackbar("Şirket Kotanız Dolmuştur", {
          variant: "error",
          autoHideDuration: 5000,
        });
        return false;
      }

      return true;
    } catch (error: any) {
      enqueueSnackbar(
        error?.message || "Kota kontrolü sırasında bir hata oluştu.",
        { variant: "error", autoHideDuration: 5000 }
      );
      return false;
    }
  };

  const loadTransferTables = async () => {
    try {
      setTransferTablesLoading(true);
      const tables = await getImportFromOldTransferTables();
      setTransferTables(Array.isArray(tables) ? tables : []);
    } catch (error: any) {
      setTransferTables([]);
      enqueueSnackbar(
        error?.message || "Taşınacak tablo listesi alınamadı.",
        { variant: "error", autoHideDuration: 5000 }
      );
    } finally {
      setTransferTablesLoading(false);
    }
  };

  const handleConfirmStartImport = async () => {
    if (!initialData || (!initialData.id && !initialData.Id)) {
      setStartImportConfirmOpen(false);
      return;
    }

    setStartImportConfirmOpen(false);
    setLoading(true);

    try {
      const quotaOk = await checkCompanyQuotaBeforeImport();
      if (!quotaOk) {
        setLoading(false);
        return;
      }

      const result = await startImportFromOldJob({
        OldCompanyId: initialData.id || initialData.Id,
        NewCompanyId: initialData.id || initialData.Id,
        Years: [],
        TableKeys: []
      });

      setJobId(result.jobId);
      setJobStatus({ status: result.status });
      if (result?.jobId && onImportJobStarted) {
        onImportJobStarted(result.jobId);
      }

      enqueueSnackbar(
        result.alreadyQueued
          ? "Zaten kuyruğa alınmış veya çalışıyor."
          : "Import işlemi kuyruğa alındı.",
        { variant: "info" }
      );
      // loading, polling tamamlanınca kapanır
    } catch (e: any) {
      setLoading(false);
      enqueueSnackbar(e?.message || "Kuyruğa alınamadı", { variant: "error" });
    }
  };



  const handleButtonClick = async () => {
    const createdMusteri = {
      denetciId,
      firmaAdi,
      yetkili,
      tel,
      adres,
      email,
      webAdresi,
      ticaretSicilNo,
      vergiDairesi,
      vergiNo,
      yil: pdfYil || user.yil, // PDF'den alınan yıl veya kullanıcının aktif yılı
      konsolideMi,
      konsolideTipi,
      konsolideBagliSirketId,
      sektor1Id,
      sektor2Id,
      sektor3Id,
      // Financial fields
      aktifBuyukluk,
      ciro,
      netKar,
      calisanSayisi,
      istirakTutari
    };

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!firmaAdi.trim()) newErrors.firmaAdi = "Firma Adı zorunludur.";
    if (!email.trim()) newErrors.email = "Email zorunludur.";
    if (!vergiNo.trim()) newErrors.vergiNo = "Vergi Numarası zorunludur.";
    if (!sektor3Id) newErrors.sektor3Id = "Sektör seçimi zorunludur.";

    if (Object.keys(newErrors).length > 0) {

      setErrors(newErrors);
      enqueueSnackbar("Lütfen zorunlu alanları doldurunuz.", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);

      // --- IMPORT MODE LOGIC ---
      if (isImportMode && initialData && (initialData.id || initialData.Id)) {
        setLoading(false);
        await loadTransferTables();
        setStartImportConfirmOpen(true);
        return;
      }

      // If initialData contains an Id (we are importing an old record), call import endpoint to preserve Id
      if (initialData && (initialData.id || initialData.Id)) {
        const dto: any = {
          Id: initialData.id || initialData.Id,
          DenetciId: denetciId,
          FirmaAdi: firmaAdi,
          Yetkili: yetkili,
          Tel: tel,
          Fax: null,
          Adres: adres,
          Email: email,
          WebAdresi: webAdresi,
          TicaretSicilNo: ticaretSicilNo,
          VergiDairesi: vergiDairesi,
          VergiNo: vergiNo,
          ArsivId: null,
          Aktifmi: true,
        };

        const imported = await importDenetlenen(dto);
        if (imported) {
          enqueueSnackbar("Eski şirket başarıyla yeni veritabanına aktarıldı.", { variant: "success" });
          if (onCustomerCreated) onCustomerCreated(dto.Id, dto);
          if (!skipNavigation) router.push("/Musteri/MusteriIslemleri");
          setLoading(false);
          return;
        } else {
          enqueueSnackbar("Şirket içe aktarma başarısız.", { variant: "error" });
          setLoading(false);
          return;
        }
      }

      const result = await createDenetlenen(createdMusteri);
      if (result && result.success) {
        const newId = result.data;

        // If a PDF was uploaded, save it with the new ID
        if (pdfFile) {
          try {
            await uploadAndParseKurumlarBeyannamesi(pdfFile,
              user.denetciId || 0,
              pdfYil || user.yil || 0,
              newId
            );
            enqueueSnackbar("PDF belgesi yeni şirkete başarıyla kaydedildi.", { variant: "success" });
          } catch (uploadError) {
            console.log("PDF kaydetme hatası:", uploadError);
            enqueueSnackbar("Şirket eklendi ancak PDF kaydedilemedi.", { variant: "warning" });
          }
        }

        enqueueSnackbar("Müşteri başarıyla eklendi.", { variant: "success" });

        if (onCustomerCreated) {
          onCustomerCreated(newId, { ...createdMusteri, id: newId });
        }

        if (!skipNavigation) {
          router.push("/Musteri/MusteriIslemleri");
        }
      } else {
        throw new Error((result as any)?.message || "Bilinmeyen bir hata oluştu.");
      }
    } catch (error: any) {
      console.log("Bir hata oluştu:", error);
      const errorMessage =
        (error?.message || "")
          .toString()
          .trim()
          .replace(/^"+|"+$/g, "") || "Kayıt sırasında bir hata oluştu.";
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSektor = async (id: number) => {
    try {
      const sektor3 = sektor3List.find((s3) => s3.id === id);
      if (!sektor3) return;
      setSektor3Id(id);

      const sektor2 = sektor2List.find((s2) => s2.id === sektor3?.parentId);
      if (!sektor2) return;
      setSektor2Id(sektor2.id);

      const sektor1 = sektor1List.find((s1) => s1.id === sektor2?.parentId);
      if (!sektor1) return;
      setSektor1Id(sektor1.id);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const konsolideAnaSirketVerileri =
        await getDenetlenenKonsolideAnaSirketByDenetciId(user.denetciId || 0
        );
      const newRows = konsolideAnaSirketVerileri.map((musteri: any) => ({
        id: musteri.id,
        firmaAdi: musteri.firmaAdi,
      }));
      setRows(newRows);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData2 = async () => {
    try {
      const sektorKodVerileri = await getSektorKodlari();
      const newRows = sektorKodVerileri.map((kod: any) => ({
        id: kod.id,
        adi: kod.adi,
        kirilim: kod.kirilim,
        parentId: kod.parentId ?? null,
      }));
      if (newRows.length > 0) {
        setSektor1List(newRows.filter((item: Veri2) => item.kirilim === 1));
        setSektor2List(newRows.filter((item: Veri2) => item.kirilim === 2));
        setSektor3List(newRows.filter((item: Veri2) => item.kirilim === 3));
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchData2();
  }, []);

  // Sektör adlarına göre eşleştirme
  useEffect(() => {
    if (!initialData) return;
    // Sektör adları hem camelCase hem PascalCase gelebilir
    const sektor1Adi = initialData.sektor1Adi || initialData.Sektor1Adi;
    const sektor2Adi = initialData.sektor2Adi || initialData.Sektor2Adi;
    const sektor3Adi = initialData.sektor3Adi || initialData.Sektor3Adi;

    if (sektor1Adi && sektor1List.length > 0) {
      const match = sektor1List.find(s => s.adi === sektor1Adi);
      if (match) setSektor1Id(match.id);
    }
    if (sektor2Adi && sektor2List.length > 0) {
      const match = sektor2List.find(s => s.adi === sektor2Adi);
      if (match) setSektor2Id(match.id);
    }
    if (sektor3Adi && sektor3List.length > 0) {
      const match = sektor3List.find(s => s.adi === sektor3Adi);
      if (match) setSektor3Id(match.id);
    }
  }, [initialData, sektor1List, sektor2List, sektor3List]);

  useEffect(() => {
    if (isHovered && textFieldRef.current) textFieldRef.current.focus();
    else if (!isHovered && textFieldRef.current) textFieldRef.current.blur();
  }, [isHovered]);

  return (
    <div>
      <Grid container spacing={isWizardView ? 2 : 3}>
        {showPdfUpload && (
          <Grid size={12}>
            <Box
              {...getRootProps()}
              sx={{
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: theme.palette.background.paper,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <input {...getInputProps()} />
              {loading ? (
                <CircularProgress />
              ) : (
                <Typography>
                  Şirket Bilgilerini PDF'den Yüklemek İçin Buraya Tıklayın veya Dosyayı Sürükleyin (Kurumlar Beyannamesi)
                </Typography>
              )}
            </Box>
          </Grid>
        )}
        {/* Firma Adı - Always Full Width */}
        <Grid size={12}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 2 : 3
              }}>
              <CustomFormLabel htmlFor="firmaAdi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Firma Adı
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 10 : 9
              }}>
              <CustomTextField
                id="firmaAdi"
                fullWidth
                size={isWizardView ? "small" : "medium"}
                value={firmaAdi}
                placeholder={errors.firmaAdi || ""}
                onChange={(e: any) => {
                  setFirmaAdi(e.target.value);
                  if (errors.firmaAdi) setErrors((prev) => ({ ...prev, firmaAdi: "" }));
                }}
                onFocus={() => {
                  if (errors.firmaAdi) setErrors((prev) => ({ ...prev, firmaAdi: "" }));
                }}
                error={!!errors.firmaAdi}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Web Adresi */}
        <Grid
          size={{
            xs: 12,
            md: isWizardView ? 6 : 12
          }}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 4 : 3
              }}>
              <CustomFormLabel htmlFor="webAdresi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Web Adresi
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 8 : 9
              }}>
              <CustomTextField
                id="webAdresi"
                fullWidth
                size={isWizardView ? "small" : "medium"}
                value={webAdresi}
                onChange={(e: any) => setWebAdresi(e.target.value)}
                inputRef={textFieldRef}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Yetkili */}
        <Grid
          size={{
            xs: 12,
            md: isWizardView ? 6 : 12
          }}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 4 : 3
              }}>
              <CustomFormLabel htmlFor="yetkili" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Yetkili
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 8 : 9
              }}>
              <CustomTextField
                id="yetkili"
                fullWidth
                size={isWizardView ? "small" : "medium"}
                value={yetkili}
                onChange={(e: any) => setYetkili(e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Telefon */}
        <Grid
          size={{
            xs: 12,
            md: isWizardView ? 6 : 12
          }}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 4 : 3
              }}>
              <CustomFormLabel htmlFor="tel" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Telefon
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 8 : 9
              }}>
              <CustomTextField
                id="tel"
                fullWidth
                size={isWizardView ? "small" : "medium"}
                value={tel}
                onChange={(e: any) => setTel(e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Email */}
        <Grid
          size={{
            xs: 12,
            md: isWizardView ? 6 : 12
          }}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 4 : 3
              }}>
              <CustomFormLabel htmlFor="email" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Email *
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 8 : 9
              }}>
              <CustomTextField
                id="email"
                fullWidth
                size={isWizardView ? "small" : "medium"}
                value={email}
                placeholder={errors.email || ""}
                onChange={(e: any) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                onFocus={() => {
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                error={!!errors.email}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Adres */}
        <Grid size={12}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 2 : 3
              }}>
              <CustomFormLabel htmlFor="adres" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Adres
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 10 : 9
              }}>
              <CustomTextField
                id="adres"
                fullWidth
                size={isWizardView ? "small" : "medium"}
                value={adres}
                onChange={(e: any) => setAdres(e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Ticaret Sicil No */}
        <Grid
          size={{
            xs: 12,
            md: isWizardView ? 6 : 12
          }}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 4 : 3
              }}>
              <CustomFormLabel htmlFor="ticaretSicilNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Ticaret Sicil No
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 8 : 9
              }}>
              <CustomTextField
                id="ticaretSicilNo"
                fullWidth
                size={isWizardView ? "small" : "medium"}
                value={ticaretSicilNo}
                onChange={(e: any) => setTicaretSicilNo(e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Vergi No */}
        <Grid
          size={{
            xs: 12,
            md: isWizardView ? 6 : 12
          }}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 4 : 3
              }}>
              <CustomFormLabel htmlFor="vergiNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Vergi No
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 8 : 9
              }}>
              <CustomTextField
                id="vergiNo"
                fullWidth
                size={isWizardView ? "small" : "medium"}
                value={vergiNo}
                placeholder={errors.vergiNo || ""}
                onChange={(e: any) => {
                  setVergiNo(e.target.value);
                  if (errors.vergiNo) setErrors((prev) => ({ ...prev, vergiNo: "" }));
                }}
                onFocus={() => {
                  if (errors.vergiNo) setErrors((prev) => ({ ...prev, vergiNo: "" }));
                }}
                error={!!errors.vergiNo}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Vergi Dairesi */}
        <Grid
          size={{
            xs: 12,
            md: isWizardView ? 6 : 12
          }}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 4 : 3
              }}>
              <CustomFormLabel htmlFor="vergiDairesi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Vergi Dairesi
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 8 : 9
              }}>
              <CustomTextField
                id="vergiDairesi"
                fullWidth
                size={isWizardView ? "small" : "medium"}
                value={vergiDairesi}
                onChange={(e: any) => setVergiDairesi(e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Konsolide Mi */}
        <Grid
          size={{
            xs: 12,
            md: isWizardView ? 6 : 12
          }}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 4 : 3
              }}>
              <CustomFormLabel htmlFor="konsolideMi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Konsolide Mi
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 8 : 9
              }}>
              <CustomSelect
                labelId="konsolideMi"
                id="konsolideMi"
                size="small"
                value={konsolideMi}
                fullWidth
                onChange={(e: any) => setKonsolideMi(e.target.value)}
                sx={{
                  minWidth: 120,
                  "& .MuiSelect-select": {
                    height: isWizardView ? "14px" : "28px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                <MenuItem value={"Evet"}>Evet</MenuItem>
                <MenuItem value={"Hayır"}>Hayır</MenuItem>
              </CustomSelect>
            </Grid>
          </Grid>
        </Grid>

        {/* Konsolide Tipi */}
        {konsolideMi === "Evet" && (
          <Grid
            size={{
              xs: 12,
              md: isWizardView ? 6 : 12
            }}>
            <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
              <Grid
                size={{
                  xs: 12,
                  sm: isWizardView ? 4 : 3
                }}>
                <CustomFormLabel htmlFor="konsolideTipi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                  Konsolide Tipi
                </CustomFormLabel>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: isWizardView ? 8 : 9
                }}>
                <CustomSelect
                  labelId="konsolideTipi"
                  id="konsolideTipi"
                  size="small"
                  value={konsolideTipi}
                  fullWidth
                  onChange={(e: any) => setKonsolideTipi(e.target.value)}
                  sx={{
                    minWidth: 120,
                    "& .MuiSelect-select": {
                      height: isWizardView ? "14px" : "28px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  <MenuItem value={"Ana Şirket"}>Ana Şirket</MenuItem>
                  <MenuItem value={"Alt Şirket"}>Alt Şirket</MenuItem>
                  <MenuItem value={"Yavru Şirket"}>Yavru Şirket</MenuItem>
                </CustomSelect>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Bağlı Şirket */}
        {konsolideMi === "Evet" && (konsolideTipi === "Alt Şirket" || konsolideTipi === "Yavru Şirket") && (
          <Grid
            size={{
              xs: 12,
              md: isWizardView ? 6 : 12
            }}>
            <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
              <Grid
                size={{
                  xs: 12,
                  sm: isWizardView ? 4 : 3
                }}>
                <CustomFormLabel htmlFor="konsolideBagliSirketId" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                  Bağlı Şirket
                </CustomFormLabel>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: isWizardView ? 8 : 9
                }}>
                <CustomSelect
                  labelId="konsolideBagliSirketId"
                  id="konsolideBagliSirketId"
                  size="small"
                  value={konsolideBagliSirketId}
                  fullWidth
                  onChange={(e: any) => setKonsolideBagliSirketId(e.target.value)}
                  sx={{
                    minWidth: 120,
                    "& .MuiSelect-select": {
                      height: isWizardView ? "14px" : "28px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  <MenuItem value={0}></MenuItem>
                  {rows.map((row) => (
                    <MenuItem key={row.id} value={row.id}>{row.firmaAdi}</MenuItem>
                  ))}
                </CustomSelect>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Sektör */}
        <Grid
          size={{
            xs: 12,
            md: isWizardView ? 6 : 12
          }}>
          <Grid container spacing={isWizardView ? 1 : 2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 4 : 3
              }}>
              <CustomFormLabel htmlFor="sektor3Id" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                Sektör Seç
              </CustomFormLabel>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: isWizardView ? 8 : 9
              }}>
              <Autocomplete
                options={sektor3List}
                size="small"
                value={sektor3List.find((x) => x.id === sektor3Id) || null}
                onChange={(_, val) => {
                  const id = val?.id ?? 0;
                  if (id) handleSelectSektor(id);
                  else {
                    setSektor1Id(0);
                    setSektor2Id(0);
                    setSektor3Id(0);
                  }
                  if (errors.sektor3Id) setErrors((prev) => ({ ...prev, sektor3Id: "" }));
                }}
                getOptionLabel={(o) => o?.adi ?? ""}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    size="small"
                    placeholder={errors.sektor3Id || "Sektör ara..."}
                    fullWidth
                    error={!!errors.sektor3Id}
                    onFocus={() => {
                      if (errors.sektor3Id) setErrors((prev) => ({ ...prev, sektor3Id: "" }));
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Grid size={12}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: submitAlign ? (submitAlign === "end" ? "flex-end" : "flex-start") : "flex-end" }}>
              {showNavigationButtons ? (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="outlined" onClick={onBack} disabled={loading}>Geri</Button>
                  <Button variant="contained" color="primary" onClick={handleButtonClick} disabled={loading}>
                    {loading ? <CircularProgress size={16} color="inherit" /> : (isWizardView ? "Kaydet ve İleri" : "Kaydet")}
                  </Button>
                </Box>
              ) : (
                <Button variant="contained" color="primary" onClick={handleButtonClick} disabled={loading}>
                  {loading ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : null}
                  {submitLabel || (isImportMode ? "Taşımayı Başlat" : "Müşteri Ekle")}
                </Button>
              )}
            </Box>

            {isImportMode && (
              <Dialog
                open={startImportConfirmOpen}
                onClose={() => setStartImportConfirmOpen(false)}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>Taşımayı Başlat Onayı</DialogTitle>
                <DialogContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Taşıma işlemi başlatıldığında aşağıdaki tablolar eski veritabanından aktarılacaktır:
                  </Typography>

                  {transferTablesLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : transferTables.length > 0 ? (
                    <List dense sx={{ bgcolor: "action.hover", borderRadius: 1 }}>
                      {transferTables.map((table) => (
                        <ListItem key={table.key} disablePadding sx={{ px: 1.5, py: 0.25 }}>
                          <ListItemText primary={table.name} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="warning">
                      Taşınacak tablo listesi alınamadı. Lütfen tekrar deneyiniz.
                    </Alert>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setStartImportConfirmOpen(false)}>İptal</Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleConfirmStartImport}
                    disabled={transferTablesLoading || transferTables.length === 0}
                  >
                    Taşımayı Başlat
                  </Button>
                </DialogActions>
              </Dialog>
            )}

            {jobId && (
              <Box mt={3} p={2} sx={{ bgcolor: "action.hover", borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Import Durumu: {jobStatus?.status}</Typography>
                <Box sx={{ maxHeight: "200px", overflowY: "auto" }}>
                  {notifications.map((n, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 0.5, color: n.status === "Failed" ? "error.main" : "text.secondary" }}>
                      <strong>{new Date(n.createdAt).toLocaleString()}:</strong> {n.status} - {n.message}
                    </Typography>
                  ))}
                </Box>
                {jobStatus?.errorMessage && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    Hata: {jobStatus.errorMessage}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Grid>

      </Grid>
    </div>
  );
};

export default MusteriEkleForm;


