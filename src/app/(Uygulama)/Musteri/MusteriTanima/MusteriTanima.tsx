import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SaveIcon from "@mui/icons-material/Save";
import { useSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getMusteriTanimaDetay,
  updateMusteriTanimaDetay,
  uploadAndParseKurumlarBeyannamesi,
} from "@/api/Musteri/MusteriIslemleri";

type OrtakRow = {
  adSoyadUnvan: string;
  tcVkn: string;
  pay: string;
  adresIrtibat: string;
};

type ComparisonRow = {
  baslik: string;
  oncekiYilDegeri: string;
  cariYilDegeri: string;
  vurgulu?: boolean;
};

type SingleRow = {
  baslik: string;
  deger: string;
  vurgulu?: boolean;
};

type FormState = {
  id: number;
  denetciId: number;
  denetlenenId: number;
  yil: number;
  ticaretUnvani: string;
  vergiKimlikNumarasi: string;
  ticaretSicilNo: string;
  vergiDairesi: string;
  telefon: string;
  ePosta: string;
  webAdresi: string;
  yasalForm: string;
  subeSayisi: string;
  personelSayisi: string;
  stokDegerlemeYontemi: string;
  smmmAdi: string;
  smmmTcVkn: string;
  smmmOdaNo: string;
  smmmEmail: string;
  smmmTel: string;
  notlar: string;
  ortaklar: OrtakRow[];
  gelirTablosu: ComparisonRow[];
  bilanco: ComparisonRow[];
  kurumlarVergisi: SingleRow[];
  transferFiyatlandirmasi: SingleRow[];
  dovizPozisyonu: SingleRow[];
};

const emptyForm = (): FormState => ({
  id: 0,
  denetciId: 0,
  denetlenenId: 0,
  yil: 0,
  ticaretUnvani: "",
  vergiKimlikNumarasi: "",
  ticaretSicilNo: "",
  vergiDairesi: "",
  telefon: "",
  ePosta: "",
  webAdresi: "",
  yasalForm: "",
  subeSayisi: "",
  personelSayisi: "",
  stokDegerlemeYontemi: "",
  smmmAdi: "",
  smmmTcVkn: "",
  smmmOdaNo: "",
  smmmEmail: "",
  smmmTel: "",
  notlar: "",
  ortaklar: [],
  gelirTablosu: [],
  bilanco: [],
  kurumlarVergisi: [],
  transferFiyatlandirmasi: [],
  dovizPozisyonu: [],
});

interface Props {
  onSaved?: () => void;
}

