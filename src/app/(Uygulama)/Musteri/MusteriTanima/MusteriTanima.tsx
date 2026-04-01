import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
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
  alpha,
} from "@mui/material";
import { useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getMusteriTanimaDetay,
  updateMusteriTanimaDetay,
  uploadAndParseKurumlarBeyannamesi,
} from "@/api/Musteri/MusteriIslemleri";

type OrtakRow = {
  adSoyad: string;
  telefon: string;
  hisseOrani: string;
  adSoyadUnvan: string;
  soyadiUnvani?: string;
  adiUnvaninDevami?: string;
  irtibatTelefonNo?: string;
  adresIrtibat?: string;
  pay?: string;
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

type DovizRow = {
  baslik: string;
  usdTlKarsiligi: string;
  euroTlKarsiligi: string;
  digerDovizTlKarsiligi: string;
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
  dovizPozisyonu: DovizRow[];
  ekBilgiler: SingleRow[];
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
  ekBilgiler: [],
});

const emptyDovizRow = (): DovizRow => ({
  baslik: "",
  usdTlKarsiligi: "",
  euroTlKarsiligi: "",
  digerDovizTlKarsiligi: "",
});

const emptyOrtakRow = (): OrtakRow => ({
  adSoyad: "",
  telefon: "",
  hisseOrani: "",
  adSoyadUnvan: "",
});

const AUTO_SAVE_DELAY_MS = 800;

const cleanupSmmmAdi = (value?: string) =>
  (value ?? "")
    .replace(/Oda\s+Sicil\s+No.*$/i, "")
    .replace(/Vergi\s+Kimlik.*$/i, "")
    .replace(/E-Posta.*$/i, "")
    .replace(/Ä°rtibat\s+Tel.*$/i, "")
    .trim();

const extractPhone = (value?: string) => {
  const text = value ?? "";
  const match = text.match(/(?:\+?90\s*)?(?:0\s*)?[235]\d(?:[\s-]?\d){8,10}/);
  if (!match) {
    return "";
  }

  let digits = match[0].replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length > 10) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }

  return digits;
};

interface Props {
  onSaved?: () => void;
  onRegisterHtmlBuilder?: (builder: () => Promise<string>) => void;
  onRegisterSaveHandler?: (handler: () => Promise<boolean>) => void;
  onRegisterPdfUploadHandler?: (handler: (file: File) => Promise<void>) => void;
}

