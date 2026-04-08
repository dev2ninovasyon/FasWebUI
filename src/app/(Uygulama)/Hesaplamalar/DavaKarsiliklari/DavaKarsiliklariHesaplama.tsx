import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Alert, Grid, IconButton, Snackbar, useTheme } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getDavaKarsiliklariVerileriByDenetciDenetlenenYil } from "@/api/Veri/DavaKarsiliklari";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  aleyhteDavacininLehteDavalininUnvani: string;
  aleyhteLehte: string;
  davaKonusu: string;
  davaYili: number;
  mahkemeAsamasi: string;
  varsaYerelMahkemeKarari: string;
  durusmaAsamasi: string;
  muhtemelDeger: number;
  aleyhteKaybetmeLehteKazanmaIhtimali: string;
  ongorulenSonuclanmaSuresi: string;
  denetcininVardigiSonuc: string;
  sonucunTutari: number;
}

interface Props {
  hesaplaTiklandimi: boolean;
  onDataCount?: (count: number) => void;
}

const DavaKarsiliklariHesaplama: React.FC<Props> = ({
  hesaplaTiklandimi,
  onDataCount,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);
  const [noDataOpen, setNoDataOpen] = useState(false);

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
    "Aleyhte Davacının / Lehte Davalının Ünvanı",
    "Aleyhte / Lehte ?",
    "Dava Konusu",
    "Dava Yılı",
    "Mahkeme Aşaması",
    "Varsa, Yerel Mahkeme Kararı",
    "Duruşma Aşaması",
    "Muhtemel Değer",
    "Aleyhte Kaybetme / Lehte Kazanma ihtimali",
    "Öngörülen Sonuçlanma Süresi",
    "Denetçinin Vardığı Sonuç",
    "Sonucun Tutarı",
  ];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Aleyhte Davacının / Lehte Davalının Ünvanı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Aleyhte / Lehte ?
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Dava Konusu
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Dava Yılı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Mahkeme Aşaması
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Varsa, Yerel Mahkeme Kararı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Duruşma Aşaması
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Muhtemel Değer
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Aleyhte Kaybetme / Lehte Kazanma ihtimali
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Öngörülen Sonuçlanma Süresi
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Denetçinin Vardığı Sonuç
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Sonucun Tutarı
  ];




  const fetchData = async () => {
    try {
      const davaKarsiliklariVerileri =
        await getDavaKarsiliklariVerileriByDenetciDenetlenenYil(user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );

      const rowsAll: any = [];
      davaKarsiliklariVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.aleyhteDavacininLehteDavalininUnvani,
          veri.aleyhteLehte,
          veri.davaKonusu,
          veri.davaYili,
          veri.mahkemeAsamasi,
          veri.varsaYerelMahkemeKarari,
          veri.durusmaAsamasi,
          veri.muhtemelDeger,
          veri.aleyhteKaybetmeLehteKazanmaIhtimali,
          veri.ongorulenSonuclanmaSuresi,
          veri.denetcininVardigiSonuc,
          veri.sonucunTutari,
        ];
        rowsAll.push(newRow);
      });

      rowsAll.sort((a: any, b: any) => (a[1] > b[1] ? 1 : -1));

      setRowCount(rowsAll.length);
      setFetchedData(rowsAll);
      setNoDataOpen(rowsAll.length === 0);
      onDataCount?.(rowsAll.length);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setFetchedData([]);
      setRowCount(0);
    } else {
      fetchData();
    }
  }, [hesaplaTiklandimi]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) =>
      row.map((cell: any) => {
        if (typeof cell === "string") {
          return cell.replace(/^\d+\)\s+/, "");
        }
        return cell;
      })
    );

    const headers = hotTableInstance.getColHeader().slice(0);

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
        saveAs(blob, "DavaKarsiliklariHesaplama.xlsx");
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
    <>
      <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
        style={{
          height: "100%",
          width: "100%",
          maxHeight: 342,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={342}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[80, 60, 60, 60, 60, 70, 70, 60, 80, 60, 60, 60]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={8}
        filters={true}
        columnSorting={true}
        dropdownMenu={[
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        contextMenu={["alignment", "copy"]}
      />
      <Grid container marginTop={2} marginBottom={1}>
        <Grid
          size={{
            xs: 12,
            lg: 10
          }}></Grid>
        <Grid
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
          size={{
            xs: 12,
            lg: 2
          }}>
          <ExceleAktarButton
            handleDownload={handleDownload}
          ></ExceleAktarButton>
        </Grid>
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
          Dava karşılıkları verisi bulunamadı.
        </Alert>
      </Snackbar>
    </>
  );
};

export default DavaKarsiliklariHesaplama;

