"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CalismaKagitiHotTable, {
  riskRenderer,
  durumRenderer,
  bdsRefRenderer,
  islemRenderer,
} from "@/components/CalismaKagitiHotTable";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert as MuiAlert,
  Typography,
  Stack,
  Alert,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  IsletmeyeIliskinIcKontrolTespitRow,
  getIsletmeyeIliskinIcKontrolTespitByDenetlenen,
  kaydetIsletmeyeIliskinIcKontrolTespit,
  varsayilanaDonIsletmeyeIliskinIcKontrolTespit,
} from "@/api/CalismaKagitlari/IsletmeyeIliskinIcKontrolTespit";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";

type MuiChipColor = "error" | "warning" | "info" | "success" | "default";

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
}

interface RowData {
  satirNo: number | string;
  bolum: string;
  konu: string;
  islem: string;
  durum: string;
  riskSeviyesi: string;
  tespit: string;
  ilgiliBds: string;
  bdsReferansi: string;
  id: number;
  evetIcerik?: string | null;
  hayirIcerik?: string | null;
  evetDenetimAksiyonu?: string | null;
  hayirDenetimAksiyonu?: string | null;
  evetRiskSeviyesi?: string | null;
  hayirRiskSeviyesi?: string | null;
  standartmi?: boolean | null;
}

const COL_SATIR_NO = 0;
const COL_BOLUM = 1;
const COL_KONU = 2;
const COL_SORU = 3;
const COL_DURUM = 4;
const COL_RISK = 5;
const COL_TESPIT = 6;
const COL_AKSIYON = 7;
const COL_BDS_REF = 8;

const SOFT_SURFACE = "#f8f7f4";
const SOFT_BORDER = "#e7e2d8";

const summaryCardStyles = {
  "Toplam soru": { bg: "#f5f3ee", border: "#e5ddd0", text: "#5c5548" },
  "Hayır seçimi": { bg: "#fbf4ea", border: "#ecdac0", text: "#8a6a3f" },
  "Kritik soru": { bg: "#f8efee", border: "#e7d3d0", text: "#8a605d" },
  "Yüksek riskli soru": { bg: "#f3f4f1", border: "#d9ddd3", text: "#5d6c5a" },
} as const;

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLocaleUpperCase("tr-TR");
}

