import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";

import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Grid,
  useTheme,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Backdrop,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import { enqueueSnackbar } from "notistack";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
  getEDefterIncelemeVerileriPaged,
  updateEDefterIncelemeVerisi,
} from "@/api/Veri/EDefterInceleme";
import { useRouter } from "next/navigation";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import FisDetaylari from "./FisDetaylari/[id]/FisDetaylari";

const Transition = forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

const PAGE_SIZE = 20;

interface Props {
  hesapNo: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  verileriGetirTiklandimi: boolean;
  setVerileriGetirTiklandimi: (bool: boolean) => void;
  hesaplar?: string | undefined;
  iliskilihesaplar?: string | undefined;
  yevmiyeNolar?: string | undefined;
  haricYevmiyeNo?: string | undefined;
  borcTutarindanFazla?: number | undefined;
  alacakTutarindanFazla?: number | undefined;
  aciklama?: string | undefined;
}

const EDefterInceleme: React.FC<Props> = ({
  hesapNo,
  baslangicTarihi,
  bitisTarihi,
  verileriGetirTiklandimi,
  setVerileriGetirTiklandimi,
  hesaplar,
  iliskilihesaplar,
  yevmiyeNolar,
  haricYevmiyeNo,
  borcTutarindanFazla,
  alacakTutarindanFazla,
  aciklama,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [noDataOpen, setNoDataOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [isFisPopupOpen, setIsFisPopupOpen] = useState(false);
  const [selectedFisNo, setSelectedFisNo] = useState<number | undefined>(undefined);
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);

  // Mutable refs to avoid stale closures in scroll handler
  const loadedPageRef = useRef(0);
  const hasMoreRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const totalCountRef = useRef(0);

  useEffect(() => {
    const loadStyles = async () => {
      dispatch(setCollapse(true));
      if (customizer.activeMode === "dark") {
        await import(
          "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableDark.css"
        );
      } else {
        await import(
          "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableLight.css"
        );
      }
    };
    loadStyles();
  }, [customizer.activeMode]);

  const colHeaders = [
    "Id",
    "Yevmiye No",
    "Yevmiye Tarihi",
    "Detay Kodu",
    "Hesap Adı",
    "Açıklama",
    "Fatura No",
    "Muhasebe No",
    "Borç",
    "Alacak",
    "Tespit Açıklama",
  ];

  const columns = [
    { type: "numeric", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
    { type: "numeric", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
    { type: "text", columnSorting: true, readOnly: true, editor: false, className: "htRight" },
    { type: "text", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
    { type: "text", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
    { type: "text", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
    { type: "numeric", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
    { type: "numeric", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true, culture: "tr-TR" },
      columnSorting: true, readOnly: true, editor: false, className: "htRight",
    },
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true, culture: "tr-TR" },
      columnSorting: true, readOnly: true, editor: false, className: "htRight",
    },
    { type: "text", columnSorting: true, className: "htLeft" },
  ];

  const mapRows = (items: any[]): any[] =>
    items
      .map((veri: any) => [
        veri.id,
        veri.yevmiyeNo,
        veri.yevmiyeTarih.split("T")[0].split("-").reverse().join("."),
        veri.detayKodu,
        veri.hesapAdi,
        veri.aciklama,
        veri.faturaNo,
        veri.muhasebeFisNo,
        veri.borc,
        veri.alacak,
        veri.tespitAciklama,
      ])
      .sort((a: any, b: any) => (a[1] > b[1] ? 1 : -1));

  const fetchPage = async (pageNum: number, append: boolean) => {
    const response = await getEDefterIncelemeVerileriPaged(
      user.denetciId || 0,
      user.denetlenenId || 0,
      user.yil || 0,
      hesapNo,
      baslangicTarihi,
      bitisTarihi,
      hesaplar,
      iliskilihesaplar,
      yevmiyeNolar,
      haricYevmiyeNo,
      borcTutarindanFazla,
      alacakTutarindanFazla,
      aciklama,
      pageNum,
      PAGE_SIZE
    );

    if (!response || (!response.items && !response.data)) return null;

    const pagedData = response.data || response;
    if (!Array.isArray(pagedData.items)) return null;

    const rows = mapRows(pagedData.items);
    const total = pagedData.totalCount || 0;
    return { rows, total };
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setDisplayedData([]);
      loadedPageRef.current = 0;
      hasMoreRef.current = false;

      const result = await fetchPage(1, false);
      if (!result || result.rows.length === 0) {
        setDisplayedData([]);
        setTotalCount(0);
        totalCountRef.current = 0;
        hasMoreRef.current = false;
        loadedPageRef.current = 1;
        setNoDataOpen(true);
        return;
      }

      setDisplayedData(result.rows);
      setTotalCount(result.total);
      totalCountRef.current = result.total;
      loadedPageRef.current = 1;
      hasMoreRef.current = result.rows.length < result.total;
      setNoDataOpen(false);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
      setDisplayedData([]);
      setTotalCount(0);
      enqueueSnackbar("Veriler yüklenirken bir hata oluştu", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = loadedPageRef.current + 1;
      const result = await fetchPage(nextPage, true);
      if (!result) return;

      setDisplayedData((prev) => {
        const combined = [...prev, ...result.rows];
        hasMoreRef.current = combined.length < totalCountRef.current;
        return combined;
      });
      loadedPageRef.current = nextPage;
    } catch (error) {
      console.error("Daha fazla veri yüklenirken hata:", error);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);

  const handleAfterScrollVertically = useCallback(() => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return;
    const hotInstance = hotTableComponent.current?.hotInstance;
    if (!hotInstance) return;
    const holder = hotInstance.rootElement?.querySelector(".ht_master .wtHolder") as HTMLElement | null;
    if (!holder) return;
    const { scrollTop, clientHeight, scrollHeight } = holder;
    if (scrollTop + clientHeight >= scrollHeight - 120) {
      loadMore();
    }
  }, [loadMore]);

  useEffect(() => {
    const fetchDataAsync = async () => {
      if (verileriGetirTiklandimi) {
        await fetchData();
        setVerileriGetirTiklandimi(false);
      }
    };
    fetchDataAsync();
  }, [verileriGetirTiklandimi]);

  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      return hotTableComponent.current.hotInstance.getDataAtRow(row);
    }
  };

  const handleAfterChange = async (changes: any, source: any) => {
    if (source === "loadData") return;
    if (changes) {
      for (const [row] of changes) {
        await handleUpdateEDefterIncelemeVerisi(row);
      }
    }
  };

  const handleUpdateEDefterIncelemeVerisi = async (row: number) => {
    const rowData = await handleGetRowData(row);
    if (!rowData) return;
    if (rowData[10] == null || rowData[10] == undefined) rowData[10] = "";
    try {
      const result = await updateEDefterIncelemeVerisi(
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        rowData[0],
        { tespitAciklama: rowData[10] }
      );
      if (!result) console.log("E-Defter İnceleme güncelleme başarısız");
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();
    const processedData = data.map((row: any) => row.slice(1));
    const headers = hotTableInstance.getColHeader().slice(1);
    const fullData = [headers, ...processedData];

    async function createExcelFile() {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sayfa1");
      fullData.forEach((row: any) => worksheet.addRow(row));

      const headerRow = worksheet.getRow(1);
      headerRow.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1a6786" } };
      headerRow.alignment = { horizontal: "left" };
      worksheet.columns.forEach((col) => { col.width = 25; });

      try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "EDefterInceleme.xlsx");
      } catch (error) {
        console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
      }
    }
    createExcelFile();
  };

  useEffect(() => {
    if (hotTableComponent.current) {
      const diff = customizer.isCollapse
        ? 0
        : customizer.SidebarWidth && customizer.MiniSidebarWidth
          ? customizer.SidebarWidth - customizer.MiniSidebarWidth
          : 0;
      hotTableComponent.current.hotInstance.updateSettings({
        width: customizer.isCollapse
          ? "100%"
          : hotTableComponent.current.hotInstance.rootElement.clientWidth - diff,
      });
    }
  }, [customizer.isCollapse, customizer.SidebarWidth, customizer.MiniSidebarWidth]);

  return (
    <>
      <Box sx={{ position: "relative" }}>
        <Backdrop
          sx={{
            position: "absolute",
            zIndex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(2px)",
          }}
          open={isLoading}
        >
          <CircularProgress color="primary" size={50} />
        </Backdrop>
        <CustomHotTable
          theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
          style={{
            height: "100%",
            width: "100%",
            maxHeight: 450,
            maxWidth: "100%",
            opacity: isLoading ? 0.5 : 1,
            transition: "opacity 0.2s ease",
          }}
          language={dictionary.languageCode}
          ref={hotTableComponent}
          data={displayedData}
          height={450}
          colHeaders={colHeaders}
          columns={columns}
          colWidths={[0, 30, 30, 50, 70, 80, 50, 50, 50, 50, 50]}
          stretchH="all"
          manualColumnResize={true}
          rowHeaders={true}
          rowHeights={35}
          autoWrapRow={true}
          minRows={displayedData.length}
          minCols={10}
          hiddenColumns={{ columns: [0] }}
          filters={true}
          columnSorting={true}
          dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]}
          licenseKey="non-commercial-and-evaluation"
          afterChange={handleAfterChange}
          afterScrollVertically={handleAfterScrollVertically}
          contextMenu={{
            items: {
              copy: {},
              fise_git: {
                name: "Fişe Git",
                callback: async function (key: any, selection: any) {
                  const row = await handleGetRowData(selection[0].start.row);
                  setSelectedItemId(row[0]);
                  setSelectedFisNo(row[1]);
                  setIsFisPopupOpen(true);
                },
              },
            },
          }}
          copyPaste={true}
        />
        {isLoadingMore && (
          <Box sx={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "background.paper",
            borderRadius: 2,
            px: 2,
            py: 0.5,
            boxShadow: 2,
            zIndex: 2,
          }}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              Yükleniyor...
            </Typography>
          </Box>
        )}
      </Box>

      {displayedData.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>{displayedData.length}</strong> / <strong>{totalCount}</strong> kayıt gösteriliyor
          </Typography>
          <ExceleAktarButton handleDownload={handleDownload} />
        </Box>
      )}

      {/* Fiş Detayları Popup */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={isFisPopupOpen}
        onClose={() => setIsFisPopupOpen(false)}
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5">Fiş Detayları - Yevmiye No: {selectedFisNo}</Typography>
          <IconButton onClick={() => setIsFisPopupOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedFisNo && (
            <FisDetaylari fisNoProp={selectedFisNo} highlightId={selectedItemId} />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={noDataOpen} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert
          severity="warning"
          variant="filled"
          action={
            <IconButton size="small" color="inherit" onClick={() => setNoDataOpen(false)}>
              <Close fontSize="small" />
            </IconButton>
          }
          sx={{ width: "100%", fontSize: "14px" }}
        >
          E-Defter verisi bulunamadı.
        </Alert>
      </Snackbar>
    </>
  );
};

export default EDefterInceleme;
