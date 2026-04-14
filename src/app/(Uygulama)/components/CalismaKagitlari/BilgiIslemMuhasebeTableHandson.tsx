"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Handsontable from "handsontable";
import { HotTable } from "@handsontable/react";
import "@/lib/handsontableSetup";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert as MuiAlert,
  Typography,
} from "@mui/material";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  BilgiIslemMuhasebeRow,
  getBilgiIslemMuhasebeByDenetlenen,
  kaydetBilgiIslemMuhasebe,
} from "@/api/CalismaKagitlari/BilgiIslemMuhasebe";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
}

interface RowData {
  satirNo: number | string;
  riskSeviyesi: string;
  islem: string;
  durum: string;
  tespit: string;
  bdsReferansi: string;
  id: number;
  evetIcerik?: string | null;
  hayirIcerik?: string | null;
  standartmi?: boolean | null;
}

// Sütun indeksleri
const COL_SATIR_NO = 0;
const COL_RISK = 1;
const COL_ISLEM = 2;
const COL_DURUM = 3;
const COL_TESPIT = 4;
const COL_BDS_REF = 5;

// Soft (Pastel) Renk Paleti
const RISK_COLORS: Record<string, { bg: string; text: string }> = {
  KRİTİK: { bg: "#ffebee", text: "#c62828" },
  KRITIK: { bg: "#ffebee", text: "#c62828" },
  YÜKSEK: { bg: "#fff3e0", text: "#e65100" },
  YUKSEK: { bg: "#fff3e0", text: "#e65100" },
  ORTA:   { bg: "#fffde7", text: "#f57f17" },
  BİLGİ: { bg: "#e3f2fd", text: "#1565c0" },
  BILGI: { bg: "#e3f2fd", text: "#1565c0" },
  DÜŞÜK:  { bg: "#f1f8e9", text: "#33691e" },
  DUSUK:  { bg: "#f1f8e9", text: "#33691e" },
  DEFAULT: { bg: "#ffffff", text: "#333333" },
};

