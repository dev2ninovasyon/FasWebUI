"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
  IconButton,
  Checkbox,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

import { useDropzone } from "react-dropzone";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import { getCariDosya, getSurekliDosya } from "@/api/DenetimDosya/DenetimDosya";
import {
  EkBelgeDto,
  getMusteriBelgeleriFetch,
  uploadMusteriBelgeFetch,

} from "@/api/MusteriBelgeleri/MusteriBelgeleri";
import {
  downloadEkBelge,
  deleteEkBelge,
} from "@/api/CalismaKagitlari/CalismaKagitlariEkBelge";
const BCrumb = [
  {
    to: "/MusteriBelgeleri",
    title: "Müşteri Belgeleri",
  },
];

interface Veri {
  id: number;
  parentId?: number;
  name: string;
  bds?: string;
  code?: string;
  url?: string;
  reference?: string;
  formKodu?: string;
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
  const [fileType2, setFileType2] = useState("-"); // Belge seçimi (name)
  const [fileType3, setFileType3] = useState("-"); // (şimdilik kullanılmıyor ama senin kodda var)

  const [rows, setRows] = useState<EkBelgeDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dosyaYuklendiMi, setDosyaYuklendiMi] = useState(true);
  const [progressInfos, setProgressInfos] = useState<
    { fileName: string; percentage: number }[]
  >([]);

  // Yeni state'ler (yapı değişikliği için)
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileType(event.target.value);
  };

  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileType2(event.target.value);
  };

  // Seçilen belge adından (name) gerçek formKodu'nu bul
  const getSelectedFormKodu = useCallback(() => {
      if (fileType === "ToplantıTutanakları") {
      return "genelkurultoplantibelgeleri";
    }
    if (!fileType2 || fileType2 === "-" || !fetchedData) return null;

    const match = fetchedData.find((item) => item.name === fileType2);

    // Eğer code yoksa fallback: fileType3 ya da null
    return match?.code || fileType3;
  }, [fileType2, fetchedData, fileType3]);

  // Ek belgeleri listeleme
  const loadEkBelgeler = useCallback(
    async () => {
      try {
        const formKodu = getSelectedFormKodu();
        
        console.log("Seçilen formKodu:", formKodu);

        if (!formKodu) {
          setRows([]);
          return;
        }

        if (!user.token || !user.denetciId || !user.denetlenenId || !user.yil) {
          return;
        }

        setIsLoadingList(true);

        const list: EkBelgeDto[] = await getMusteriBelgeleriFetch(
          user.token,
          user.denetciId,
          user.denetlenenId,
          user.yil,
          formKodu
        );

        console.log("Müşteri belgeleri list:", list);

        // Artık mapping yok, gelen DTO'yu direkt kullanıyoruz
        setRows(list);
        setSelectedIds([]);
      } catch (error) {
        console.error("Müşteri belgeleri listesi alınırken hata:", error);
        enqueueSnackbar("Yüklenmiş belgeler alınırken hata oluştu.", {
          variant: "error",
        });
      } finally {
        setIsLoadingList(false);
      }
    },
    [
      getSelectedFormKodu,
      user.token,
      user.denetciId,
      user.denetlenenId,
      user.yil,
    ]
  );

  // Yükleme