const IsletmeyeIliskinIcKontrolTespitTable: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const hotRef = useRef<any>(null);

  const [rows, setRows] = useState<IsletmeyeIliskinIcKontrolTespitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHotDirty, setIsHotDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");

  const [activeSheet, setActiveSheet] = useState("İç Kontrol Belgesi");
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("Tümü");
  const [yalnizcaHayirlar, setYalnizcaHayirlar] = useState(false);

  const tableDataRef = useRef<RowData[]>([]);
  const changedRowIdsRef = useRef<Set<number>>(new Set());

  // ── Veri yükleme ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    try {
      const resp = await getIsletmeyeIliskinIcKontrolTespitByDenetlenen(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );
      setRows(resp);
      setIsHotDirty(false);
      changedRowIdsRef.current.clear();
    } catch {
      enqueueSnackbar("Veriler yüklenemedi", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleVarsayilanaDon();
    }
  }, [isClickedVarsayilanaDon]);

  const handleVarsayilanaDon = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) {
      setIsClickedVarsayilanaDon(false);
      return;
    }

    setLoading(true);
    try {
      const deleteSuccess = await varsayilanaDonIsletmeyeIliskinIcKontrolTespit(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );

      if (deleteSuccess) {
        enqueueSnackbar("Veriler varsayılana döndürüldü", { variant: "success" });
        await fetchData();
      } else {
        enqueueSnackbar("Varsayılana dönüş başarısız oldu", { variant: "error" });
      }
    } catch (error) {
      console.error("Varsayılana dönüş hatası:", error);
      enqueueSnackbar("Bir hata oluştu", { variant: "error" });
    } finally {
      setLoading(false);
      setIsClickedVarsayilanaDon(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, fetchData, setIsClickedVarsayilanaDon, enqueueSnackbar]);

  // ── Tablo verisi ─────────────────────────────────────────────────────────────

  const baseTableData = useMemo<RowData[]>(
    () =>
      rows.map((row, index) => {
        const durum = row.durum ?? "Evet";
        const riskSeviyesi = durum === "Evet" ? (row.evetRiskSeviyesi ?? "-") : (row.hayirRiskSeviyesi ?? "-");
        
        return {
          satirNo: row.satirNo ?? index + 1,
          bolum: row.bolum ?? "-",
          konu: row.konu ?? "Genel",
          islem: row.islem ?? "",
          durum,
          riskSeviyesi,
          tespit: row.tespit ?? (durum === "Evet" ? (row.evetIcerik ?? "") : (row.hayirIcerik ?? "")),
          ilgiliBds: row.ilgiliBds ?? (durum === "Evet" ? (row.evetDenetimAksiyonu ?? "") : (row.hayirDenetimAksiyonu ?? "")),
          bdsReferansi: row.ilgiliBds ?? "", // Salt okunur orijinal BDS
          id: row.id,
          evetIcerik: row.evetIcerik ?? "",
          hayirIcerik: row.hayirIcerik ?? "",
          evetDenetimAksiyonu: row.evetDenetimAksiyonu ?? "",
          hayirDenetimAksiyonu: row.hayirDenetimAksiyonu ?? "",
          evetRiskSeviyesi: row.evetRiskSeviyesi ?? "",
          hayirRiskSeviyesi: row.hayirRiskSeviyesi ?? "",
          standartmi: row.standartmi,
        };
      }),
    [rows]
  );

  const tableData = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("tr-TR");
    return baseTableData.filter((row) => {
      const matchesRisk = riskFilter === "Tümü" || normalizeText(row.riskSeviyesi) === normalizeText(riskFilter);
      const matchesSearch = query.length === 0 || [row.bolum, row.konu, row.islem, row.tespit, row.ilgiliBds, row.bdsReferansi].join(" ").toLocaleLowerCase("tr-TR").includes(query);
      const matchesHayirFilter = !yalnizcaHayirlar || row.durum === "Hayır";
      return matchesRisk && matchesSearch && matchesHayirFilter;
    });
  }, [baseTableData, riskFilter, searchTerm, yalnizcaHayirlar]);

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  const stats = useMemo(() => {
    const hayirCount = baseTableData.filter((r) => r.durum?.trim() === "Hayır").length;
    const kritikCount = baseTableData.filter((r) => r.riskSeviyesi?.toUpperCase() === "KRİTİK").length;
    const yuksekCount = baseTableData.filter((r) => r.riskSeviyesi?.toUpperCase() === "YÜKSEK").length;
    return { hayirCount, kritikCount, yuksekCount, toplam: baseTableData.length };
  }, [baseTableData]);

  const answeredCount = baseTableData.filter((r) => r.durum?.trim()).length;

  useEffect(() => {
    setTamamlanan(answeredCount);
    setToplam(baseTableData.length);
  }, [answeredCount, baseTableData.length, setTamamlanan, setToplam]);

  const colHeaders = useMemo(
    () => [
      "No",
      "Bölüm",
      "Alt Bölüm",
      "Kontrol Sorusu",
      "Yanıt",
      "Risk",
      "Açıklama Metni",
      "Denetim Adımı",
      "İlgili BDS",
    ],
    []
  );

  const customTespitRenderer = useCallback(function (this: any, ...args: any[]) {
    const [instance, td, row, col, prop, value] = args;
    const durum = instance.getDataAtCell(row, COL_DURUM);
    const rowData = tableDataRef.current[row];
    
    let displayValue = value;
    let isPlaceholder = false;
    
    if (!value || String(value).trim() === "") {
        displayValue = durum === "Hayır" ? (rowData?.hayirIcerik ?? "") : (rowData?.evetIcerik ?? "");
        isPlaceholder = true;
    }
    
    td.style.padding = "0";
    td.style.overflow = "hidden";
    td.style.verticalAlign = "top";

    td.innerHTML = "";
    const div = document.createElement("div");
    div.style.fontSize = "0.82rem";
    div.style.lineHeight = "1.5";
    div.style.whiteSpace = "pre-wrap";
    div.style.overflow = "hidden";
    div.style.maxHeight = "68px";
    div.style.padding = "6px 4px";
    div.style.boxSizing = "border-box";
    div.style.fontFamily = "inherit";
    
    if (isPlaceholder) {
      div.style.color = "#999999";
      div.style.fontStyle = "italic";
    }
    
    const text = String(displayValue ?? "");
    div.textContent = text;
    if (text && !isPlaceholder) div.title = text;
    td.appendChild(div);
  }, []);

  const columns = useMemo(
    () => [
      { type: "text" as const, readOnly: false, width: 40, editor: "speech-text" }, // 0: No
      { type: "text" as const, readOnly: false, width: 80, renderer: islemRenderer, editor: "speech-text" }, // 1: Bölüm
      { type: "text" as const, readOnly: false, width: 100, renderer: islemRenderer, editor: "speech-text" }, // 2: Alt Bölüm
      { type: "text" as const, readOnly: false, width: 220, renderer: islemRenderer, editor: "speech-text" }, // 3: Soru
      {
        type: "dropdown" as const,
        source: ["Evet", "Hayır"],
        width: 80,
        renderer: durumRenderer,
      }, // 4: Yanıt
      { type: "text" as const, readOnly: false, width: 90, renderer: riskRenderer, editor: "speech-text" }, // 5: Risk
      {
        type: "text" as const,
        width: 320,
        renderer: customTespitRenderer,
        editor: "speech-text",
      }, // 6: Açıklama Metni
      {
        type: "text" as const,
        width: 250,
        renderer: islemRenderer,
        editor: "speech-text",
      }, // 7: Denetim Adımı (Aksiyon)
      { type: "text" as const, readOnly: false, width: 100, renderer: bdsRefRenderer, editor: "speech-text" }, // 8: İlgili BDS
    ],
    []
  );

  const editableColumnIndices = useMemo(() => [COL_SATIR_NO, COL_BOLUM, COL_KONU, COL_SORU, COL_DURUM, COL_RISK, COL_TESPIT, COL_AKSIYON, COL_BDS_REF], []);

  const hotData = useMemo(
    () =>
      tableData.map((row) => [
        row.satirNo,
        row.bolum,
        row.konu,
        row.islem,
        row.durum,
        row.riskSeviyesi,
        row.tespit,
        row.ilgiliBds,
        row.bdsReferansi,
        row.id,
      ]),
    [tableData]
  );

  // ── Sayfa terk uyarısı ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isHotDirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor || !anchor.getAttribute("href")?.startsWith("/")) return;
      e.preventDefault();
      setTargetUrl(anchor.getAttribute("href")!);
      setConfirmDialogOpen(true);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [isHotDirty]);

  // ── Handsontable event handlers ───────────────────────────────────────────────

  const handleAfterChange = useCallback(
    function (this: any, change: any[] | null, source: string) {
      if (!change || !change.length || source === "loadData") return;
      setIsHotDirty(true);
      change.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        const rowData = tableDataRef.current[row];
        if (rowData?.id) {
          changedRowIdsRef.current.add(rowData.id);
        }

        if ((prop === "durum" || prop === COL_DURUM) && newValue?.trim()) {
          const hot = this;
          const currentTespit = hot.getDataAtCell(row, COL_TESPIT) ?? "";
          const currentAksiyon = hot.getDataAtCell(row, COL_AKSIYON) ?? "";
          
          const isOldEvet = oldValue === "Evet";
          const isNewEvet = newValue === "Evet";

          const oldAciklamaTemplate = isOldEvet ? rowData?.evetIcerik || "" : rowData?.hayirIcerik || "";
          const newAciklamaTemplate = isNewEvet ? rowData?.evetIcerik || "" : rowData?.hayirIcerik || "";

          const oldAksiyonTemplate = isOldEvet ? rowData?.evetDenetimAksiyonu || "" : rowData?.hayirDenetimAksiyonu || "";
          const newAksiyonTemplate = isNewEvet ? rowData?.evetDenetimAksiyonu || "" : rowData?.hayirDenetimAksiyonu || "";
          
          const newRisk = isNewEvet ? (rowData?.evetRiskSeviyesi ?? "-") : (rowData?.hayirRiskSeviyesi ?? "-");
          setTimeout(() => hot.setDataAtCell(row, COL_RISK, newRisk), 0);

          if (currentTespit === "" || currentTespit.trim() === oldAciklamaTemplate.trim()) {
            setTimeout(() => hot.setDataAtCell(row, COL_TESPIT, newAciklamaTemplate), 0);
          }
          
          if (currentAksiyon === "" || currentAksiyon.trim() === oldAksiyonTemplate.trim()) {
            setTimeout(() => hot.setDataAtCell(row, COL_AKSIYON, newAksiyonTemplate), 0);
          }
        }
        
        // Tracking changes directly to textfields in case
        if (prop === COL_TESPIT || prop === COL_AKSIYON) {
           // changes caught, dirty tag tracked via top logic constraint
        }
      });
    },
    []
  );

  const handleAfterCreateRow = useCallback(
    function (this: any, index: number, amount: number) {
      setIsHotDirty(true);
      const hot = this;
      for (let i = index; i < index + amount; i++) {
        hot.setDataAtCell(i, COL_DURUM, "Evet");
        hot.setDataAtCell(i, 9, 0, "internal"); // id=0 → yeni kayıt
      }
    },
    []
  );

  // ── Kaydet ───────────────────────────────────────────────────────────────────

  const handleKaydet = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    setSaving(true);
    try {
      const sourceData = hot.getSourceData() as any[][];
      
      const satirlar = sourceData
        .map((rowArr) => ({
          id: Number(rowArr[9] || 0),
          satirNo: rowArr[COL_SATIR_NO] ? Number(rowArr[COL_SATIR_NO]) : null,
          bolum: (rowArr[COL_BOLUM] ?? "").toString(),
          konu: (rowArr[COL_KONU] ?? "").toString(),
          islem: (rowArr[COL_SORU] ?? "").toString(),
          durum: (rowArr[COL_DURUM] ?? "Evet").toString(),
          riskSeviyesi: (rowArr[COL_RISK] ?? "").toString(),
          tespit: (rowArr[COL_TESPIT] ?? "").toString(),
          ilgiliBds: (rowArr[COL_AKSIYON] ?? "").toString(),
        }))
        .filter(item => item.id === 0 || changedRowIdsRef.current.has(item.id));
      
      if (satirlar.length === 0) {
        enqueueSnackbar("Değişiklik yapılmadı", { variant: "info" });
        setSaving(false);
        return;
      }

      const success = await kaydetIsletmeyeIliskinIcKontrolTespit({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar,
      });

      if (success) {
        setIsHotDirty(false);
        changedRowIdsRef.current.clear();
        enqueueSnackbar("Veriler başarıyla kaydedildi", { variant: "success" });
        await fetchData();
      } else {
        enqueueSnackbar("Veriler kaydedilemedi. Lütfen tekrar deneyin.", { variant: "error" });
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      enqueueSnackbar("Bir hata oluştu. Lütfen tekrar deneyin.", { variant: "error" });
    } finally {
      setSaving(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, tableData, fetchData, enqueueSnackbar]);

  // ── HTML çıktı ────────────────────────────────────────────────────────────────

  const escapeHtml = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const buildHtmlAsync = async (): Promise<string> => {
    const createdAt = new Date().toLocaleString("tr-TR");
    
    const riskChipClass = (val?: string | null) => {
      const v = (val || "").toLowerCase();
      if (v.includes("yüksek") || v.includes("kritik")) return "chip chip-error";
      if (v.includes("orta")) return "chip chip-warn";
      if (v.includes("düşük") || v.includes("bilgi")) return "chip chip-info";
      return "chip chip-ok";
    };

    const tableRows = baseTableData
      .map(
        (row, idx) => `
      <tr>
        <td style="text-align:center">${escapeHtml(String(row.satirNo ?? idx + 1))}</td>
        <td>${escapeHtml(row.bolum)}</td>
        <td>${escapeHtml(row.konu)}</td>
        <td>${escapeHtml(row.islem)}</td>
        <td style="text-align:center">${escapeHtml(row.durum)}</td>
        <td style="text-align:center"><span class="${riskChipClass(row.riskSeviyesi)}">${escapeHtml(row.riskSeviyesi)}</span></td>
        <td>${escapeHtml(row.tespit)}</td>
        <td>${escapeHtml(row.ilgiliBds)}</td>
        <td style="text-align:center">${escapeHtml(row.bdsReferansi)}</td>
      </tr>`
      )
      .join("");
      
    return `<!DOCTYPE html><html lang="tr">
      <head>
        <meta charset="utf-8"/>
        <title>İşletmeye İlişkin İç Kontrol Tespit Belgesi</title>
        <style>
          @page { size: A4 landscape; margin: 1cm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { font-family: Arial, sans-serif; font-size: 10px; color: #1a202c; }
          .doc-header { border-bottom: 2px solid #2b6cb0; padding-bottom: 12px; margin-bottom: 16px; }
          .doc-title { font-size: 14px; font-weight: 700; color: #2b6cb0; text-transform: uppercase; }
          .doc-meta { font-size: 10px; color: #555; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f1f5f9; font-weight: 700; border: 1px solid #cbd5e0; padding: 5px 6px; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 4px 6px; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          .chip { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; border: 1px solid; }
          .chip-error { background:#fdf2f2; color:#b91c1c; border-color:#fca5a5; }
          .chip-warn { background:#fffbeb; color:#b45309; border-color:#fcd34d; }
          .chip-info { background:#eff6ff; color:#1d4ed8; border-color:#93c5fd; }
          .chip-ok { background:#f0fdf4; color:#15803d; border-color:#86efac; }
          .doc-footer { margin-top: 24px; font-size: 9px; color: #999; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <div class="doc-title">İşletmeye İlişkin İç Kontrol Tespit Belgesi</div>
          <div class="doc-meta">Denetlenen: ${escapeHtml(user.denetlenenFirmaAdi || "")} | Yıl: ${escapeHtml(String(user.yil ?? ""))}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:3%;">No</th>
              <th style="width:7%;">Bölüm</th>
              <th style="width:10%;">Alt Bölüm</th>
              <th style="width:18%;">Kontrol Sorusu</th>
              <th style="width:5%;">Yanıt</th>
              <th style="width:6%;">Risk</th>
              <th style="width:23%;">Açıklama</th>
              <th style="width:20%;">Denetim Adımı</th>
              <th style="width:8%;">BDS</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="doc-footer">
          <span>Oluşturulma: ${escapeHtml(createdAt)}</span>
          <span class="page-number">Bu belge denetim kanıtı niteliğindedir.</span>
        </div>
      </body>
      </html>`;
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ width: "95%", margin: "0 auto", display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
      <Stack spacing={2.5}>


        <Box sx={{ px: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={handleKaydet}
            disabled={saving || (!isHotDirty && changedRowIdsRef.current.size === 0)}
            variant="contained"
            color={isHotDirty ? "warning" : "primary"}
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </Box>

        <Box sx={{ minHeight: "60vh" }}>
          <CalismaKagitiHotTable
            ref={hotRef}
            data={hotData}
            colHeaders={colHeaders}
            columns={columns}
            rowHeaders={false}
            manualColumnResize={true}
            manualRowResize={false}
            editableColumnIndices={editableColumnIndices}
            afterChange={handleAfterChange}
            afterCreateRow={handleAfterCreateRow}
            height={700}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormOnayBolumu
            controller="IsletmeyeIliskinIcKontrolTespit"
            showKaliteKontrol={true}
            onHazirlayanChange={fetchData}
            onOnaylayanChange={fetchData}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <IslemlerCardHtml
            controller="IsletmeyeIliskinIcKontrolTespit"
            buildHtmlAsync={buildHtmlAsync}
            previewEndpoint="/ArsivIslemleri/WordDosyasiniPdfOlarakOnizleHtml"
          />
        </Box>
      </Stack>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Değişiklikler Kaybolacak</DialogTitle>
        <DialogContent>
          <DialogContentText>Sayfadan ayrılmak istiyor musunuz?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>İptal</Button>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
              router.push(targetUrl);
            }}
            color="error"
          >
            Ayrıl
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IsletmeyeIliskinIcKontrolTespitTable;