const BilgiIslemMuhasebeTableHandson: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const hotRef = useRef<any>(null);

  const [rows, setRows] = useState<BilgiIslemMuhasebeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Kaydedilmemiş değişiklik takibi
  const [isHotDirty, setIsHotDirty] = useState(false);

  // Sayfa terk etme uyarısı
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");

  // tableDataRef: handleAfterChange içinde güncel verilere erişim için
  const tableDataRef = useRef<RowData[]>([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("success");


  const fetchData = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    try {
      const resp = await getBilgiIslemMuhasebeByDenetlenen(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );
      setRows(resp);
      setIsHotDirty(false);
    } catch {
      setSnackbarMessage("Veriler yüklenemedi");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Varsayılana dön
  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      fetchData().finally(() => setIsClickedVarsayilanaDon(false));
    }
  }, [fetchData, isClickedVarsayilanaDon, setIsClickedVarsayilanaDon]);

  // tableData hesapla
  const tableData = useMemo<RowData[]>(() => {
    return rows.map((row, index) => {
      const currentDurum = row.durum || "Evet";
      const risk = row.riskSeviyesi || "ORTA";
      const bds = row.bdsReferansi || "—";
      const tespitValue =
        row.tespit && row.tespit.trim() !== ""
          ? row.tespit
          : (currentDurum === "Hayır" ? row.hayirIcerik : row.evetIcerik) || "";

      return {
        satirNo: row.satirNo || index + 1,
        riskSeviyesi: risk,
        islem: row.islem || "",
        durum: currentDurum,
        tespit: tespitValue,
        bdsReferansi: bds,
        id: row.id,
        evetIcerik: row.evetIcerik || "",
        hayirIcerik: row.hayirIcerik || "",
        standartmi: row.standartmi,
      };
    });
  }, [rows]);

  // tableDataRef'i güncelle
  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  // İstatistikler
  const stats = useMemo(() => {
    const hayirCount = tableData.filter((r) => r.durum?.trim() === "Hayır").length;
    const kritikCount = tableData.filter((r) => r.riskSeviyesi?.toUpperCase() === "KRİTİK").length;
    const yuksekCount = tableData.filter((r) => r.riskSeviyesi?.toUpperCase() === "YÜKSEK").length;
    return { hayirCount, kritikCount, yuksekCount, toplam: tableData.length };
  }, [tableData]);

  useEffect(() => {
    setTamamlanan(tableData.filter((r) => r.durum?.trim()).length);
    setToplam(tableData.length);
  }, [tableData, setTamamlanan, setToplam]);

  // ── Navigation guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHotDirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      setTargetUrl(href);
      setConfirmDialogOpen(true);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [isHotDirty]);

  // ── Handsontable afterChange ────────────────────────────────────────────────
  // Hem dirty flag hem de Durum → Tespit otomatik doldurmayı yönetir
  const handleAfterChange = useCallback(
    function (this: any, change: any[] | null, source: string) {
      if (!change || !change.length || source === "loadData") return;

      // Herhangi bir değişiklik → dirty
      setIsHotDirty(true);

      // Durum (Evet/Hayır) değişince Tespit'i şablondan doldur
      change.forEach(([row, prop, , newValue]: [number, any, any, any]) => {
        if ((prop === "durum" || prop === COL_DURUM) && newValue?.trim()) {
          const hot = this;
          const currentRow = tableDataRef.current[row];
          const evetIcerik = currentRow?.evetIcerik || "";
          const hayirIcerik = currentRow?.hayirIcerik || "";
          const templateContent = newValue === "Hayır" ? hayirIcerik : evetIcerik;
          // setTimeout: afterChange tamamlanmadan setDataAtCell bazen atlanır
          setTimeout(() => hot.setDataAtCell(row, COL_TESPIT, templateContent), 0);
        }
      });
    },
    []
  );

  // ── Enter tuşu: çok satırlı sütunlarda alt satıra geç ──────────────────────
  const handleKeyDown = useCallback(function (this: any, event: any) {
    if (event.keyCode === 13) {
      const editor = this.getActiveEditor();
      if (editor?.isOpened()) {
        const selected = this.getSelected();
        if (selected) {
          const col = selected[0][1];
          if ([COL_ISLEM, COL_TESPIT, COL_BDS_REF].includes(col)) {
            event.stopImmediatePropagation();
          }
        }
      }
    }
  }, []);

  // ── Renderers ───────────────────────────────────────────────────────────────
  const durumRenderer = function (
    this: any, instance: any, td: HTMLTableCellElement,
    row: number, col: number, prop: string | number, value: any, cellProperties: any
  ) {
    // @ts-ignore
    Handsontable.renderers.DropdownRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
    if (value === "Evet") {
      td.style.backgroundColor = "#e8f5e9";
      td.style.color = "#2e7d32";
      td.style.fontWeight = "bold";
    } else if (value === "Hayır") {
      td.style.backgroundColor = "#ffebee";
      td.style.color = "#c62828";
      td.style.fontWeight = "bold";
    }
    td.style.textAlign = "center";
  };

  const softRiskRenderer = function (
    this: any, instance: any, td: HTMLTableCellElement,
    row: number, col: number, prop: string | number, value: any, cellProperties: any
  ) {
    // @ts-ignore
    Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
    const risk = (value || "").toString().trim().toUpperCase();
    const style = RISK_COLORS[risk] || RISK_COLORS.DEFAULT;
    td.style.backgroundColor = style.bg;
    td.style.color = style.text;
    td.style.fontWeight = "600";
    td.style.textAlign = "center";
    td.style.borderRadius = "4px";
    td.style.fontSize = "0.78rem";
  };

  const bdsRefRenderer = function (
    this: any, instance: any, td: HTMLTableCellElement,
    row: number, col: number, prop: string | number, value: any, cellProperties: any
  ) {
    // @ts-ignore
    Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
    td.style.backgroundColor = "#f0f7ff";
    td.style.color = "#0d47a1";
    td.style.fontSize = "0.72rem";
    td.style.fontStyle = "italic";
    td.style.textAlign = "center";
  };

  const tespitRenderer = function (
    this: any, instance: any, td: HTMLTableCellElement,
    row: number, col: number, prop: string | number, value: any, cellProperties: any
  ) {
    // @ts-ignore
    Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
    td.style.fontSize = "0.82rem";
    td.style.lineHeight = "1.5";
  };

  // ── HTML builder (önizle / indir / arşiv) ──────────────────────────────────
  const escapeHtml = (s: string) =>
    String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const buildHtmlAsync = async (): Promise<string> => {
    const createdAt = new Date().toLocaleString("tr-TR");
    const tableRows = tableData.map((row, idx) => `
      <tr>
        <td class="center" style="width:4%">${escapeHtml(String(row.satirNo ?? idx + 1))}</td>
        <td class="center risk-${(row.riskSeviyesi || "").toLowerCase().replace(/[^a-z]/g,"")}" style="width:8%">${escapeHtml(row.riskSeviyesi)}</td>
        <td style="width:30%">${escapeHtml(row.islem)}</td>
        <td class="center durum-${row.durum === "Hayır" ? "hayir" : "evet"}" style="width:7%">${escapeHtml(row.durum)}</td>
        <td style="width:40%">${escapeHtml(row.tespit)}</td>
        <td class="center" style="width:11%">${escapeHtml(row.bdsReferansi)}</td>
      </tr>`).join("");
    return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/>
<title>BİLGİ İŞLEM VE MUHASEBE SİSTEMİNE İLİŞKİN DEĞERLENDİRME</title>
<style>
  @page{size:A4;margin:1.5cm 1.5cm}
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:Arial,sans-serif;font-size:9pt;color:#1a202c;margin:0;padding:0;line-height:1.4}
  .doc-header{border-bottom:2px solid #2b6cb0;padding-bottom:6px;margin-bottom:15px}
  .doc-title{font-size:14pt;font-weight:700;color:#2b6cb0;text-transform:uppercase;letter-spacing:0.02em}
  .doc-meta{font-size:9pt;color:#555;margin-top:4px}
  table{width:100%;border-collapse:collapse;table-layout:auto;word-break:break-word;margin-bottom:20px}
  th{background:#f1f5f9;font-weight:700;border:1px solid #cbd5e0;padding:6px 8px;text-align:left;font-size:9pt;color:#2d3748}
  td{border:1px solid #e2e8f0;padding:6px 8px;vertical-align:top;font-size:8.5pt;word-break:break-word;overflow-wrap:break-word}
  tr:nth-child(even) td{background:#f8fafc}
  .center{text-align:center}
  .durum-evet{background:#e8f5e9 !important;color:#2e7d32;font-weight:bold}
  .durum-hayir{background:#ffebee !important;color:#c62828;font-weight:bold}
  .risk-kritik{background:#ffebee !important;color:#c62828;font-weight:600}
  .risk-yüksek,.risk-yuksek{background:#fff3e0 !important;color:#e65100;font-weight:600}
  .risk-orta{background:#fffde7 !important;color:#f57f17;font-weight:600}
  .risk-düşük,.risk-dusuk{background:#f1f8e9 !important;color:#33691e;font-weight:600}
  .risk-bilgi{background:#e3f2fd !important;color:#1565c0;font-weight:600}
  .doc-footer{margin-top:20px;font-size:8pt;color:#999;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between}
</style></head><body>
<div class="doc-header">
  <div class="doc-title">BİLGİ İŞLEM VE MUHASEBE SİSTEMİNE İLİŞKİN DEĞERLENDİRME</div>
  <div class="doc-meta">Denetlenen: ${escapeHtml(user.denetlenenFirmaAdi ?? "")} &nbsp;|&nbsp; Yıl: ${escapeHtml(String(user.yil ?? ""))}</div>
</div>
<table width="100%" style="width:100%;border-collapse:collapse;table-layout:auto;margin-bottom:20px;">
  <thead>
    <tr>
      <th style="width:4%;text-align:center;">No</th>
      <th style="width:8%;text-align:center;">Risk</th>
      <th style="width:30%;">Soru</th>
      <th style="width:7%;text-align:center;">Yanıt</th>
      <th style="width:40%;">Açıklama / Değerlendirme</th>
      <th style="width:11%;text-align:center;">BDS Ref.</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="doc-footer"><span>FAS Denetim Sistemi</span><span>Oluşturulma: ${escapeHtml(createdAt)}</span></div>
</body></html>`;
  };

  // ── Kaydet ─────────────────────────────────────────────────────────────────
  const handleKaydet = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    setSaving(true);
    try {
      // getSourceData(): filtre aktifken de tüm fiziksel satırları döner
      const sourceData = hot.getSourceData() as any[][];

      const satirlar = tableData.map((rowData, physicalIdx) => {
        const row = sourceData[physicalIdx];
        return {
          id: rowData.id,
          durum: (row?.[COL_DURUM] ?? "Evet").toString(),
          tespit: (row?.[COL_TESPIT] ?? "").toString(),
        };
      });

      const success = await kaydetBilgiIslemMuhasebe({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar,
      });

      if (success) {
        setSnackbarMessage("Değerlendirme başarıyla kaydedildi");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setIsHotDirty(false);
        await fetchData();
      } else {
        setSnackbarMessage("Kaydetme başarısız");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } finally {
      setSaving(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, tableData, fetchData]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>

      {/* Özet + Kaydet */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam: {stats.toplam} | Hayır: {stats.hayirCount} | Kritik: {stats.kritikCount} | Yüksek: {stats.yuksekCount}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          {isHotDirty && (
            <Typography variant="caption" color="warning.dark" fontWeight={600}>
              Kaydedilmemiş değişiklikleriniz var
            </Typography>
          )}
          <Button
            onClick={handleKaydet}
            disabled={saving}
            variant="contained"
            color={isHotDirty ? "warning" : "primary"}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconDeviceFloppy size={18} />}
            sx={{ minWidth: 160 }}
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </Box>
      </Box>

      {/* Handsontable */}
      <Box sx={{ px: 2, overflow: "hidden" }}>
        <HotTable
          className="ht-theme-horizon"
          ref={hotRef}
          data={tableData.map((row) => [
            row.satirNo,
            row.riskSeviyesi,
            row.islem,
            row.durum,
            row.tespit,
            row.bdsReferansi,
            row.id,          // hidden 6
            row.evetIcerik,  // hidden 7
            row.hayirIcerik, // hidden 8
          ])}
          colHeaders={["No", "Risk", "Soru", "Yanıt (E/H)", "Açıklama / Değerlendirme Metni", "BDS Referansı"]}
          columns={[
            { type: "text", readOnly: true, width: 40 },
            { type: "text", readOnly: true, width: 90, renderer: softRiskRenderer },
            { type: "text", readOnly: true, width: 260 },
            { type: "dropdown", source: ["Evet", "Hayır"], width: 90, renderer: durumRenderer },
            { type: "text", width: 440, renderer: tespitRenderer },
            { type: "text", readOnly: true, width: 130, renderer: bdsRefRenderer },
          ]}
          rowHeaders={false}
          height="calc(100vh - 340px)"
          stretchH="all"
          autoRowSize={true}
          rowHeights={48}
          licenseKey="non-commercial-and-evaluation"
          filters={true}
          dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]}
          columnSorting={true}
          contextMenu={true}
          afterChange={handleAfterChange}
          beforeKeyDown={handleKeyDown}
          language="tr-TR"
        />
      </Box>


      {/* Hazırlayan / Onaylayan / Kontrol Eden */}
      <Box sx={{ mt: 2 }}>
        <FormOnayBolumu
          controller="BilgiIslemMuhasebe"
          showKaliteKontrol={true}
          onHazirlayanChange={fetchData}
          onOnaylayanChange={fetchData}
        />
      </Box>

      {/* Önizle / İndir / Arşiv */}
      <Box sx={{ mt: 4 }}>
        <IslemlerCardHtml 
          controller="BilgiIslemMuhasebe" 
          buildHtmlAsync={buildHtmlAsync} 
          previewEndpoint="/ArsivIslemleri/WordDosyasiniPdfOlarakOnizleHtml"
        />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {/* Sayfa terk etme uyarısı */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Kaydedilmemiş Değişiklikler</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılırsanız bu değişiklikler kaybolacak.
            Devam etmek istiyor musunuz?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => setConfirmDialogOpen(false)}>
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setConfirmDialogOpen(false);
              router.push(targetUrl);
            }}
          >
            Ayrıl
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BilgiIslemMuhasebeTableHandson;
