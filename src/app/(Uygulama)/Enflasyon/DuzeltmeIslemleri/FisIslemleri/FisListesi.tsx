import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Button, Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { useRouter } from "next/navigation";
import {
  getFisListesiVerileri,
  updateFisDurumu,
} from "@/api/Enflasyon/FisIslemleri";
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

const FisListesi = () => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

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
    if (hotTableComponent.current) {
      const hotInstance = hotTableComponent.current.hotInstance;
      const cellMeta = hotInstance.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const handleUpdateFisDurumu = async (fisNo: number) => {
    try {
      const result = await updateFisDurumu(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        fisNo,
        false
      );
      if (result) {
        await fetchData();
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

  const fetchData = async () => {
    try {
      const fisListesiVerileri = await getFisListesiVerileri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        false
      );
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
      setRowCount(rowsAll.length);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const hotInstance = hotTableComponent.current.hotInstance;

    hotInstance.updateSettings({
      afterRenderer: afterRenderer2,
    });

    hotInstance.render();
  }, [fetchedData]);

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
        saveAs(blob, "FisListesi.xlsx");
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
  }, [customizer.isCollapse]);

  return (
    <Grid container>
      <Grid
        mb={2}
        size={{
          xs: 12,
          lg: 12
        }}>
        <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
          style={{
            height: "100%",
            width: "100%",
            maxHeight: 684,
            maxWidth: "100%",
          }}
          language={dictionary.languageCode}
          ref={hotTableComponent}
          data={fetchedData}
          height={684}
          colHeaders={colHeaders}
          columns={columns}
          colWidths={[0, 20, 30, 30, 70, 60, 60, 70, 60]}
          stretchH="all"
          manualColumnResize={true}
          rowHeaders={true}
          rowHeights={35}
          autoWrapRow={true}
          minRows={rowCount}
          minCols={9}
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
          contextMenu={{
            items: {
              copy: {},
              fise_git: {
                name: "Fişe Git",
                callback: async function (key, selection) {
                  const row = await handleGetRowData(selection[0].start.row);
                  router.push(`/Enflasyon/DuzeltmeIslemleri/FisIslemleri/FisDetaylari/${row[1]}`);
                },
              },
              fise_durumu_değiştir: {
                name: "Fiş Durumu Değiştir",
                callback: async function (key, selection) {
                  const row = await handleGetRowData(selection[0].start.row);

                  handleUpdateFisDurumu(row[1]);
                },
              },
            },
          }}
          copyPaste={true}
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

export default FisListesi;

