import "@/lib/handsontableSetup";
import Handsontable from "handsontable";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Alert, Button, Grid, IconButton, Snackbar, useTheme } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { useRouter } from "next/navigation";
import {
  getFisListesiVerileri,
  updateFisDurumu,
} from "@/api/Donusum/FisListesi";
import { IconFileTypeXls } from "@tabler/icons-react";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  fisNo: number;
  fisTipi: string;
  detayKodu: string;
  hesapAdi: string;
  borc: number;
  alacak: number;
  aciklama: string;
}

const COL_HEADERS = [
  "Id", "No", "Tip", "Detay Kodu", "Hesap Adı", "Borç", "Alacak", "Açıklama",
];

const COLUMNS = [
  { type: "numeric", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
  { type: "numeric", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
  { type: "text", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
  { type: "text", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
  { type: "text", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
  { type: "numeric", numericFormat: { pattern: "0,0.00", columnSorting: true, culture: "tr-TR" }, readOnly: true, editor: false, className: "htRight" },
  { type: "numeric", numericFormat: { pattern: "0,0.00", columnSorting: true, culture: "tr-TR" }, readOnly: true, editor: false, className: "htRight" },
  { type: "text", columnSorting: true, readOnly: true, editor: false, className: "htLeft" },
];

const FisListesi = () => {
  const hotTableContainer = useRef<HTMLDivElement>(null);
  const hotTableInstanceRef = useRef<Handsontable | null>(null);
  const handleUpdateFisDurumuRef = useRef<(fisNo: number) => void>(() => {});
  const afterRenderer2Ref = useRef<(...args: any[]) => void>(() => {});

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);
  const [noDataOpen, setNoDataOpen] = useState(false);

  let control = "";
  let controlRowNumber = -1;

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





  const afterRenderer2 = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    TD.style.whiteSpace = "nowrap";
    TD.style.overflow = "hidden";
    //TD.style.textAlign = "left";

    if (col === 1) {
      if (parseInt(value) % 2 !== 0) {
        control = "odd";
      } else if (parseInt(value) % 2 == 0) {
        control = "even";
      }
    }

    if (control == "odd") {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
      
    } else if (control == "even") {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      
    }

    if (col === 4) {
      if (value === "Toplam") {
        controlRowNumber = row;
      }
    }

    if (row === controlRowNumber && col === 7) {
      if (value == "Aktif") {
        TD.style.color =
          customizer.activeMode === "dark"
            ? theme.palette.success.dark
            : theme.palette.success.main;
      } else {
        TD.style.color =
          customizer.activeMode === "dark"
            ? theme.palette.error.dark
            : theme.palette.error.main;
      }
    }
  };

  const handleGetRowData = async (row: number) => {
    if (hotTableInstanceRef.current) {
      const cellMeta = hotTableInstanceRef.current.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const handleUpdateFisDurumu = async (fisNo: number) => {
    try {
      console.log("[FisDurumu] Calling updateFisDurumu, fisNo:", fisNo, "denetciId:", user.denetciId, "denetlenenId:", user.denetlenenId, "yil:", user.yil);
      const result = await updateFisDurumu(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        fisNo,
        false
      );
      console.log("[FisDurumu] updateFisDurumu result:", result);
      if (result) {
        // Directly update the Toplam row cell in HOT without full reload (avoids scroll reset)
        if (hotTableInstanceRef.current) {
          const allData = hotTableInstanceRef.current.getData() as any[][];
          allData.forEach((row, rowIdx) => {
            if (row[1] === fisNo && row[4] === "Toplam") {
              const current = row[7];
              hotTableInstanceRef.current!.setDataAtCell(rowIdx, 7, current === "Aktif" ? "Pasif" : "Aktif");
            }
          });
        }
        void fetchData();
        enqueueSnackbar("Fiş Durumu Değiştirildi", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
            maxWidth: "720px",
          },
        });
      } else {
        enqueueSnackbar("Fiş Durumu Değiştirilemedi", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  handleUpdateFisDurumuRef.current = handleUpdateFisDurumu;
  afterRenderer2Ref.current = afterRenderer2;

  const fetchData = async () => {
    try {
      const fisListesiVerileri = await getFisListesiVerileri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        false
      );
      console.log("[FisDurumu] getFisListesiVerileri returned:", Array.isArray(fisListesiVerileri) ? fisListesiVerileri.length + " rows" : fisListesiVerileri);
      const rowsAll: any = [];
      fisListesiVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.fisNo,
          veri.fisTipi,
          veri.detayKodu,
          veri.hesapAdi,
          veri.borc,
          veri.alacak,
          veri.aciklama,
        ];
        rowsAll.push(newRow);
      });

      setFetchedData(rowsAll);
      setNoDataOpen(rowsAll.length === 0);
      setRowCount(rowsAll.length);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (hotTableContainer.current && !hotTableInstanceRef.current) {
      hotTableInstanceRef.current = new Handsontable(hotTableContainer.current, {
        data: [],
        colHeaders: COL_HEADERS,
        columns: COLUMNS,
        language: dictionary.languageCode,
        theme: customizer.activeMode === "dark" ? 'ht-theme-horizon-dark' : 'ht-theme-horizon',
        height: 684,
        colWidths: [0, 20, 30, 30, 70, 60, 60, 70, 60],
        stretchH: 'all',
        manualColumnResize: true,
        rowHeaders: true,
        rowHeights: 35,
        autoWrapRow: true,
        minRows: 0,
        minCols: 9,
        hiddenColumns: {
          columns: [0],
        },
        filters: true,
        columnSorting: true,
        dropdownMenu: [
          'filter_by_condition',
          'filter_by_value',
          'filter_action_bar',
        ],
        licenseKey: 'non-commercial-and-evaluation',
        afterRenderer: (TD, row, col, prop, value, cellProperties) =>
          afterRenderer2Ref.current(TD, row, col, prop, value, cellProperties),
        contextMenu: {
          items: {
            copy: {},
            fise_git: {
              name: 'Fişe Git',
              callback: async function (key, selection) {
                if (!selection || !selection.length) return;
                const rowIdx = selection[0].start.row;
                const row = await handleGetRowData(rowIdx);
                if (!row) return;
                router.push(`/Donusum/FisListesi/FisDetaylari/${row[1]}`);
              },
            },
            fise_durumu_degistir: {
              name: 'Fiş Durumu Değiştir',
              callback: async function (key, selection) {
                if (!selection || !selection.length) return;
                const rowIdx = selection[0].start.row;
                const row = await handleGetRowData(rowIdx);
                if (!row) return;
                await handleUpdateFisDurumuRef.current(row[1]);
              },
            },
          },
        },
        copyPaste: true,
      });
    }

    return () => {
      if (hotTableInstanceRef.current) {
        hotTableInstanceRef.current.destroy();
        hotTableInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hotTableInstanceRef.current) {
      // updateData preserves scroll/sort/filter state; loadData resets viewport
      hotTableInstanceRef.current.updateData(fetchedData);
    }
  }, [fetchedData]);

  const handleDownload = () => {
    if (!hotTableInstanceRef.current) return;
    
    const data = hotTableInstanceRef.current.getData();
    const processedData = data.map((row: any) => row.slice(1));
    const headers = hotTableInstanceRef.current.getColHeader().slice(1);
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
        saveAs(blob, "FisListesi.xlsx");
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
      }
    }
    createExcelFile();
  };

  useEffect(() => {
    if (hotTableInstanceRef.current) {
      hotTableInstanceRef.current.updateSettings({
        theme: customizer.activeMode === "dark" ? 'ht-theme-horizon-dark' : 'ht-theme-horizon',
      });
    }
  }, [customizer.activeMode]);

  useEffect(() => {
    if (hotTableInstanceRef.current && hotTableContainer.current) {
      const diff = customizer.isCollapse
        ? 0
        : customizer.SidebarWidth && customizer.MiniSidebarWidth
          ? customizer.SidebarWidth - customizer.MiniSidebarWidth
          : 0;

      hotTableInstanceRef.current.updateSettings({
        width: customizer.isCollapse
          ? "100%"
          : hotTableContainer.current.clientWidth - diff,
      });
    }
  }, [customizer.isCollapse]);

  return (
    <Grid container>
      <Grid
        mb={2}
        size={{
          xs: 12,
          lg: 12
        }}>
        <div 
          ref={hotTableContainer} 
          style={{
            height: "100%",
            width: "100%",
            maxHeight: 684,
            maxWidth: "100%",
          }} 
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 10
        }}></Grid>
      <Grid
        display={"flex"}
        alignItems={"end"}
        sx={{ py: 2, pl: { lg: 2 } }}
        size={{
          xs: 12,
          lg: 2
        }}>
        <Button
          size="medium"
          variant="outlined"
          color="primary"
          startIcon={<IconFileTypeXls width={18} />}
          onClick={() => handleDownload()}
          sx={{ width: "100%" }}
        >
          Excel&apos;e Aktar
        </Button>
      </Grid>
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
          Fiş listesi verisi bulunamadı.
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default FisListesi;