const onDrop = useCallback(
  async (acceptedFiles: File[]) => {
    console.log(fileType);

    // ToplantıTutanakları HARİÇ durumlarda fileType2 zorunlu olsun
    if (
      fileType !== "ToplantıTutanakları" &&
      (!fileType2 || fileType2 === "-")
    ) {
      enqueueSnackbar(
        "Lütfen önce yüklemek istediğiniz dosya türünü seçin.",
        {
          variant: "warning",
        }
      );
      return;
    }

    if (!user.token || !user.denetciId || !user.denetlenenId || !user.yil) {
      enqueueSnackbar("Oturum bilgisi eksik. Lütfen tekrar giriş yapın.", {
        variant: "error",
      });
      return;
    }

    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setDosyaYuklendiMi(false);

    setProgressInfos(
      acceptedFiles.map((f) => ({
        fileName: f.name,
        percentage: 30,
      }))
    );

    try {
      const formKodu = getSelectedFormKodu();

      await uploadMusteriBelgeFetch(user.token, {
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        formKodu: formKodu || "FormKodu",
        files: acceptedFiles,
      });

      setProgressInfos((prev) =>
        prev.map((p) => ({ ...p, percentage: 100 }))
      );

      setDosyaYuklendiMi(true);
      enqueueSnackbar("Dosyalar başarıyla yüklendi.", { variant: "success" });

      await loadEkBelgeler();
    } catch (error) {
      console.error("Dosya yüklenirken hata oluştu:", error);
      enqueueSnackbar("Dosya yüklenirken bir hata oluştu.", {
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  },
  [
    fileType,        // <-- bunu da dependency list'e ekle
    fileType2,
    user.token,
    user.denetciId,
    user.denetlenenId,
    user.yil,
    loadEkBelgeler,
    getSelectedFormKodu,
  ]
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
        console.log("CariDosya:", data);
        setFetchedData2(data);
      }
      if (fileType === "SürekliDosya") {
        const data = await getSurekliDosya(
          user.token || "",
          user.denetimTuru || ""
        );
        console.log("SürekliDosya:", data);
        setFetchedData2(data);
      }
      // ToplantıTutanakları için ilerde fetch eklenebilir
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  // Ana dosya tipi değişince alt seçimi resetle + listeyi çek
  useEffect(() => {
    setFileType2("-");
    setRows([]);
    setSelectedIds([]);
    fetchData();
  }, [fileType]);

  // FormKodu değişince dosyaları getir
  useEffect(() => {
    if (dosyaYuklendiMi) {
      loadEkBelgeler();
    }
  }, [fileType2, dosyaYuklendiMi, loadEkBelgeler]);

  // --- Sağ taraf (Yüklenmiş Dosya Bilgileri) için yardımcı fonksiyonlar ---

  const isPdfBelge = (belge: EkBelgeDto) => {
    const contentType = (belge as any).contentType?.toLowerCase() || "";
    const name =
      ((belge as any).orijinalDosyaAdi ||
        (belge as any).adi ||
        "")?.toLowerCase() || "";
    return contentType.includes("pdf") || name.endsWith(".pdf");
  };

  const filteredBelgeler = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((b) =>
      (
        (b as any).orijinalDosyaAdi ||
        (b as any).adi ||
        ""
      )
        .toString()
        .toLowerCase()
        .includes(term)
    );
  }, [rows, searchTerm]);

  const isAllSelected =
    filteredBelgeler.length > 0 &&
    selectedIds.length === filteredBelgeler.length;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBelgeler.map((b) => b.id));
    }
  };

  const handleDownload = async (belge: EkBelgeDto) => {
    if (!user.token) return;

    try {
      const { blob, fileName } = await downloadEkBelge(
        user.token,
        belge.id
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        fileName ||
        (belge as any).orijinalDosyaAdi ||
        (belge as any).adi ||
        "musteri_belgesi";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Belge indirilirken hata:", error);
      enqueueSnackbar("Belge indirilirken bir hata oluştu.", {
        variant: "error",
      });
    }
  };

  const handleView = async (belge: EkBelgeDto) => {
    // Şimdilik PDF ise yeni sekmede açalım
    if (!user.token) return;

    try {
      const { blob } = await downloadEkBelge(user.token, belge.id);
      const url = window.URL.createObjectURL(blob);

      if (isPdfBelge(belge)) {
        window.open(url, "_blank");
      } else {
        // PDF değilse direkt indirme
        const a = document.createElement("a");
        a.href = url;
        a.download =
          (belge as any).orijinalDosyaAdi ||
          (belge as any).adi ||
          "musteri_belgesi";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Belge görüntülenirken hata:", error);
      enqueueSnackbar("Belge görüntülenirken bir hata oluştu.", {
        variant: "error",
      });
    }
  };

  const handleDeleteSelectedClick = async () => {
    if (!user.token) return;
    if (selectedIds.length === 0) {
      enqueueSnackbar("Lütfen silmek için en az bir belge seçin.", {
        variant: "info",
      });
      return;
    }

    const onay = window.confirm(
      `${selectedIds.length} adet belgeyi silmek istediğinize emin misiniz?`
    );
    if (!onay) return;

    try {
      setIsDeletingSelected(true);

      const promises = selectedIds.map((id) =>
        deleteEkBelge(user.token!, id)
      );
      const results = await Promise.all(promises);

      const successIds = selectedIds.filter((_, idx) => results[idx]);
      const failedCount = selectedIds.length - successIds.length;

      if (successIds.length > 0) {
        setRows((prev) => prev.filter((b) => !successIds.includes(b.id)));
        setSelectedIds([]);

        enqueueSnackbar(
          failedCount > 0
            ? `${successIds.length} belge silindi, ${failedCount} belge silinirken hata oluştu.`
            : "Seçilen belgeler başarıyla silindi.",
          {
            variant: failedCount > 0 ? "warning" : "success",
          }
        );
      } else {
        enqueueSnackbar("Belgeler silinirken bir hata oluştu.", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Seçilen belgeler silinirken hata:", error);
      enqueueSnackbar("Seçilen belgeler silinirken beklenmeyen bir hata oluştu.", {
        variant: "error",
      });
    } finally {
      setIsDeletingSelected(false);
    }
  };

  return (
    <PageContainer
      title="Müşteri Belgeleri"
      description="this is Müşteri Belgeleri"
    >
      <Breadcrumb title="Müşteri Belgeleri" items={BCrumb} />
      <Grid container spacing={3}>
        {/* SOL: Dosya yükleme alanı */}
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

            {/* Cari dosya alt tür */}
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
                          {item.archiveFileName} {item.reference} {item.name}
                        </MenuItem>
                      ))}
                  </CustomSelect>
                </Grid>
              </Grid>
            )}

            {/* Sürekli dosya alt tür */}
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
                          {item.archiveFileName} {item.reference} {item.name}
                        </MenuItem>
                      ))}
                  </CustomSelect>
                </Grid>
              </Grid>
            )}

            {/* Dropzone */}
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
                        overflow={"auto"}
                        maxHeight={"240px"}
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

        {/* SAĞ: Yüklenmiş dosya listesi (Yeni yapı) */}
        <Grid item xs={12} lg={7}>
          <Box
            sx={{
              height: smDown ? "610px" : "550px",
              border: `1px solid ${borderColor}`,
              borderRadius: `${borderRadius}/5`,
              p: 0,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: `${borderRadius}/5`,
                border: `1px solid ${borderColor}`,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "background.default"
                    : "background.paper",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {/* Başlık + arama */}
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  borderBottom: `1px solid ${borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">Yüklenmiş Dosya Bilgileri</Typography>
                <TextField
                  size="small"
                  placeholder="Arama"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ width: 260 }}
                />
              </Box>

              {/* Tablo */}
              <TableContainer
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "auto",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedIds.length > 0 &&
                            selectedIds.length < filteredBelgeler.length
                          }
                          checked={isAllSelected}
                          onChange={handleToggleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Dosya Adı</TableCell>
                      <TableCell width={120}>Tarih</TableCell>
                      <TableCell width={120}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoadingList ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2">
                            Yüklenmiş dosyalar yükleniyor...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredBelgeler.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Henüz yüklenmiş dosya bulunmuyor.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBelgeler.map((belge) => (
                        <TableRow key={belge.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedIds.includes(belge.id)}
                              onChange={() => toggleSelect(belge.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="flex-start"
                            >
                              <InsertDriveFileIcon fontSize="small" />
                              <Typography
                                variant="body2"
                                title={
                                  (belge as any).orijinalDosyaAdi ||
                                  (belge as any).adi ||
                                  ""
                                }
                                sx={{
                                  wordBreak: "break-word",
                                  whiteSpace: "normal",
                                }}
                              >
                                {(belge as any).orijinalDosyaAdi ||
                                  (belge as any).adi ||
                                  ""}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {(belge as any).yuklemeTarihi ||
                              (belge as any).olusturulmaTarihi
                                ? new Date(
                                    (belge as any).yuklemeTarihi ||
                                      (belge as any).olusturulmaTarihi
                                  ).toLocaleString("tr-TR")
                                : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="flex-end"
                            >
                              {/* Göster: sadece PDF'ler için */}
                              {isPdfBelge(belge) && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleView(belge)}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              )}

                              {/* İndir */}
                              <IconButton
                                size="small"
                                onClick={() => handleDownload(belge)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Alt bar: Seçilenleri Sil */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  px: 1.5,
                  py: 0.75,
                  borderTop: `1px solid ${borderColor}`,
                }}
              >
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelectedClick}
                  disabled={selectedIds.length === 0 || isDeletingSelected}
                >
                  {isDeletingSelected ? "Siliniyor..." : "Seçilenleri Sil"}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
