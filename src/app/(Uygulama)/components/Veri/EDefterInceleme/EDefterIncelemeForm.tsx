import { Button, Grid, Typography, Tooltip } from "@mui/material";
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import React from "react";
import { enqueueSnackbar } from "notistack";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextAreaAutoSize from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextAreaAutoSize";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CustomDatePicker } from "@/utils/datePickerUtil";

interface Props {
  hesapNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  setHesapNo: (str: string) => void;
  setBaslangicTarihi: (str: string) => void;
  setBitisTarihi: (str: string) => void;
  setVerileriGetirTiklandimi: (bool: boolean) => void;
  hesaplar?: string;
  setHesaplar?: (s: string) => void;
  iliskilihesaplar?: string;
  setIliskiliHesaplar?: (s: string) => void;
  yevmiyeNolar?: string;
  setYevmiyeNolar?: (s: string) => void;
  haricYevmiyeNo?: string;
  setHaricYevmiyeNo?: (s: string) => void;
  borcTutarindanFazla?: number | undefined;
  setBorcTutarindanFazla?: (n: number | undefined) => void;
  alacakTutarindanFazla?: number | undefined;
  setAlacakTutarindanFazla?: (n: number | undefined) => void;
  aciklama?: string;
  setAciklama?: (s: string) => void;
}

