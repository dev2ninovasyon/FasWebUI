import "@/lib/handsontableSetup";
import Handsontable from "handsontable";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Button, Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { useRouter } from "next/navigation";
import { IconFileTypeXls } from "@tabler/icons-react";
import {
  createFisListesineHazirFis,
  getHazirFisListesiVerileri,
} from "@/api/Donusum/HazirFisListesi";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Props {
  konsolidasyonMu?: boolean;
}

interface Veri {
  id: number;
  yevmiyeNo: number;
  fisTipi: string;
  detayKodu: string;
  hesapAdi: string;
  borc: number;
  alacak: number;
  aciklama: string;
}

const HazirFisListesi: React.FC<Props> = ({ konsolidasyonMu = false }) => {
  const hotTableContainer = useRef<HTMLDivElement>(null);
  const hotTableInstanceRef = useRef<Handsontable | null>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  let control = "";

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
    "No",
    "Tip",
    "Detay Kodu",
    "Hesap Adı",
    "Borç",
    "Alacak",
    "Açıklama",
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
    }, // Fiş No
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Tip
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
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
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
      readOnly: true,
      editor: false,
      className: "htRight",
    }, // Alacak
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Açıklama
  ];




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
  };

  const handleGetRowData = async (row: number) => {
    if (hotTableInstanceRef.current) {
      const cellMeta = hotTableInstanceRef.current.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const fetchData = async () => {
    try {
      const hazirFisListesiVerileri = await getHazirFisListesiVerileri(user.denetimTuru || ""
      );
      const rowsAll: any = [];
      hazirFisListesiVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.yevmiyeNo,
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
        data: fetchedData,
        colHeaders: colHeaders,
        columns: columns,
        language: dictionary.languageCode,
        theme: customizer.activeMode === "dark" ? 'ht-theme-horizon-dark' : 'ht-theme-horizon',
        height: 586,
        autoColumnSize: { useHeaders: true },
        colWidths: [0.1, 30, 70, 100, 350, 80, 80, 300],
        stretchH: 'all',
        manualColumnResize: true,
        rowHeaders: true,
        rowHeights: 35,
        autoWrapRow: true,
        minRows: rowCount,
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
        contextMenu: {
          items: {
            copy: {},
            fis_listesine_ekle: {
              name: 'Fiş Listesine Ekle',
              callback: async function (key, selection) {
                const row = await handleGetRowData(selection[0].start.row);
                if (!row) return;
                try {
                  const result = await createFisListesineHazirFis(
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    user.denetimTuru || '',
                    row[0],
                    konsolidasyonMu
                  );
                  if (result) {
                    enqueueSnackbar('Fiş Listesine Eklendi', {
                      variant: 'success',
                      autoHideDuration: 5000,
                      style: {
                        backgroundColor:
                          customizer.activeMode === 'dark'
                            ? theme.palette.success.light
                            : theme.palette.success.main,
                        maxWidth: '720px',
                      },
                    });
                  } else {
                    enqueueSnackbar('Fiş Listesine Eklenemedi', {
                      variant: 'error',
                      autoHideDuration: 5000,
                      style: {
                        backgroundColor:
                          customizer.activeMode === 'dark'
                            ? theme.palette.error.light
                            : theme.palette.error.main,
                        maxWidth: '720px',
                      },
                    });
                  }
                } catch (error) {
                  console.log('Bir hata oluştu:', error);
                }
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
  }, [fetchedData, rowCount, colHeaders, columns, dictionary, customizer, theme, user]);

  useEffect(() => {
    if (hotTableInstanceRef.current && fetchedData.length > 0) {
      hotTableInstanceRef.current.updateSettings({
        afterRenderer: afterRenderer2,
      });
      hotTableInstanceRef.current.render();
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
        saveAs(blob, "HazirFisListesi.xlsx");
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
      }
    }
    createExcelFile();
  };

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

  useEffect(() => {
    if (hotTableInstanceRef.current) {
      hotTableInstanceRef.current.updateSettings({
        theme: customizer.activeMode === "dark" ? 'ht-theme-horizon-dark' : 'ht-theme-horizon',
      });
    }
  }, [customizer.activeMode]);

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
            maxHeight: 586,
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
    </Grid>
  );
};

export default HazirFisListesi;

