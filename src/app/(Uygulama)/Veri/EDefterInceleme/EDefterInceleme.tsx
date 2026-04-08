import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Grid,
  useTheme,
  Box,
  Pagination,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Backdrop,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
import { useEffect, useRef, useState, forwardRef } from "react";
import { enqueueSnackbar } from "notistack";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
  getEDefterIncelemeVerileri,
  getEDefterIncelemeVerileriPaged,
  updateEDefterIncelemeVerisi,
} from "@/api/Veri/EDefterInceleme";
import { useRouter } from "next/navigation";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import FisDetaylari from "./FisDetaylari/[id]/FisDetaylari";
import { width } from "@mui/system";

const Transition = forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  fisNo: number;
  fisTarihi: string;
  detayKodu: string;
  hesapAdi: string;
  aciklama: string;
  faturaNo: number;
  muhasebeFisNo: number;
  borc: number;
  alacak: number;
  tespitAciklama: string;
}

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

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);
  const [noDataOpen, setNoDataOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [isFisPopupOpen, setIsFisPopupOpen] = useState(false);
  const [selectedFisNo, setSelectedFisNo] = useState<number | undefined>(
    undefined
  );
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(
    undefined
  );

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
    {
      type: "numeric",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Id
    {
      type: "numeric",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Yevmiye No
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htRight",
    }, // Yevmiye Tarihi
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Detay Kodu
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Hesap Adı
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Açıklama
    {
      type: "numeric",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Fatura No
    {
      type: "numeric",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Muhasebe Fiş No
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htRight",
    }, // Borc
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htRight",
    }, // Alacak
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
    }, // Tespit Açıklama
  ];




  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      const hotInstance = hotTableComponent.current.hotInstance;
      const cellMeta = hotInstance.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const handleAfterChange = async (changes: any, source: any) => {
    //Değişen Cellin Satır Indexi
    let changedRow = -1;
    //Değişen Cellin Satır Verileri
    let changedRowData: any;
    if (source === "loadData") {
      return; // Skip this hook on loadData
    }
    if (changes) {
      for (const [row, prop, oldValue, newValue] of changes) {
        console.log(
          `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
        );
        changedRow = row;

        changedRowData = await handleGetRowData(row);

        //Cell Güncelleme
        if (changedRow >= 0) {
          await handleUpdateEDefterIncelemeVerisi(changedRow);
          changedRow = -1;
        }
      }
    }
  };

  const handleUpdateEDefterIncelemeVerisi = async (row: number) => {
    const rowData = await handleGetRowData(row);
    if (rowData[10] == null || rowData[10] == undefined) {
      rowData[10] == "";
    }
    const updatedEDefterIncelemeVerisi = {
      tespitAciklama: rowData[10],
    };

    try {
      const result = await updateEDefterIncelemeVerisi(
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        rowData[0],
        updatedEDefterIncelemeVerisi
      );
      if (result) {
        await fetchData();
        console.log("E-Defter İnceleme Verisi güncelleme başarılı");
      } else {
        console.log("E-Defter İnceleme güncelleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async (pageNum: number = 1) => {
    try {
      setIsLoading(true);
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
        pageSize
      );

      if (!response || (!response.items && !response.data)) {
        setFetchedData([]);
        setRowCount(0);
        setTotalCount(0);
        setTotalPages(1);
        setCurrentPage(pageNum);
        setNoDataOpen(true);
        return;
      }

      const pagedData = response.data || response;
      const rowsAll: any = [];

      if (Array.isArray(pagedData.items)) {
        pagedData.items.forEach((veri: any) => {
          const newRow: any = [
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
          ];
          rowsAll.push(newRow);
        });
      }

      rowsAll.sort((a: any, b: any) => (a[1] > b[1] ? 1 : -1));

      setNoDataOpen(rowsAll.length === 0);

      setFetchedData(rowsAll);
      setRowCount(rowsAll.length);
      setTotalCount(pagedData.totalCount || 0);
      setTotalPages(
        Math.max(1, Math.ceil((pagedData.totalCount || 0) / pageSize))
      );
      setCurrentPage(pageNum);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
      setFetchedData([]);
      setRowCount(0);
      enqueueSnackbar("Veriler yüklenirken bir hata oluştu", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDataAsync = async () => {
      if (verileriGetirTiklandimi) {
        await fetchData(1); // Reset to first page when filters change
        setVerileriGetirTiklandimi(false);
      }
    };

    fetchDataAsync();
  }, [verileriGetirTiklandimi]);

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

      fullData.forEach((row: any) => {
        worksheet.addRow(row);
      });

      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        name: "Calibri",
        size: 12,
        bold: true,
        color: { argb: "FFFFFF" },
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1a6786" },
      };
      headerRow.alignment = { horizontal: "left" };

      worksheet.columns.forEach((column) => {
        column.width = 25;
      });

      try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "EDefterInceleme.xlsx");
        console.log("Excel dosyası başarıyla oluşturuldu");
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
          : hotTableComponent.current.hotInstance.rootElement.clientWidth -
          diff,
      });
    }
  }, [
    customizer.isCollapse,
    customizer.SidebarWidth,
    customizer.MiniSidebarWidth,
  ]);

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
        <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
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
          data={fetchedData}
          height={450}
          colHeaders={colHeaders}
          columns={columns}
          colWidths={[0, 30, 30, 50, 70, 80, 50, 50, 50, 50, 50]}
          stretchH="all"
          manualColumnResize={true}
          rowHeaders={true}
          rowHeights={35}
          autoWrapRow={true}
          minRows={rowCount}
          minCols={10}
          hiddenColumns={{
            columns: [0],
          }}
          filters={true}
          columnSorting={true}
          dropdownMenu={[
            "filter_by_condition",
            "filter_by_value",
            "filter_action_bar",
          ]}
          licenseKey="non-commercial-and-evaluation" // For non-commercial use only
          afterChange={handleAfterChange}
          contextMenu={{
            items: {
              copy: {},
              fise_git: {
                name: "Fişe Git",
                callback: async function (key, selection) {
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
      </Box>
      {fetchedData.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            marginTop: 2,
            padding: 2,
            backgroundColor: "transparent",
          }}
        >
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            {/* Left side - Page info and navigation */}
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: "nowrap" }}>
                Toplam: <strong>{totalCount}</strong> kayıt
              </Typography>
              {totalPages > 1 && (
                <>
                  <Typography variant="body2" color="textSecondary">|</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sayfa: <strong>{currentPage}/{totalPages}</strong>
                  </Typography>
                </>
              )}
            </Grid>

            {/* Center - Pagination controls */}
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              {totalPages > 1 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* Previous button */}
                  <IconButton
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => fetchData(currentPage - 1)}
                    sx={{
                      color: currentPage === 1 ? "action.disabled" : "primary.main",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                    title="Önceki sayfa"
                  >
                    <ChevronLeft fontSize="small" />
                  </IconButton>

                  {/* Pagination component */}
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, value) => {
                      fetchData(value);
                    }}
                    color="primary"
                    size="small"
                    variant="outlined"
                    shape="rounded"
                  />

                  {/* Next button */}
                  <IconButton
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => fetchData(currentPage + 1)}
                    sx={{
                      color: currentPage === totalPages ? "action.disabled" : "primary.main",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                    title="Sonraki sayfa"
                  >
                    <ChevronRight fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Grid>

            {/* Right side - Export button */}
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 4,
              }}
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <ExceleAktarButton handleDownload={handleDownload} />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Fiş Detayları Popup */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={isFisPopupOpen}
        onClose={() => setIsFisPopupOpen(false)}
        TransitionComponent={Transition}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">Fiş Detayları - Yevmiye No: {selectedFisNo}</Typography>
          <IconButton onClick={() => setIsFisPopupOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedFisNo && (
            <FisDetaylari
              fisNoProp={selectedFisNo}
              highlightId={selectedItemId}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={noDataOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="warning"
          variant="filled"
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setNoDataOpen(false)}
            >
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