const EDefterIncelemeForm: React.FC<Props> = ({
  hesapNo,
  baslangicTarihi,
  bitisTarihi,
  setHesapNo,
  setBaslangicTarihi,
  setBitisTarihi,
  setVerileriGetirTiklandimi,
  hesaplar,
  setHesaplar,
  iliskilihesaplar,
  setIliskiliHesaplar,
  yevmiyeNolar,
  setYevmiyeNolar,
  haricYevmiyeNo,
  setHaricYevmiyeNo,
  borcTutarindanFazla,
  setBorcTutarindanFazla,
  alacakTutarindanFazla,
  setAlacakTutarindanFazla,
  aciklama,
  setAciklama,
}) => {
  const trN2Formatter = React.useMemo(
    () =>
      new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatToTrN2 = (value?: number): string =>
    value === undefined || value === null || Number.isNaN(value)
      ? ""
      : trN2Formatter.format(value);

  const [borcInput, setBorcInput] = React.useState<string>(
    formatToTrN2(borcTutarindanFazla)
  );
  const [alacakInput, setAlacakInput] = React.useState<string>(
    formatToTrN2(alacakTutarindanFazla)
  );

  const parseDecimalInput = (value: string): number | undefined => {
    const raw = value.trim();
    if (raw === "") return undefined;

    const cleaned = raw
      .replace(/\u00A0/g, "")
      .replace(/\s/g, "")
      .replace(/[₺$€]/g, "");

    let normalized = cleaned;
    if (cleaned.includes(",") && cleaned.includes(".")) {
      // tr-TR: 1.234,56 -> 1234.56
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else if (cleaned.includes(",")) {
      normalized = cleaned.replace(",", ".");
    } else if ((cleaned.match(/\./g) || []).length > 1) {
      // 1.234.567 -> 1234567
      normalized = cleaned.replace(/\./g, "");
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const handleSubmit = () => {
    const hasAnyFilter = (
      (hesapNo && hesapNo.toString().trim() !== "") ||
      (hesaplar && hesaplar.toString().trim() !== "") ||
      (iliskilihesaplar && iliskilihesaplar.toString().trim() !== "") ||
      (yevmiyeNolar && yevmiyeNolar.toString().trim() !== "") ||
      (haricYevmiyeNo && haricYevmiyeNo.toString().trim() !== "") ||
      (borcTutarindanFazla !== undefined && borcTutarindanFazla !== null) ||
      (alacakTutarindanFazla !== undefined && alacakTutarindanFazla !== null) ||
      (aciklama && aciklama.toString().trim() !== "")
    );

    if (!hasAnyFilter) {
      enqueueSnackbar("En az bir filtre seçmelisiniz.", { variant: "warning" });
      return;
    }

    setVerileriGetirTiklandimi(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <div>
        <Grid container spacing={3}>
          <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 6, lg: 4 }}>
            <CustomFormLabel htmlFor="baslangicTarihi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
              <Typography variant="subtitle1">Başlangıç Tarihi:</Typography>
            </CustomFormLabel>
            <CustomDatePicker
              id="baslangicTarihi"
              value={baslangicTarihi}
              onChange={setBaslangicTarihi}
            />
            <Tooltip title="Yevmiye Tarihi Başlar." arrow>
              <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
            </Tooltip>
          </Grid>

          <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 6, lg: 4 }}>
            <CustomFormLabel htmlFor="bitisTarihi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
              <Typography variant="subtitle1">Bitiş Tarihi:</Typography>
            </CustomFormLabel>
            <CustomDatePicker
              id="bitisTarihi"
              value={bitisTarihi}
              onChange={setBitisTarihi}
            />
            <Tooltip title="Yevmiye Tarihi Biter." arrow>
              <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
            </Tooltip>
          </Grid>

        <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 6, lg: 4 }}>
          <CustomFormLabel htmlFor="hesaplar" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
            <Typography variant="subtitle1">Hesaplar (sadece):</Typography>
          </CustomFormLabel>
          <CustomTextAreaAutoSize id="hesaplar" value={hesaplar || ""} fullWidth placeholder="örn. 100,200" onChange={(e: any) => setHesaplar && setHesaplar(e.target.value)} />
          <Tooltip title="Sadece Yazdığınız Hesaplar Getirilir." arrow>
            <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
          </Tooltip>
        </Grid>

        <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 6, lg: 4 }}>
          <CustomFormLabel htmlFor="iliskilihesaplar" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
            <Typography variant="subtitle1">İlişkili Hesaplar:</Typography>
          </CustomFormLabel>
          <CustomTextAreaAutoSize id="iliskilihesaplar" value={iliskilihesaplar || ""} fullWidth placeholder="örn. 257,740,730" onChange={(e: any) => setIliskiliHesaplar && setIliskiliHesaplar(e.target.value)} />
          <Tooltip title={`Girilen hesaplar aynı yevmiye numarası içinde birlikte geçmişse ilişkili olarak getirilir. Örn: 257,740,730 yazıldığında bu hesaplardaki en az ikisinin aynı yevmiye kaydında yer aldığı fişler listelenir.`} arrow>
            <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
          </Tooltip>
        </Grid>

        <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 6, lg: 4 }}>
          <CustomFormLabel htmlFor="yevmiyeNolar" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
            <Typography variant="subtitle1">Yevmiye Nolar:</Typography>
          </CustomFormLabel>
          <CustomTextAreaAutoSize id="yevmiyeNolar" value={yevmiyeNolar || ""} fullWidth placeholder="örn. 1,5,10" onChange={(e: any) => setYevmiyeNolar && setYevmiyeNolar(e.target.value)} />
          <Tooltip title="Yazdığınız Yevmiye Nolu Kayıtlar Getirilir." arrow>
            <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
          </Tooltip>
        </Grid>

        <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 6, lg: 4 }}>
          <CustomFormLabel htmlFor="haricYevmiyeNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
            <Typography variant="subtitle1">Hariç Yevmiye No:</Typography>
          </CustomFormLabel>
          <CustomTextAreaAutoSize id="haricYevmiyeNo" value={haricYevmiyeNo || ""} fullWidth placeholder="örn. 3,7" onChange={(e: any) => setHaricYevmiyeNo && setHaricYevmiyeNo(e.target.value)} />
          <Tooltip title="Yazdığınız Yevmiye Nolu Kayıtlar Getirilmez." arrow>
            <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
          </Tooltip>
        </Grid>

        <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 6, lg: 4 }}>
          <CustomFormLabel htmlFor="borcTutarindanFazla" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
            <Typography variant="subtitle1">Borç &gt;:</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="borcTutarindanFazla"
            type="text"
            value={borcInput}
            fullWidth
            inputProps={{ inputMode: "decimal" }}
            onChange={(e: any) => {
              const rawValue = e.target.value;
              setBorcInput(rawValue);
              if (setBorcTutarindanFazla) {
                setBorcTutarindanFazla(parseDecimalInput(rawValue));
              }
            }}
            onBlur={() => {
              const parsed = parseDecimalInput(borcInput);
              setBorcInput(formatToTrN2(parsed));
            }}
          />
          <Tooltip title="Borcu, yazdığınız tutardan fazla olan kayıtlar getirilir." arrow>
            <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
          </Tooltip>
        </Grid>

        <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 6, lg: 4 }}>
          <CustomFormLabel htmlFor="alacakTutarindanFazla" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
            <Typography variant="subtitle1">Alacak &gt;:</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="alacakTutarindanFazla"
            type="text"
            value={alacakInput}
            fullWidth
            inputProps={{ inputMode: "decimal" }}
            onChange={(e: any) => {
              const rawValue = e.target.value;
              setAlacakInput(rawValue);
              if (setAlacakTutarindanFazla) {
                setAlacakTutarindanFazla(parseDecimalInput(rawValue));
              }
            }}
            onBlur={() => {
              const parsed = parseDecimalInput(alacakInput);
              setAlacakInput(formatToTrN2(parsed));
            }}
          />
          <Tooltip title="Alacağı, yazdığınız tutardan fazla olan kayıtlar getirilir." arrow>
            <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
          </Tooltip>
        </Grid>

        <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 6, lg: 4 }}>
          <CustomFormLabel htmlFor="aciklama" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
            <Typography variant="subtitle1">Fiş Açıklama:</Typography>
          </CustomFormLabel>
          <CustomTextAreaAutoSize id="aciklama" value={aciklama || ""} fullWidth placeholder="örn: Kapanış Fişi" onChange={(e: any) => setAciklama && setAciklama(e.target.value)} />
          <Tooltip title="Sadece yazdığınız açıklamayı içeren fişler getirilir." arrow>
            <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
          </Tooltip>
        </Grid>

        
        <Grid display="flex" alignItems="center" size={{ xs: 12, sm: 8, lg: 9 }}>
          <CustomFormLabel htmlFor="hesapNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2, whiteSpace: "nowrap" }}>
            <Typography variant="subtitle1">Detay Kodu:</Typography>
          </CustomFormLabel>
          <CustomTextAreaAutoSize id="hesapNo" value={hesapNo} fullWidth placeholder="örn. 320.01, 120.01" onChange={(e: any) => setHesapNo(e.target.value)} />
          <Tooltip title="Sadece yazdığınız detay kodları getirilir." arrow>
            <InfoOutlined fontSize="small" sx={{ ml: 1, mt: 1, color: 'text.secondary', verticalAlign: 'middle' }} />
          </Tooltip>
        </Grid>

        <Grid size={{ xs: 12, sm: 4, lg: 3 }} display="flex" alignItems="center" justifyContent="flex-start">
          <Button size="medium" variant="contained" color="primary" onClick={handleSubmit} sx={{ width: 200, height: "44px", whiteSpace: "nowrap", borderRadius: 28, textTransform: "none", ml: { xs: 0, sm: 2 } }}>
            <Typography variant="subtitle1">Verileri Getir</Typography>
          </Button>
        </Grid>
      </Grid>
    </div>
    </LocalizationProvider>
  );
};

export default EDefterIncelemeForm;
