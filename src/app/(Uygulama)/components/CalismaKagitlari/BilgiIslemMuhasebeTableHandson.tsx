"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Handsontable from "handsontable";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/styles/handsontable.min.css";
import { Box, CircularProgress, Paper, Stack, Typography, Snackbar, Alert as MuiAlert } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  BilgiIslemMuhasebeRow,
  getBilgiIslemMuhasebeByDenetlenen,
  kaydetBilgiIslemMuhasebe,
} from "@/api/CalismaKagitlari/BilgiIslemMuhasebe";

registerAllModules();

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
}

interface SelectedCellInfo {
  label: string;
  value: string;
  rowIndex: number;
  colIndex: number;
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
const COL_EVET_ICERIK = 5;
const COL_HAYIR_ICERIK = 6;
const COL_BDS_REF = 7;

// Soft (Pastel) Renk Paleti
const RISK_COLORS: Record<string, { bg: string; text: string }> = {
  KRİTİK: { bg: "#ffebee", text: "#c62828" },
  YÜKSEK: { bg: "#fff3e0", text: "#ef6c00" },
  ORTA: { bg: "#fffde7", text: "#fbc02d" },
  BİLGİ: { bg: "#e3f2fd", text: "#1565c0" },
  DÜŞÜK: { bg: "#f1f8e9", text: "#33691e" },
  DEFAULT: { bg: "#ffffff", text: "#333333" },
};

// Çok satırlı metin sütunları
const MULTILINE_COLUMNS = [COL_ISLEM, COL_TESPIT, COL_EVET_ICERIK, COL_HAYIR_ICERIK, COL_BDS_REF];

const BilgiIslemMuhasebeTableHandson: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { enqueueSnackbar } = useSnackbar();
  const hotRef = useRef<any>(null);

  const [rows, setRows] = useState<BilgiIslemMuhasebeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dirty tracking için snapshot ref
  const initialSnapshot = useRef<string>("");

