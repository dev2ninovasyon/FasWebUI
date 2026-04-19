"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CalismaKagitiHotTable, {
  HOT_BASE_ROW_HEIGHT,
  riskRenderer,
  durumRenderer,
  bdsRefRenderer,
  tespitRenderer,
  islemRenderer,
} from "@/components/CalismaKagitiHotTable";
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
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  BilgiIslemMuhasebeRow,
  getBilgiIslemMuhasebeByDenetlenen,
  kaydetBilgiIslemMuhasebe,
  varsayilanaDonBilgiIslemMuhasebe,
} from "@/api/CalismaKagitlari/BilgiIslemMuhasebe";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (v: boolean) => void;
  setTamamlanan: (v: number) => void;
  setToplam: (v: number) => void;
  saveRequestVersion?: number;
  onStateChange?: (state: {
    isDirty: boolean;
    saving: boolean;
    loading: boolean;
    recordCount: number;
    hayirCount: number;
    kritikCount: number;
  }) => void;
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

const COL_SATIR_NO = 0;
const COL_RISK = 1;
const COL_ISLEM = 2;
const COL_DURUM = 3;
const COL_TESPIT = 4;
const COL_BDS_REF = 5;

const BilgiIslemMuhasebeTableHandson: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
  saveRequestVersion = 0,
  onStateChange,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const router = useRouter();
  const hotRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState<BilgiIslemMuhasebeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHotDirty, setIsHotDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");

  const tableDataRef = useRef<RowData[]>([]);
  const changedRowIdsRef = useRef<Set<number>>(new Set());

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

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
      changedRowIdsRef.current.clear();
    } catch {
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
      const deleteSuccess = await varsayilanaDonBilgiIslemMuhasebe(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );

      if (deleteSuccess) {
        setSnackbarMessage("Veriler varsayılana döndürüldü");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        await fetchData();
      } else {
        setSnackbarMessage("Varsayılana dönüş başarısız oldu");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Varsayılana dönüş hatası:", error);
      setSnackbarMessage("Bir hata oluştu");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setIsClickedVarsayilanaDon(false);
    }
  }, [user.denetciId, user.denetlenenId, user.yil, fetchData, setIsClickedVarsayilanaDon]);

  const tableData = useMemo<RowData[]>(
    () =>
      rows.map((row, index) => ({
        satirNo: row.satirNo || index + 1,
        riskSeviyesi: row.riskSeviyesi || "ORTA",
        islem: row.islem || "",
        durum: row.durum || "Evet",
        tespit: row.tespit ?? "",
        bdsReferansi: row.bdsReferansi || "—",
        id: row.id,
        evetIcerik: row.evetIcerik || "",
        hayirIcerik: row.hayirIcerik || "",
        standartmi: row.standartmi,
      })),
    [rows]
  );

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  const colHeaders = useMemo(
    () => ["No", "Risk", "Soru", "Yanıt (E/H)", "Açıklama / Değerlendirme Metni", "BDS"],
    []
  );

  const columns = useMemo(
    () => [
      { type: "text" as const, readOnly: false, width: 40, editor: "speech-text" },
      { type: "text" as const, readOnly: false, width: 90, renderer: riskRenderer, editor: "speech-text" },
      { type: "text" as const, readOnly: false, width: 360, renderer: islemRenderer, editor: "speech-text" },
      {
        type: "dropdown" as const,
        source: ["Evet", "Hayır"],
        width: 100,
        renderer: durumRenderer,
      },
      {
        type: "text" as const,
        width: 517,
        renderer: tespitRenderer,
        editor: "speech-text",
      },
      { type: "text" as const, readOnly: false, width: 90, renderer: bdsRefRenderer, editor: "speech-text" },
    ],
    []
  );

  const editableColumnIndices = useMemo(
    () => [COL_SATIR_NO, COL_RISK, COL_ISLEM, COL_DURUM, COL_TESPIT, COL_BDS_REF],
    []
  );

  const hotData = useMemo(
    () =>
      tableData.map((row) => [
        row.satirNo,
        row.riskSeviyesi,
        row.islem,
        row.durum,
        row.tespit,
        row.bdsReferansi,
        row.id,
        row.evetIcerik,
        row.hayirIcerik,
      ]),
    [tableData]
  );

  const stats = useMemo(() => {
    const hayirCount = tableData.filter((r) => r.durum?.trim() === "Hayır").length;
    const kritikCount = tableData.filter(
      (r) => r.riskSeviyesi?.toUpperCase() === "KRİTİK"
    ).length;
    const yuksekCount = tableData.filter(
      (r) => r.riskSeviyesi?.toUpperCase() === "YÜKSEK"
    ).length;
    return { hayirCount, kritikCount, yuksekCount, toplam: tableData.length };
  }, [tableData]);

  useEffect(() => {
    onStateChange?.({
      isDirty: isHotDirty,
      saving,
      loading,
      recordCount: tableData.length,
      hayirCount: stats.hayirCount,
      kritikCount: stats.kritikCount,
    });
  }, [isHotDirty, loading, onStateChange, saving, stats.hayirCount, stats.kritikCount, tableData.length]);

  useEffect(() => {
    setTamamlanan(tableData.filter((r) => r.durum?.trim()).length);
    setToplam(tableData.length);
  }, [tableData, setTamamlanan, setToplam]);

  useEffect(() => {
    const applyWidth = () => {
      const hot = hotRef.current?.hotInstance;
      const container = containerRef.current;
      if (!hot || !container) return;
      const containerWidth = container.offsetWidth;
      const fixedWidths = 40 + 90 + 360 + 100 + 90;
      const açıklamaWidth = Math.max(517, containerWidth - fixedWidths - 2);
      hot.updateSettings({
        columns: [
          { type: "text", readOnly: false, width: 40, editor: "speech-text" },
          { type: "text", readOnly: false, width: 90, renderer: riskRenderer, editor: "speech-text" },
          { type: "text", readOnly: false, width: 360, renderer: islemRenderer, editor: "speech-text" },
          { type: "dropdown", source: ["Evet", "Hayır"], width: 100, renderer: durumRenderer },
          { type: "text", width: açıklamaWidth, renderer: tespitRenderer, editor: "speech-text" },
          { type: "text", readOnly: false, width: 90, renderer: bdsRefRenderer, editor: "speech-text" },
        ],
      });
    };
    const timer = setTimeout(applyWidth, 50);
    return () => clearTimeout(timer);
  }, []);

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

  const handleAfterCreateRow = useCallback(
    function (this: any, index: number, amount: number) {
      const hot = this;
      for (let i = index; i < index + amount; i++) {
        hot.setDataAtCell(i, COL_RISK, "ORTA");
        hot.setDataAtCell(i, COL_DURUM, "Evet");
        hot.setDataAtCell(i, COL_BDS_REF, "—");
      }
      setIsHotDirty(true);
    },
    []
  );

  const handleAfterChange = useCallback(
    function (this: any, change: any[] | null, source: string) {
      if (!change || !change.length || source === "loadData") return;
      setIsHotDirty(true);
      change.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        const rowId = tableDataRef.current[row]?.id;
        if (rowId) {
          changedRowIdsRef.current.add(rowId);
        }

        if ((prop === "durum" || prop === COL_DURUM) && newValue?.trim()) {
          const hot = this;
          const currentRow = tableDataRef.current[row];
          const currentTespit = hot.getDataAtCell(row, COL_TESPIT) ?? "";

          const oldTemplateContent =
            oldValue === "Hayır"
              ? currentRow?.hayirIcerik || ""
              : currentRow?.evetIcerik || "";

          const newTemplateContent =
            newValue === "Hayır"
              ? currentRow?.hayirIcerik || ""
              : currentRow?.evetIcerik || "";

          if (currentTespit === "" || currentTespit === oldTemplateContent) {
            setTimeout(() => hot.setDataAtCell(row, COL_TESPIT, newTemplateContent), 0);
          }
        }
      });
    },
    []
  );

  const handleKaydet = useCallback(async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    setSaving(true);
    try {
      const sourceData = hot.getSourceData() as any[][];

      const satirlar = sourceData
        .map((rowArr) => ({
          id: Number(rowArr[6] || 0),
          satirNo: rowArr[COL_SATIR_NO] ? Number(rowArr[COL_SATIR_NO]) : null,
          riskSeviyesi: (rowArr[COL_RISK] ?? "").toString(),
          islem: (rowArr[COL_ISLEM] ?? "").toString(),
          durum: (rowArr[COL_DURUM] ?? "Evet").toString(),
          tespit: (rowArr[COL_TESPIT] ?? "").toString(),
          bdsReferansi: (rowArr[COL_BDS_REF] ?? "").toString(),
        }))
        .filter((item) => item.id === 0 || changedRowIdsRef.current.has(item.id));

      if (satirlar.length === 0) {
        setSnackbarMessage("Değişiklik yapılmadı");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        setSaving(false);
        return;
      }

      const success = await kaydetBilgiIslemMuhasebe({
        denetciId: user.denetciId,
        denetlenenId: user.denetlenenId,
        yil: user.yil,
        satirlar: satirlar as any,
      });
      if (success) {
        setIsHotDirty(false);
        changedRowIdsRef.current.clear();
        setSnackbarMessage("Veriler başarıyla kaydedildi");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        await fetchData();
      } else {
        setSnackbarMessage("Veriler kaydedilemedi. Lütfen tekrar deneyin.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      setSnackbarMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  }, [fetchData, user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    if (saveRequestVersion > 0) {
      void handleKaydet();
    }
  }, [handleKaydet, saveRequestVersion]);

  const escapeHtml = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const buildHtmlAsync = async (): Promise<string> => {
    const tableRows = tableData
      .map(
        (row, idx) => `
      <tr>
        <td class="center" style="width:4%">${escapeHtml(String(row.satirNo ?? idx + 1))}</td>
        <td class="center risk-${(row.riskSeviyesi || "").toLowerCase().replace(/[^a-z]/g, "")}" style="width:8%">${escapeHtml(row.riskSeviyesi)}</td>
        <td style="width:30%">${escapeHtml(row.islem)}</td>
        <td class="center durum-${row.durum === "Hayır" ? "hayir" : "evet"}" style="width:7%">${escapeHtml(row.durum)}</td>
        <td style="width:40%">${escapeHtml(row.tespit)}</td>
        <td class="center" style="width:11%">${escapeHtml(row.bdsReferansi)}</td>
      </tr>`
      )
      .join("");
    return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"/><title>PDF</title><style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;}</style></head><body><table>${tableRows}</table></body></html>`;
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
      <Box sx={{ px: { xs: 0.25, md: 0.5 } }}>
        <Box
          className="calisma-kagidi-hot-table-shell"
          sx={{ width: "100%", overflow: "hidden", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
        >
          <Box ref={containerRef} className="calisma-kagidi-hot-table" sx={{ position: "relative", minWidth: 0 }}>
            <CalismaKagitiHotTable
              ref={hotRef}
              className="ht-theme-horizon calisma-kagidi-hot-table-grid"
              data={hotData}
              colHeaders={colHeaders}
              columns={columns}
              rowHeaders={false}
              height="calc(100vh - 260px)"
              rowHeight={HOT_BASE_ROW_HEIGHT}
              stretchH="last"
              dropdownMenu={true}
              manualColumnResize={true}
              manualRowResize={false}
              editableColumnIndices={editableColumnIndices}
              afterChange={handleAfterChange}
              afterCreateRow={handleAfterCreateRow}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <FormOnayBolumu
          controller="BilgiIslemMuhasebe"
          showKaliteKontrol={true}
          onHazirlayanChange={fetchData}
          onOnaylayanChange={fetchData}
        />
      </Box>
      <Box sx={{ mt: 4 }}>
        <IslemlerCardHtml
          controller="BilgiIslemMuhasebe"
          buildHtmlAsync={buildHtmlAsync}
          previewEndpoint="/ArsivIslemleri/WordDosyasiniPdfOlarakOnizleHtml"
        />
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
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

export default BilgiIslemMuhasebeTableHandson;