const MusteriTanima: React.FC<Props> = ({ onSaved, onRegisterHtmlBuilder, onRegisterSaveHandler, onRegisterPdfUploadHandler }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratingFormRef = useRef(true);
  const lastSavedPayloadRef = useRef("");

  const escapeHtml = (value?: string | number | null) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const buildRowsHtml = (rows: string[]) => rows.join("");

  const buildComparisonTableHtml = (title: string, rows: ComparisonRow[]) => `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      <table>
        <thead>
          <tr>
            <th>Finansal Kalem</th>
            <th>Önceki Dönem (${escapeHtml(form.yil - 1)})</th>
            <th>Cari Dönem (${escapeHtml(form.yil)})</th>
          </tr>
        </thead>
        <tbody>
          ${buildRowsHtml(
            rows.map(
              (row) => `
                <tr${row.vurgulu ? ' style="background: #fef3c7; font-weight: 600;"' : ''}>
                  <td><strong>${escapeHtml(row.baslik)}</strong></td>
                  <td class="num">${escapeHtml(row.oncekiYilDegeri)}</td>
                  <td class="num">${escapeHtml(row.cariYilDegeri)}</td>
                </tr>
              `
            )
          )}
        </tbody>
      </table>
    </section>
  `;

  const buildSingleTableHtml = (title: string, rows: SingleRow[], secondHeader: string) => `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      <table>
        <thead>
          <tr>
            <th>Finansal Kalem</th>
            <th>${escapeHtml(secondHeader)}</th>
          </tr>
        </thead>
        <tbody>
          ${buildRowsHtml(
            rows.map(
              (row) => `
                <tr${row.vurgulu ? ' style="background: #fef3c7; font-weight: 600;"' : ''}>
                  <td><strong>${escapeHtml(row.baslik)}</strong></td>
                  <td class="num">${escapeHtml(row.deger)}</td>
                </tr>
              `
            )
          )}
        </tbody>
      </table>
    </section>
  `;

  const buildFullHtmlAsync = useCallback(async () => {
    const infoRows = [
      ["Ticaret Unvanı", form.ticaretUnvani],
      ["Vergi Kimlik Numarası", form.vergiKimlikNumarasi],
      ["Ticaret Sicil No", form.ticaretSicilNo],
      ["Vergi Dairesi", form.vergiDairesi],
      ["Telefon", form.telefon],
      ["E-posta", form.ePosta],
      ["Web Adresi", form.webAdresi],
      ["Şube Sayısı", form.subeSayisi],
      ["Ortalama Çalışan Sayısı", form.personelSayisi],
      ["Stok Değerleme Yöntemi", form.stokDegerlemeYontemi],
    ];

    const ortakRows = form.ortaklar.map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.adSoyad)}</td>
          <td>${escapeHtml(row.telefon)}</td>
          <td class="num">${escapeHtml(row.hisseOrani)}</td>
        </tr>
      `
    );

    const smmmRows = `
      <tr>
        <td>Adı Soyadı</td>
        <td colspan="2">${escapeHtml(form.smmmAdi)}</td>
      </tr>
      <tr>
        <td>Telefon</td>
        <td colspan="2">${escapeHtml(form.smmmTel)}</td>
      </tr>
      <tr>
        <td>E-posta</td>
        <td colspan="2">${escapeHtml(form.smmmEmail)}</td>
      </tr>
    `;

    const transferRows = getPairedRows("transferFiyatlandirmasi", "Alis", "Satis").map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.baslik)}</td>
          <td class="num">${escapeHtml(row.sol)}</td>
          <td class="num">${escapeHtml(row.sag)}</td>
        </tr>
      `
    );

    const dovizRows = form.dovizPozisyonu.map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.baslik)}</td>
          <td class="num">${escapeHtml(row.usdTlKarsiligi)}</td>
          <td class="num">${escapeHtml(row.euroTlKarsiligi)}</td>
          <td class="num">${escapeHtml(row.digerDovizTlKarsiligi)}</td>
        </tr>
      `
    );

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>İşletme Tanıma Raporu - ${escapeHtml(form.ticaretUnvani || 'İşletme')}</title>
  <meta name="author" content="FAS Denetim Sistemi">
  <meta name="description" content="İşletme Tanıma Raporu - ${escapeHtml(form.yil.toString())}">
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm 2.5cm 2cm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #2d3748;
      font-size: 11px;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background: #ffffff;
      counter-reset: section-counter;
    }

    /* Header */
    .report-header {
      text-align: center;
      border-bottom: 4px solid #2b6cb0;
      padding-bottom: 25px;
      margin-bottom: 35px;
      position: relative;
    }

    .report-header::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 4px;
      background: linear-gradient(90deg, #2b6cb0 0%, #3182ce 50%, #2b6cb0 100%);
    }

    h1 {
      font-size: 32px;
      color: #2b6cb0;
      margin: 0 0 15px 0;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .report-meta {
      font-size: 13px;
      color: #4a5568;
      margin: 0;
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meta-label {
      font-weight: 600;
      color: #2b6cb0;
    }

    .meta-value {
      color: #2d3748;
    }

    /* Section Headers */
    h2 {
      font-size: 18px;
      color: #2b6cb0;
      border-bottom: 3px solid #e2e8f0;
      padding-bottom: 10px;
      margin: 35px 0 20px 0;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      counter-increment: section-counter;
      position: relative;
    }

    h2::before {
      content: counter(section-counter) '. ';
      color: #2b6cb0;
      font-weight: 700;
      font-size: 20px;
    }

    h2::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 80px;
      height: 3px;
      background: linear-gradient(90deg, #2b6cb0 0%, #63b3ed 100%);
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 14px 16px;
      vertical-align: top;
      text-align: left;
    }

    th {
      background: linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%);
      color: #ffffff;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      position: sticky;
      top: 0;
    }

    tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    tbody tr:hover {
      background: #edf2f7;
      transition: background-color 0.2s ease;
    }

    .num {
      text-align: right;
      font-family: 'Courier New', 'Monaco', monospace;
      font-weight: 600;
      font-size: 11px;
      color: #2d3748;
    }

    /* Special Sections */
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
      position: relative;
    }

    .info-section {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 25px;
      border-radius: 10px;
      border-left: 5px solid #2b6cb0;
      margin: 20px 0;
    }

    .smmm-section {
      background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      margin: 20px 0;
    }

    .smmm-title {
      font-size: 16px;
      color: #2b6cb0;
      margin-bottom: 15px;
      font-weight: 600;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .notes-section {
      background: linear-gradient(135deg, #fef5e7 0%, #fef3c7 100%);
      padding: 20px;
      border-radius: 8px;
      border-left: 5px solid #ed8936;
      margin: 20px 0;
      border: 2px solid #f6e05e;
    }

    .notes-title {
      font-size: 16px;
      color: #ed8936;
      margin-bottom: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .notes-content {
      background: #ffffff;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      font-style: italic;
      color: #4a5568;
      line-height: 1.7;
    }

    /* Footer */
    .report-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #718096;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .footer-left {
      text-align: left;
    }

    .footer-right {
      text-align: right;
    }

    /* Print Styles */
    @media print {
      body {
        font-size: 10px;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      h1 { font-size: 28px; }
      h2 { font-size: 16px; }
      table { font-size: 9px; }
      th, td { padding: 10px 12px; }

      .report-meta { font-size: 11px; }
      .notes-content { font-size: 10px; }

      .section { page-break-inside: avoid; }
      .info-section, .smmm-section, .notes-section {
        break-inside: avoid;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      .report-meta {
        flex-direction: column;
        gap: 10px;
      }

      .footer-content {
        flex-direction: column;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <h1>İŞLETME TANIMA RAPORU</h1>
    <div class="report-meta">
      <div class="meta-item">
        <span class="meta-label">Denetim Yılı:</span>
        <span class="meta-value">${escapeHtml(form.yil.toString())}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Oluşturulma Tarihi:</span>
        <span class="meta-value">${new Date().toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Rapor No:</span>
        <span class="meta-value">MT-${escapeHtml(form.yil.toString())}-${escapeHtml(user.denetlenenId?.toString() || '')}</span>
      </div>
    </div>
  </div>

  <div class="info-section">
    <h2>KİMLİK VE İLETİŞİM BİLGİLERİ</h2>
    <table>
      <thead>
        <tr><th>Bilgi Alanı</th><th>Değer</th></tr>
      </thead>
      <tbody>
        ${buildRowsHtml(
          infoRows.map(
            ([label, value]) => `
              <tr>
                <td><strong>${escapeHtml(label)}</strong></td>
                <td>${escapeHtml(value)}</td>
              </tr>
            `
          )
        )}
      </tbody>
    </table>
  </div>

  <section class="section">
    <h2>ORTAKLAR</h2>
    <table>
      <thead>
        <tr>
          <th>Adı Soyadı</th>
          <th>İletişim Telefonu</th>
          <th>Hisse Oranı (%)</th>
        </tr>
      </thead>
      <tbody>
        ${buildRowsHtml(ortakRows)}
      </tbody>
    </table>

    <div class="smmm-section">
      <div class="smmm-title">Beyannameyi Gönderen SM / SMMM / YMM Bilgileri</div>
      <table>
        <thead>
          <tr>
            <th>Bilgi Alanı</th>
            <th>Değer</th>
          </tr>
        </thead>
        <tbody>
          ${smmmRows}
        </tbody>
      </table>
    </div>
  </section>

  ${buildComparisonTableHtml(`3. BİLANÇO (${form.yil - 1} - ${form.yil} KARŞILAŞTIRMALI)`, form.bilanco)}
  ${buildComparisonTableHtml(`4. GELİR TABLOSU (${form.yil - 1} - ${form.yil} KARŞILAŞTIRMALI)`, form.gelirTablosu)}
  ${buildSingleTableHtml("5. KURUMLAR VERGİSİ BİLGİLERİ", form.kurumlarVergisi, `${form.yil} (TL)`)}

  <section class="section">
    <h2>6. İLİŞKİLİ TARAF İŞLEMLERİ VE YABANCI PARA POZİSYONU</h2>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>İşlem Türü</th>
          <th>Alış Tutarı (TL)</th>
          <th>Satış Tutarı (TL)</th>
        </tr>
      </thead>
      <tbody>
        ${buildRowsHtml(transferRows)}
      </tbody>
    </table>

    <h2 style="margin-top: 30px;">Döviz Pozisyonu Bilgileri</h2>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Döviz Cinsi</th>
          <th>USD($) TL Karşılığı</th>
          <th>EURO(€) TL Karşılığı</th>
          <th>Diğer Dövizler TL Karşılığı</th>
        </tr>
      </thead>
      <tbody>
        ${buildRowsHtml(dovizRows)}
      </tbody>
    </table>
  </section>

  ${buildSingleTableHtml("7. EK BİLGİLER", form.ekBilgiler, "Değer")}

  <div class="notes-section">
    <div class="notes-title">ÖZEL NOTLAR VE AÇIKLAMALAR</div>
    <div class="notes-content">
      ${escapeHtml(form.notlar) || '<em>Herhangi bir özel not bulunmuyor.</em>'}
    </div>
  </div>

  <div class="report-footer">
    <div class="footer-content">
      <div class="footer-left">
        <strong>FAS Denetim Sistemi</strong><br>
        Bu rapor elektronik ortamda oluşturulmuştur.
      </div>
      <div class="footer-right">
        Sayfa 1/1<br>
        <small>Oluşturulma: ${new Date().toLocaleString('tr-TR')}</small>
      </div>
    </div>
  </div>
</body>
</html>`.trim();
  }, [form]);

  useEffect(() => {
    onRegisterHtmlBuilder?.(buildFullHtmlAsync);
  }, [buildFullHtmlAsync, onRegisterHtmlBuilder]);

  const buildSavePayload = useCallback((currentForm: FormState) => ({
    ...currentForm,
    ortaklar: currentForm.ortaklar.map((row) => ({
      adSoyad: row.adSoyad.trim(),
      telefon: row.telefon.trim(),
      hisseOrani: row.hisseOrani.trim(),
      adSoyadUnvan: row.adSoyad.trim(),
    })),
    denetciId: user.denetciId ?? currentForm.denetciId ?? 0,
    denetlenenId: user.denetlenenId,
    yil: user.yil,
    subeSayisi: currentForm.subeSayisi ? Number(currentForm.subeSayisi) : null,
    personelSayisi: currentForm.personelSayisi ? Number(currentForm.personelSayisi) : null,
  }), [user.denetciId, user.denetlenenId, user.yil]);

  const loadData = useCallback(async () => {
    if (!user.denetlenenId || !user.yil) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getMusteriTanimaDetay(user.denetlenenId, user.yil);
      const payload = result?.data ?? result?.Data ?? result;
      const nextForm: FormState = {
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
        smmmAdi: cleanupSmmmAdi(payload?.smmmAdi),
        smmmTcVkn: payload?.smmmTcVkn ?? "",
        smmmOdaNo: payload?.smmmOdaNo ?? "",
        smmmEmail: payload?.smmmEmail ?? "",
        smmmTel: payload?.smmmTel ?? "",
        notlar: payload?.notlar ?? "",
        ortaklar: (payload?.ortaklar ?? [])
          .map((row: Partial<OrtakRow>) => ({
            ...emptyOrtakRow(),
            ...row,
            adSoyad: row?.adSoyad ?? row?.adSoyadUnvan ?? [row?.adiUnvaninDevami, row?.soyadiUnvani].filter(Boolean).join(" ").trim(),
            telefon: row?.telefon ?? row?.irtibatTelefonNo ?? extractPhone(row?.adresIrtibat) ?? "",
            hisseOrani: row?.hisseOrani ?? row?.pay?.replace("%", "") ?? "",
            adSoyadUnvan: row?.adSoyadUnvan ?? row?.adSoyad ?? [row?.adiUnvaninDevami, row?.soyadiUnvani].filter(Boolean).join(" ").trim(),
          }))
          .filter((row: OrtakRow) => Boolean(row.adSoyad || row.telefon || row.hisseOrani)),
        gelirTablosu: payload?.gelirTablosu ?? [],
        bilanco: payload?.bilanco ?? [],
        kurumlarVergisi: payload?.kurumlarVergisi ?? [],
        transferFiyatlandirmasi: payload?.transferFiyatlandirmasi ?? [],
        dovizPozisyonu: payload?.dovizPozisyonu ?? [],
        ekBilgiler: payload?.ekBilgiler ?? [],
      };

      hydratingFormRef.current = true;
      lastSavedPayloadRef.current = JSON.stringify(buildSavePayload(nextForm));
      setForm(nextForm);
    } catch (error) {
      console.error("Musteri tanima yukleme hatasi:", error);
      enqueueSnackbar("Musteri tanima belgesi yuklenemedi.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [buildSavePayload, enqueueSnackbar, user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setField = (field: keyof FormState, value: string | number | OrtakRow[] | ComparisonRow[] | SingleRow[] | DovizRow[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const persistForm = useCallback(async (
    currentForm: FormState,
    options?: { showSuccess?: boolean }
  ) => {
    if (!user.denetlenenId || !user.yil) {
      return false;
    }

    const payload = buildSavePayload(currentForm);
    const payloadSignature = JSON.stringify(payload);

    setSaving(true);
    try {
      const response = await updateMusteriTanimaDetay(payload);

      if (response?.success) {
        lastSavedPayloadRef.current = payloadSignature;
        if (options?.showSuccess) {
          enqueueSnackbar("Musteri tanima belgesi kaydedildi.", { variant: "success" });
        }
        onSaved?.();
        return true;
      } else {
        enqueueSnackbar(response?.message || "Kaydetme islemi basarisiz oldu.", { variant: "error" });
        return false;
      }
    } catch (error) {
      console.error("Kaydetme hatasi:", error);
      enqueueSnackbar("Belge kaydedilirken hata olustu.", { variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    buildSavePayload,
    enqueueSnackbar,
    onSaved,
    user.denetlenenId,
    user.yil,
  ]);

  const handleSave = useCallback(async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    return persistForm(form, { showSuccess: false });
  }, [form, persistForm]);

  useEffect(() => {
    onRegisterSaveHandler?.(handleSave);
  }, [handleSave, onRegisterSaveHandler]);

  useEffect(() => {
    if (loading || parsing) return;

    if (hydratingFormRef.current) {
      hydratingFormRef.current = false;
      return;
    }

    const payloadSignature = JSON.stringify(buildSavePayload(form));
    if (payloadSignature === lastSavedPayloadRef.current) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      void persistForm(form);
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [buildSavePayload, form, loading, parsing, persistForm]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const processPdfUpload = useCallback(async (file: File) => {
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
    }
  }, [enqueueSnackbar, loadData, onSaved, user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    onRegisterPdfUploadHandler?.(processPdfUpload);
  }, [onRegisterPdfUploadHandler, processPdfUpload]);

  const updateOrtak = (index: number, field: keyof OrtakRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      ortaklar: prev.ortaklar.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
              adSoyadUnvan: field === "adSoyad" ? value : row.adSoyadUnvan,
            }
          : row
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
      ortaklar: [...prev.ortaklar, emptyOrtakRow()],
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

  const updateSingleRow = (
    field: "kurumlarVergisi" | "transferFiyatlandirmasi" | "ekBilgiler",
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
    field: "kurumlarVergisi" | "transferFiyatlandirmasi" | "ekBilgiler",
    row: SingleRow = { baslik: "", deger: "" }
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] as SingleRow[]), row],
    }));
  };

  const removeSingleRow = (
    field: "kurumlarVergisi" | "transferFiyatlandirmasi" | "ekBilgiler",
    index: number
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] as SingleRow[]).filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const updateDovizRow = (index: number, key: keyof DovizRow, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      dovizPozisyonu: prev.dovizPozisyonu.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const addDovizRow = (row: DovizRow = emptyDovizRow()) => {
    setForm((prev) => ({
      ...prev,
      dovizPozisyonu: [...prev.dovizPozisyonu, row],
    }));
  };

  const removeDovizRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      dovizPozisyonu: prev.dovizPozisyonu.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const getPairedRows = (
    field: "transferFiyatlandirmasi",
    leftSuffix: string,
    rightSuffix: string
  ) => {
    const rows = form[field] as SingleRow[];
    const order: string[] = [];
    const map = new Map<string, { baslik: string; sol: string; sag: string; vurgulu?: boolean }>();

    rows.forEach((row) => {
      let baseTitle = row.baslik;
      let side: "sol" | "sag" | null = null;

      if (row.baslik.endsWith(` - ${leftSuffix}`)) {
        baseTitle = row.baslik.slice(0, -(` - ${leftSuffix}`).length);
        side = "sol";
      } else if (row.baslik.endsWith(` - ${rightSuffix}`)) {
        baseTitle = row.baslik.slice(0, -(` - ${rightSuffix}`).length);
        side = "sag";
      }

      if (!side) {
        return;
      }

      if (!map.has(baseTitle)) {
        map.set(baseTitle, { baslik: baseTitle, sol: "", sag: "", vurgulu: row.vurgulu });
        order.push(baseTitle);
      }

      const current = map.get(baseTitle)!;
      current[side] = row.deger;
      current.vurgulu = current.vurgulu || row.vurgulu;
    });

    return order.map((title) => map.get(title)!);
  };

  const upsertPairedRows = (
    field: "transferFiyatlandirmasi",
    currentTitle: string,
    nextTitle: string,
    leftValue: string,
    rightValue: string,
    leftSuffix: string,
    rightSuffix: string,
    vurgulu?: boolean
  ) => {
    setForm((prev) => {
      const filtered = (prev[field] as SingleRow[]).filter(
        (row) =>
          row.baslik !== `${currentTitle} - ${leftSuffix}` &&
          row.baslik !== `${currentTitle} - ${rightSuffix}`
      );

      if (!nextTitle.trim() && !leftValue.trim() && !rightValue.trim()) {
        return { ...prev, [field]: filtered };
      }

      return {
        ...prev,
        [field]: [
          ...filtered,
          { baslik: `${nextTitle} - ${leftSuffix}`, deger: leftValue, vurgulu },
          { baslik: `${nextTitle} - ${rightSuffix}`, deger: rightValue, vurgulu },
        ],
      };
    });
  };

  const addPairedRow = (
    field: "transferFiyatlandirmasi",
    leftSuffix: string,
    rightSuffix: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: [
        ...(prev[field] as SingleRow[]),
        { baslik: `Yeni Kalem - ${leftSuffix}`, deger: "" },
        { baslik: `Yeni Kalem - ${rightSuffix}`, deger: "" },
      ],
    }));
  };

  const renderPairedSingleRowTable = (
    title: string,
    field: "transferFiyatlandirmasi",
    firstHeader: string,
    secondHeader: string,
    leftSuffix: string,
    rightSuffix: string
  ) => {
    const rows = getPairedRows(field, leftSuffix, rightSuffix);

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h5" sx={sectionTitleSx}>
            {title}
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => addPairedRow(field, leftSuffix, rightSuffix)}>
            Satır Ekle
          </Button>
        </Box>
        <TableContainer component={Paper} variant="outlined" sx={scrollTableContainerSx}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellSx}>Kalem</TableCell>
                <TableCell sx={headerCellSx}>{firstHeader}</TableCell>
                <TableCell sx={headerCellSx}>{secondHeader}</TableCell>
                <TableCell sx={headerCellSx} width={70}>Sil</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={`${field}-${row.baslik}-${index}`}>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.baslik}
                      onChange={(event) => upsertPairedRows(field, row.baslik, event.target.value, row.sol, row.sag, leftSuffix, rightSuffix, row.vurgulu)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.sol}
                      onChange={(event) => upsertPairedRows(field, row.baslik, row.baslik, event.target.value, row.sag, leftSuffix, rightSuffix, row.vurgulu)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.sag}
                      onChange={(event) => upsertPairedRows(field, row.baslik, row.baslik, row.sol, event.target.value, leftSuffix, rightSuffix, row.vurgulu)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => upsertPairedRows(field, row.baslik, "", "", "", leftSuffix, rightSuffix)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    PDF'ten gelen satırlar burada listelenecek.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderDovizTable = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" sx={subSectionTitleSx}>
          YABANCI PARA POZİSYONUNA İLİŞKİN BİLGİLER
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={() => addDovizRow()}>
          Satır Ekle
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined" sx={scrollTableContainerSx}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Aciklama</TableCell>
              <TableCell sx={headerCellSx}>USD($) TL Karsiligi</TableCell>
              <TableCell sx={headerCellSx}>EURO(â‚¬) TL Karsiligi</TableCell>
              <TableCell sx={headerCellSx}>Diger Doviz Cinslerinin TL Karsiligi</TableCell>
              <TableCell sx={headerCellSx} width={70}>Sil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {form.dovizPozisyonu.map((row, index) => (
              <TableRow key={`doviz-${index}`}>
                <TableCell>
                  <TextField fullWidth size="small" value={row.baslik} onChange={(event) => updateDovizRow(index, "baslik", event.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField fullWidth size="small" value={row.usdTlKarsiligi} onChange={(event) => updateDovizRow(index, "usdTlKarsiligi", event.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField fullWidth size="small" value={row.euroTlKarsiligi} onChange={(event) => updateDovizRow(index, "euroTlKarsiligi", event.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField fullWidth size="small" value={row.digerDovizTlKarsiligi} onChange={(event) => updateDovizRow(index, "digerDovizTlKarsiligi", event.target.value)} />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="error" onClick={() => removeDovizRow(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {form.dovizPozisyonu.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  PDF'ten gelen döviz pozisyonu satırları burada listelenecek.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const sectionTitleSx = {
    color: theme.palette.secondary.main,
    borderBottom: `3px solid ${theme.palette.secondary.main}`,
    mb: 3,
    pb: 1,
    fontWeight: 600,
    textTransform: "uppercase" as const,
  };

  const subSectionTitleSx = {
    color: alpha(theme.palette.secondary.main, 0.7),
    borderBottom: `1px solid ${theme.palette.secondary.light}`,
    mb: 2,
    pb: 0.5,
    fontWeight: 600,
    fontSize: "1.1rem",
  };

  const headerCellSx = {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontWeight: 600,
  };

  const scrollTableContainerSx = {
    maxHeight: { xs: 420, md: 520 },
    overflow: "auto",
    "& .MuiTable-stickyHeader th": {
      zIndex: 2,
    },
  };

  const highlightedRowSx = {
    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
    "& .MuiInputBase-input": {
      fontWeight: 700,
    },
  };

  const getComparisonRowLevel = (title: string) => {
    const trimmed = title.trim();
    const normalized = trimmed.replace(/^[.\-\s]+/, "");

    if (/^(?:[IVXLCDM]+)(?:[.)\-\s]|$)/i.test(normalized)) {
      return "roman" as const;
    }

    if (/^[A-ZÃ‡ÄÄ°Ã–ÅÃœ](?:[.)\-\s]|$)/.test(normalized)) {
      return "letter" as const;
    }

    if (/^\d+(?:[.)\-\s]|$)/.test(normalized)) {
      return "number" as const;
    }

    return "normal" as const;
  };

  const getComparisonRowSx = (title: string) => {
    const level = getComparisonRowLevel(title);

    if (level === "roman") {
      return {
        backgroundColor: alpha(theme.palette.secondary.main, 0.15),
        "& .MuiInputBase-input": {
          fontWeight: 600,
          color: theme.palette.secondary.dark,
        },
      };
    }

    if (level === "letter") {
      return {
        backgroundColor: alpha(theme.palette.secondary.main, 0.05),
        "& .MuiInputBase-input": {
          fontWeight: 600,
          color: theme.palette.secondary.main,
        },
      };
    }

    if (level === "number") {
      return {
        "& .MuiInputBase-input": {
          paddingLeft: "16px",
        },
      };
    }

    return undefined;
  };

  const renderInfoTable = () => {
    const rows = [
      { label: "Ticaret Unvanı", value: form.ticaretUnvani, key: "ticaretUnvani" },
      { label: "Vergi Kimlik Numarası", value: form.vergiKimlikNumarasi, key: "vergiKimlikNumarasi" },
      { label: "Ticaret Sicil No", value: form.ticaretSicilNo, key: "ticaretSicilNo" },
      { label: "Vergi Dairesi", value: form.vergiDairesi, key: "vergiDairesi" },
      { label: "Telefon", value: form.telefon, key: "telefon" },
      { label: "E-posta", value: form.ePosta, key: "ePosta" },
      { label: "Web Adresi", value: form.webAdresi, key: "webAdresi" },
      { label: "Şube Sayısı", value: form.subeSayisi, key: "subeSayisi" },
      { label: "Ortalama Çalışan Sayısı", value: form.personelSayisi, key: "personelSayisi" },
      { label: "Stok Değerleme Yöntemi", value: form.stokDegerlemeYontemi, key: "stokDegerlemeYontemi" },
    ] as const;

    return (
      <TableContainer component={Paper} variant="outlined" sx={scrollTableContainerSx}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Bilgi Alanı</TableCell>
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
          Satır Ekle
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined" sx={scrollTableContainerSx}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Açıklama</TableCell>
              <TableCell sx={headerCellSx}>Önceki Dönem ({form.yil - 1})</TableCell>
              <TableCell sx={headerCellSx}>Cari Dönem ({form.yil})</TableCell>
              <TableCell sx={headerCellSx} width={70}>Sil</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, borderBottom: "none", width: "48%" }}>Kalem</TableCell>
              <TableCell sx={{ ...headerCellSx, borderBottom: "none", width: "22%" }}>TL</TableCell>
              <TableCell sx={{ ...headerCellSx, borderBottom: "none", width: "22%" }}>TL</TableCell>
              <TableCell sx={{ ...headerCellSx, borderBottom: "none" }} width={70}>Sil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {form[field].map((row, index) => (
              <TableRow key={`${field}-${index}`} sx={getComparisonRowSx(row.baslik)}>
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
            {form[field].length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  PDF'ten gelen satırlar burada sırayla listelenecek.
                </TableCell>
              </TableRow>
            )}
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
      <Box display="flex" justifyContent="flex-start" alignItems={{ xs: "flex-start", md: "center" }} flexDirection={{ xs: "column", md: "row" }} gap={1.5} mb={4}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: { md: "auto" } }}>
          Değişiklikler otomatik kaydedilir.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" sx={sectionTitleSx}>
            1. KİMLİK VE İLETİŞİM BİLGİLERİ
          </Typography>
          {renderInfoTable()}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h5" sx={sectionTitleSx}>
              2. ORTAKLAR
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addOrtak}>
              Ortak Ekle
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={scrollTableContainerSx}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Adı Soyadı</TableCell>
                  <TableCell sx={headerCellSx}>Telefon</TableCell>
                  <TableCell sx={headerCellSx}>Hisse Oranı</TableCell>
                  <TableCell sx={headerCellSx} width={70}>Sil</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.ortaklar.map((row, index) => (
                  <TableRow key={`ortak-${index}`}>
                    <TableCell>
                      <TextField fullWidth size="small" value={row.adSoyad} onChange={(event) => updateOrtak(index, "adSoyad", event.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={row.telefon} onChange={(event) => updateOrtak(index, "telefon", event.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={row.hisseOrani} onChange={(event) => updateOrtak(index, "hisseOrani", event.target.value)} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => removeOrtak(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3}>
            <Typography variant="h6" sx={subSectionTitleSx}>
              2.1 MALİ MÜŞAVİR
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Adı Soyadı</TableCell>
                    <TableCell sx={headerCellSx}>Telefon</TableCell>
                    <TableCell sx={headerCellSx}>E-posta</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <TextField fullWidth size="small" value={form.smmmAdi} onChange={(event) => setField("smmmAdi", event.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={form.smmmTel} onChange={(event) => setField("smmmTel", event.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" value={form.smmmEmail} onChange={(event) => setField("smmmEmail", event.target.value)} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          {renderComparisonTable(`3. BİLANÇO (${form.yil - 1} - ${form.yil} KARŞILAŞTIRMALI)`, "bilanco")}
        </Grid>

        <Grid size={{ xs: 12 }}>
          {renderComparisonTable(`4. GELİR TABLOSU (${form.yil - 1} - ${form.yil} KARŞILAŞTIRMALI)`, "gelirTablosu")}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" sx={sectionTitleSx}>
            5. KURUMLAR VERGİSİ BİLGİLERİ
          </Typography>
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <Button startIcon={<AddIcon />} onClick={() => addSingleRow("kurumlarVergisi")}>
              Satır Ekle
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={scrollTableContainerSx}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Kalem</TableCell>
                  <TableCell sx={headerCellSx}>{form.yil} (TL)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.kurumlarVergisi.map((row, index) => (
                  <TableRow key={`${row.baslik}-${index}`}>
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
                      PDF'ten gelen kurumlar vergisi satırları burada listelenecek.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12 }}>
          {renderPairedSingleRowTable(
            "6. İLİŞKİLİ TARAF İŞLEMLERİ VE YABANCI PARA POZİSYONU",
            "transferFiyatlandirmasi",
            "Alış (TL)",
            "Satış (TL)",
            "Alış",
            "Satış"
          )}

          <Box mt={3}>
            {renderDovizTable()}
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" sx={sectionTitleSx}>
            7. EK BİLGİLER
          </Typography>
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <Button startIcon={<AddIcon />} onClick={() => addSingleRow("ekBilgiler")}>
              Satır Ekle
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={scrollTableContainerSx}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Bilgi</TableCell>
              <TableCell sx={headerCellSx}>Değer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.ekBilgiler.map((row, index) => (
                  <TableRow key={`${row.baslik}-${index}`}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={row.baslik}
                        onChange={(event) => updateSingleRow("ekBilgiler", index, "baslik", event.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} alignItems="center">
                        <TextField
                          fullWidth
                          size="small"
                          value={row.deger}
                          onChange={(event) => updateSingleRow("ekBilgiler", index, "deger", event.target.value)}
                        />
                        <IconButton color="error" onClick={() => removeSingleRow("ekBilgiler", index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {form.ekBilgiler.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      PDF'ten gelen ek bilgiler burada listelenecek.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" sx={sectionTitleSx}>
            8. NOTLAR
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={form.notlar}
            onChange={(event) => setField("notlar", event.target.value)}
            placeholder="Belgeye ilave açıklamalar ekleyebilirsiniz."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MusteriTanima;