  const [selectedCellInfo, setSelectedCellInfo] = useState<SelectedCellInfo | null>(null);
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
      // İlk veri yüklendiğinde snapshot al
      initialSnapshot.current = JSON.stringify(
        resp.map((r) => ({ id: r.id, durum: r.durum, tespit: r.tespit }))
      );
    } catch (error) {
      console.error("Fetch error:", error);
      setSnackbarMessage("Veriler yüklenemedi");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Varsayılana dön işlemi
  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      fetchData().finally(() => setIsClickedVarsayilanaDon(false));
    }
  }, [fetchData, isClickedVarsayilanaDon, setIsClickedVarsayilanaDon]);

  // Handsontable verisi (enriched with defaults)
  const tableData = useMemo<RowData[]>(() => {
    return rows.map((row, index) => ({
      satirNo: row.satirNo ?? (index + 1),
      riskSeviyesi: row.riskSeviyesi ?? "—",
      islem: row.islem ?? "",
      durum: row.durum ?? "Evet",
      tespit: row.tespit ?? (row.durum === "Hayır" ? row.hayirIcerik ?? "" : row.evetIcerik ?? ""),
      bdsReferansi: row.bdsReferansi ?? "",
      id: row.id,
      evetIcerik: row.evetIcerik,
      hayirIcerik: row.hayirIcerik,
      standartmi: row.standartmi,
    }));
  }, [rows]);

  // Hücre seçimi - detail panel'e yükle
  const handleSelection = useCallback((r: number, c: number) => {
    const hot = hotRef.current?.hotInstance;
    if (hot) {
      const value = (hot.getDataAtCell(r, c) || "").toString();
      const label = hot.getColHeader(c).toString() || "";

      setSelectedCellInfo((prev) => {
        // Değişim yoksa render etme
        if (prev?.rowIndex === r && prev?.colIndex === c && prev?.value === value) {
          return prev;
        }
        return { label, value, rowIndex: r, colIndex: c };
      });
    }
  }, []);

  // Değişiklik takibi (isDirty)
  const isDirty = useMemo(() => {
    const currentData = JSON.stringify(
      rows.map((r) => ({ id: r.id, durum: r.durum, tespit: r.tespit }))
    );
    return initialSnapshot.current !== currentData;
  }, [rows]);

  // Kaydetmeden çıkış uyarısı
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; 
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Enter tuşu yönetimi - multiline sütunlarda alt satırı geçmesi
  const handleKeyDown = useCallback(
    function (this: any, event: any) {
      if (event.keyCode === 13) {
        // Enter tuşu
        const editor = this.getActiveEditor();
        if (editor && editor.isOpened()) {
          const selected = this.getSelected();
          if (selected) {
            const colIndex = selected[0][1];
            // Multiline sütunlarda Enter yapmasına izin ver
            if (MULTILINE_COLUMNS.includes(colIndex)) {
              event.stopImmediatePropagation();
            }
          }
        }
      }
    },
    []
  );

  // Durum değişimi - Evet/Hayır seçildiğinde tespit'i otomatik doldur
  const handleDurumChange = useCallback(
    function (this: any, change: any[] | null) {
      if (!change || !change.length) return;

      change.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        if ((prop === "durum" || prop === COL_DURUM) && newValue?.trim()) {
          const hot = this;
          
          const evetIcerik = hot.getDataAtCell(row, COL_EVET_ICERIK) || "";
          const hayirIcerik = hot.getDataAtCell(row, COL_HAYIR_ICERIK) || "";

          // Seçime göre Açıklama (Tespit) alanını doldur
          const templateContent = newValue === "Hayır" ? hayirIcerik : evetIcerik;

          hot.setDataAtCell(row, COL_TESPIT, templateContent);
        }
      });
    },
    []
  );

  // Soft Risk Renderer
  const softRiskRenderer = (
    instance: any,
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string | number,
    value: any,
    cellProperties: any
  ) => {
    // @ts-ignore
    Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);

    const risk = (value || "").toString().toUpperCase();
    const style = RISK_COLORS[risk] || RISK_COLORS.DEFAULT;

    td.style.backgroundColor = style.bg;
    td.style.color = style.text;
    td.style.fontWeight = "bold";
    td.style.textAlign = "center";
    td.style.border = "none";
    td.style.borderRadius = "4px";
  };

  // Kaydetme işlemi
  const handleKaydet = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;

    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    setSaving(true);
    try {
      const satirlar = tableData.map((rowData, idx) => {
        const durum = hot.getDataAtCell(idx, COL_DURUM) || "Evet";
        const tespit = hot.getDataAtCell(idx, COL_TESPIT) || "";

        return {
          id: rowData.id,
          durum: durum.toString(),
          tespit: tespit.toString(),
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
        
        // Kayıt başarılıysa snapshot'ı güncelle (dirty state'i sıfırla)
        initialSnapshot.current = JSON.stringify(
          rows.map((r) => ({ id: r.id, durum: r.durum, tespit: r.tespit }))
        );
        
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

  // Summary istatistikleri
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Stack spacing={3}>
        {/* Başlık ve Özet */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bilgi İşlem ve Muhasebe Sistemine İlişkin Değerlendirme
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Toplam: {stats.toplam} | Hayır: {stats.hayirCount} | Kritik: {stats.kritikCount} |
            Yüksek: {stats.yuksekCount}
          </Typography>
        </Box>

        {/* Handsontable */}
        <Box
            "& .htCore td": {
              verticalAlign: "middle !important",
              fontSize: "0.85rem",
              padding: "8px !important",
              borderRight: "1px solid #eee !important",
              borderBottom: "1px solid #eee !important",
            },
            "& .htCore th": {
              backgroundColor: "#f8f9fa",
              color: "#344767",
              fontWeight: 700,
              fontSize: "0.80rem",
              textTransform: "uppercase",
              padding: "12px !important",
              borderRight: "1px solid #e9ecef !important",
              borderBottom: "1px solid #e9ecef !important",
            },
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            overflow: "hidden",
          }}
        >
          <HotTable
            ref={hotRef}
            data={tableData.map((row) => [
              row.satirNo,
              row.riskSeviyesi,
              row.islem,
              row.durum,
              row.tespit,
              row.evetIcerik,
              row.hayirIcerik,
              row.bdsReferansi,
            ])}
            colHeaders={[
              "No",
              "Risk",
              "Soru",
              "Yanıt (E/H)",
              "Açıklama / Tespit",
              "Evet Şablon",
              "Hayır Şablon",
              "BDS Ref.",
            ]}
            columns={[
              { type: "text", readOnly: true, width: 40 },
              { type: "text", readOnly: true, width: 80 },
              { type: "text", readOnly: true, width: 250 },
              {
                type: "dropdown",
                source: ["Evet", "Hayır"],
                width: 80,
              },
              { type: "text", width: 250 },
              { type: "text", readOnly: true, width: 200 },
              { type: "text", readOnly: true, width: 200 },
              { type: "text", readOnly: true, width: 120 },
            ]}
            cells={(row, col) => {
              const cellProperties: any = {};
              if (col === COL_RISK) {
                cellProperties.renderer = softRiskRenderer;
              }
              return cellProperties;
            }}
            rowHeights={45}
            autoRowSize={true}
            viewportRowRenderingOffset={10}
            stretchH="all"
            licenseKey="non-commercial-and-evaluation"
            afterSelection={handleSelection}
            beforeKeyDown={handleKeyDown}
            afterChange={handleDurumChange}
            contextMenu={true}
            height="auto"
          />
        </Box>

        {/* Detail Panel */}
        {selectedCellInfo && (
          <Paper
            sx={{
              p: 2,
              bgcolor: "#fafafa",
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              {selectedCellInfo.label} (Satır {selectedCellInfo.rowIndex + 1})
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.6,
              }}
            >
              {selectedCellInfo.value}
            </Typography>
          </Paper>
        )}

        {/* Kaydet Düğmesi */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <button
            onClick={handleKaydet}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            <SaveIcon fontSize="small" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </Box>
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default BilgiIslemMuhasebeTableHandson;