const MusteriTanima: React.FC<Props> = ({ onSaved }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);

  const loadData = async () => {
    if (!user.denetlenenId || !user.yil) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getMusteriTanimaDetay(user.denetlenenId, user.yil);
      const payload = result?.data ?? result?.Data ?? result;
      setForm({
        id: payload?.id ?? 0,
        denetciId: payload?.denetciId ?? user.denetciId ?? 0,
        denetlenenId: payload?.denetlenenId ?? user.denetlenenId ?? 0,
        yil: payload?.yil ?? user.yil ?? 0,
        ticaretUnvani: payload?.ticaretUnvani ?? "",
        vergiKimlikNumarasi: payload?.vergiKimlikNumarasi ?? "",
        ticaretSicilNo: payload?.ticaretSicilNo ?? "",
        vergiDairesi: payload?.vergiDairesi ?? "",
        telefon: payload?.telefon ?? "",
        ePosta: payload?.ePosta ?? "",
        webAdresi: payload?.webAdresi ?? "",
        yasalForm: payload?.yasalForm ?? "",
        subeSayisi: payload?.subeSayisi?.toString?.() ?? "",
        personelSayisi: payload?.personelSayisi?.toString?.() ?? "",
        stokDegerlemeYontemi: payload?.stokDegerlemeYontemi ?? "",
        smmmAdi: payload?.smmmAdi ?? "",
        smmmTcVkn: payload?.smmmTcVkn ?? "",
        smmmOdaNo: payload?.smmmOdaNo ?? "",
        smmmEmail: payload?.smmmEmail ?? "",
        smmmTel: payload?.smmmTel ?? "",
        notlar: payload?.notlar ?? "",
        ortaklar: payload?.ortaklar ?? [],
        gelirTablosu: payload?.gelirTablosu ?? [],
        bilanco: payload?.bilanco ?? [],
        kurumlarVergisi: payload?.kurumlarVergisi ?? [],
        transferFiyatlandirmasi: payload?.transferFiyatlandirmasi ?? [],
        dovizPozisyonu: payload?.dovizPozisyonu ?? [],
      });
    } catch (error) {
      console.error("Musteri tanima yukleme hatasi:", error);
      enqueueSnackbar("Musteri tanima belgesi yuklenemedi.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.denetlenenId, user.yil]);

  const setField = (field: keyof FormState, value: string | number | OrtakRow[] | ComparisonRow[] | SingleRow[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user.denetlenenId || !user.yil) {
      return;
    }

    setSaving(true);
    try {
      const response = await updateMusteriTanimaDetay({
        ...form,
        denetciId: user.denetciId ?? form.denetciId ?? 0,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        subeSayisi: form.subeSayisi ? Number(form.subeSayisi) : null,
        personelSayisi: form.personelSayisi ? Number(form.personelSayisi) : null,
      });

      if (response?.success) {
        enqueueSnackbar("Musteri tanima belgesi kaydedildi.", { variant: "success" });
        onSaved?.();
        await loadData();
      } else {
        enqueueSnackbar(response?.message || "Kaydetme islemi basarisiz oldu.", { variant: "error" });
      }
    } catch (error) {
      console.error("Kaydetme hatasi:", error);
      enqueueSnackbar("Belge kaydedilirken hata olustu.", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user.denetlenenId || !user.yil) {
      return;
    }

    setParsing(true);
    try {
      const response = await uploadAndParseKurumlarBeyannamesi(
        file,
        user.denetciId ?? 0,
        user.yil,
        user.denetlenenId
      );

      if (response?.success) {
        enqueueSnackbar("PDF verileri belgeye aktarıldı.", { variant: "success" });
        await loadData();
        onSaved?.();
      } else {
        enqueueSnackbar(response?.message || "PDF islenemedi.", { variant: "error" });
      }
    } catch (error) {
      console.error("PDF isleme hatasi:", error);
      enqueueSnackbar("PDF okunurken hata olustu.", { variant: "error" });
    } finally {
      setParsing(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const updateOrtak = (index: number, field: keyof OrtakRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      ortaklar: prev.ortaklar.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      ),
    }));
  };

  const removeOrtak = (index: number) => {
    setForm((prev) => ({
      ...prev,
      ortaklar: prev.ortaklar.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const addOrtak = () => {
    setForm((prev) => ({
      ...prev,
      ortaklar: [...prev.ortaklar, { adSoyadUnvan: "", tcVkn: "", pay: "", adresIrtibat: "" }],
    }));
  };

  const updateComparisonRow = (
    field: "gelirTablosu" | "bilanco",
    index: number,
    key: keyof ComparisonRow,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] as ComparisonRow[]).map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const addComparisonRow = (field: "gelirTablosu" | "bilanco") => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] as ComparisonRow[]), { baslik: "", oncekiYilDegeri: "", cariYilDegeri: "" }],
    }));
  };

  const removeComparisonRow = (field: "gelirTablosu" | "bilanco", index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] as ComparisonRow[]).filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const getSingleRowValue = (field: "kurumlarVergisi" | "transferFiyatlandirmasi" | "dovizPozisyonu", baslik: string) =>
    (form[field] as SingleRow[]).find((row) => row.baslik === baslik)?.deger ?? "";

  const setSingleRowValue = (
    field: "kurumlarVergisi" | "transferFiyatlandirmasi" | "dovizPozisyonu",
    baslik: string,
    value: string,
    vurgulu?: boolean
  ) => {
    setForm((prev) => {
      const rows = [...(prev[field] as SingleRow[])];
      const index = rows.findIndex((row) => row.baslik === baslik);
      if (index >= 0) {
        rows[index] = { ...rows[index], deger: value };
      } else {
        rows.push({ baslik, deger: value, vurgulu });
      }
      return { ...prev, [field]: rows };
    });
  };

  const updateSingleRow = (
    field: "kurumlarVergisi" | "transferFiyatlandirmasi" | "dovizPozisyonu",
    index: number,
    key: keyof SingleRow,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] as SingleRow[]).map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const addSingleRow = (
    field: "kurumlarVergisi" | "transferFiyatlandirmasi" | "dovizPozisyonu",
    row: SingleRow = { baslik: "", deger: "" }
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] as SingleRow[]), row],
    }));
  };

  const removeSingleRow = (
    field: "kurumlarVergisi" | "transferFiyatlandirmasi" | "dovizPozisyonu",
    index: number
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] as SingleRow[]).filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const sectionTitleSx = {
    color: theme.palette.primary.dark,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    fontWeight: 700,
    mb: 2,
    pb: 1,
  };

  const headerCellSx = {
    backgroundColor: "#1f6778",
    color: "#fff",
    fontWeight: 700,
  };

  const highlightedRowSx = {
    backgroundColor: "#dcecf3",
    "& .MuiInputBase-input": {
      fontWeight: 700,
    },
  };

  const renderInfoTable = () => {
    const rows = [
      { label: "Ticaret Unvani", value: form.ticaretUnvani, key: "ticaretUnvani" },
      { label: "Vergi Kimlik Numarasi", value: form.vergiKimlikNumarasi, key: "vergiKimlikNumarasi" },
      { label: "Ticaret Sicil No", value: form.ticaretSicilNo, key: "ticaretSicilNo" },
      { label: "Vergi Dairesi", value: form.vergiDairesi, key: "vergiDairesi" },
      { label: "Telefon", value: form.telefon, key: "telefon" },
      { label: "E-posta", value: form.ePosta, key: "ePosta" },
      { label: "Web Adresi", value: form.webAdresi, key: "webAdresi" },
      { label: "Yasal Form", value: form.yasalForm, key: "yasalForm" },
      { label: "Sube Sayisi", value: form.subeSayisi, key: "subeSayisi" },
      { label: "Ortalama Calisan Sayisi", value: form.personelSayisi, key: "personelSayisi" },
      { label: "Stok Degerleme Yontemi", value: form.stokDegerlemeYontemi, key: "stokDegerlemeYontemi" },
    ] as const;

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Bilgi Alani</TableCell>
              <TableCell sx={headerCellSx}>Veri</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell sx={{ width: 320 }}>{row.label}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.value}
                    onChange={(event) => setField(row.key, event.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderComparisonTable = (
    title: string,
    field: "gelirTablosu" | "bilanco"
  ) => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h5" sx={sectionTitleSx}>
          {title}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={() => addComparisonRow(field)}>
          Satir Ekle
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Kalem</TableCell>
              <TableCell sx={headerCellSx}>{form.yil - 1} (TL)</TableCell>
              <TableCell sx={headerCellSx}>{form.yil} (TL)</TableCell>
              <TableCell sx={headerCellSx} width={70}>Sil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {form[field].map((row, index) => (
              <TableRow key={`${field}-${index}`} sx={row.vurgulu ? highlightedRowSx : undefined}>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.baslik}
                    onChange={(event) => updateComparisonRow(field, index, "baslik", event.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.oncekiYilDegeri}
                    onChange={(event) => updateComparisonRow(field, index, "oncekiYilDegeri", event.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.cariYilDegeri}
                    onChange={(event) => updateComparisonRow(field, index, "cariYilDegeri", event.target.value)}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="error" onClick={() => removeComparisonRow(field, index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} flexDirection={{ xs: "column", md: "row" }} gap={2} mb={4}>
        <Typography variant="h3" color="primary.dark" fontWeight={800}>
          ISLETME TANIMA
        </Typography>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          <input
            id="musteri-tanima-pdf-upload"
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handlePdfUpload}
          />
          <label htmlFor="musteri-tanima-pdf-upload">
            <Button component="span" variant="outlined" startIcon={parsing ? <CircularProgress size={18} /> : <FileUploadIcon />} disabled={parsing}>
              {parsing ? "PDF Isleniyor" : "PDF Yukle"}
            </Button>
          </label>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />} disabled={saving} onClick={handleSave}>
            Kaydet
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" sx={sectionTitleSx}>
            1. KIMLIK VE ILETISIM BILGILERI
          </Typography>
          {renderInfoTable()}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h5" sx={sectionTitleSx}>
              2. ORTAKLAR VE MALI MUSAVIR
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addOrtak}>
              Ortak Ekle
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Ad Soyad / Unvan</TableCell>
                  <TableCell sx={headerCellSx}>TC / VKN</TableCell>
                  <TableCell sx={headerCellSx}>Pay</TableCell>
                  <TableCell sx={headerCellSx}>Adres / Irtibat</TableCell>
                  <TableCell sx={headerCellSx} width={70}>Sil</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.ortaklar.map((row, index) => (
                  <TableRow key={`ortak-${index}`}>
                    <TableCell>
                      <TextField fullWidth size="small" value={row.adSoyadUnvan} onChange={(event) => updateOrtak(index, "adSoyadUnvan", event.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={row.tcVkn} onChange={(event) => updateOrtak(index, "tcVkn", event.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={row.pay} onChange={(event) => updateOrtak(index, "pay", event.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={row.adresIrtibat} onChange={(event) => updateOrtak(index, "adresIrtibat", event.target.value)} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => removeOrtak(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow sx={{ backgroundColor: "#f4f8fa" }}>
                  <TableCell>
                    <TextField fullWidth size="small" label="Mali Musavir" value={form.smmmAdi} onChange={(event) => setField("smmmAdi", event.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Box display="grid" gap={1}>
                      <TextField fullWidth size="small" label="TC / VKN" value={form.smmmTcVkn} onChange={(event) => setField("smmmTcVkn", event.target.value)} />
                      <TextField fullWidth size="small" label="Oda Sicil No" value={form.smmmOdaNo} onChange={(event) => setField("smmmOdaNo", event.target.value)} />
                    </Box>
                  </TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell>
                    <Box display="grid" gap={1}>
                      <TextField fullWidth size="small" label="E-posta" value={form.smmmEmail} onChange={(event) => setField("smmmEmail", event.target.value)} />
                      <TextField fullWidth size="small" label="Telefon" value={form.smmmTel} onChange={(event) => setField("smmmTel", event.target.value)} />
                    </Box>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12 }}>
          {renderComparisonTable(`3. GELIR TABLOSU (${form.yil - 1} - ${form.yil} KARSILASTIRMALI)`, "gelirTablosu")}
        </Grid>

        <Grid size={{ xs: 12 }}>
          {renderComparisonTable(`4. BILANCO (${form.yil - 1} - ${form.yil} KARSILASTIRMALI)`, "bilanco")}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h5" sx={sectionTitleSx}>
            5. KURUMLAR VERGISI BILGILERI
          </Typography>
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <Button startIcon={<AddIcon />} onClick={() => addSingleRow("kurumlarVergisi")}>
              Satir Ekle
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Kalem</TableCell>
                  <TableCell sx={headerCellSx}>{form.yil} (TL)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.kurumlarVergisi.map((row, index) => (
                  <TableRow key={`${row.baslik}-${index}`} sx={row.vurgulu ? highlightedRowSx : undefined}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={row.baslik}
                        onChange={(event) => updateSingleRow("kurumlarVergisi", index, "baslik", event.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} alignItems="center">
                        <TextField
                          fullWidth
                          size="small"
                          value={row.deger}
                          onChange={(event) => updateSingleRow("kurumlarVergisi", index, "deger", event.target.value)}
                        />
                        <IconButton color="error" onClick={() => removeSingleRow("kurumlarVergisi", index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {form.kurumlarVergisi.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      PDF'ten gelen kurumlar vergisi satirlari burada listelenecek.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h5" sx={sectionTitleSx}>
            6. ILISKILI TARAF ISLEMLERI VE YABANCI PARA POZISYONU
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Transfer Fiyatlandirmasi</TableCell>
                  <TableCell sx={headerCellSx}>Alis (TL)</TableCell>
                  <TableCell sx={headerCellSx}>Satis (TL)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { label: "Mamul / Ticari Mallar", alisKey: "Mamul / Ticari Mallar - Alis", satisKey: "Mamul / Ticari Mallar - Satis", highlighted: false },
                  { label: "Kiralama", alisKey: "Kiralama - Alis", satisKey: "Kiralama - Satis", highlighted: false },
                  { label: "Sigorta Policeleri", alisKey: "Sigorta Policeleri - Alis", satisKey: "Sigorta Policeleri - Satis", highlighted: false },
                  { label: "Toplam", alisKey: "Toplam Alis", satisKey: "Toplam Satis", highlighted: true },
                ].map((row) => (
                  <TableRow key={row.label} sx={row.highlighted ? highlightedRowSx : undefined}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={getSingleRowValue("transferFiyatlandirmasi", row.alisKey)} onChange={(event) => setSingleRowValue("transferFiyatlandirmasi", row.alisKey, event.target.value, row.highlighted)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={getSingleRowValue("transferFiyatlandirmasi", row.satisKey)} onChange={(event) => setSingleRowValue("transferFiyatlandirmasi", row.satisKey, event.target.value, row.highlighted)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Doviz Pozisyonu ({form.yil})</TableCell>
                  <TableCell sx={headerCellSx}>Doviz Miktari</TableCell>
                  <TableCell sx={headerCellSx}>TL Karsiligi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { label: "ABD Dolari (USD) - Bankalar", dovizKey: "ABD Dolari (USD) - Bankalar - Doviz Miktari", tlKey: "ABD Dolari (USD) - Bankalar - TL Karsiligi", highlighted: false },
                  { label: "Euro (EUR)", dovizKey: "Euro (EUR) - Doviz Miktari", tlKey: "Euro (EUR) - TL Karsiligi", highlighted: false },
                  { label: "Net Yabanci Para Pozisyonu", dovizKey: "Net Yabanci Para Pozisyonu - Doviz Miktari", tlKey: "Net Yabanci Para Pozisyonu - TL Karsiligi", highlighted: true },
                ].map((row) => (
                  <TableRow key={row.label} sx={row.highlighted ? highlightedRowSx : undefined}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={getSingleRowValue("dovizPozisyonu", row.dovizKey)} onChange={(event) => setSingleRowValue("dovizPozisyonu", row.dovizKey, event.target.value, row.highlighted)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={getSingleRowValue("dovizPozisyonu", row.tlKey)} onChange={(event) => setSingleRowValue("dovizPozisyonu", row.tlKey, event.target.value, row.highlighted)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" sx={sectionTitleSx}>
            7. NOTLAR
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={form.notlar}
            onChange={(event) => setField("notlar", event.target.value)}
            placeholder="Belgeye ilave aciklamalar ekleyebilirsiniz."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MusteriTanima;
