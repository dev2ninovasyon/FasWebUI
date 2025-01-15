import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getKrediHesaplanmis } from "@/api/Hesaplamalar/Hesaplamalar";

// register Handsontable's modules
registerAllModules();

interface Veri {
  detayHesapKodu: string;
  hesapAdi: string;
  anaPara: number;
  iskontolu: number;
  iskontosuz: number;
  faizFonVergi: number;
  kalanFaizFonVergi: number;
  kalanFaizFonVergiIskontolu: number;
  faizOrani: number;
  vade: string;
  vadeselDagilim3AyIskontolu: number;
  vadeselDagilim12AyIskontolu: number;
  vadeselDagilim5YilIskontolu: number;
  vadeselDagilim5YildanUzunIskontolu: number;
  vadeselDagilim3AyIskontosuz: number;
  vadeselDagilim12AyIskontosuz: number;
  vadeselDagilim5YilIskontosuz: number;
  vadeselDagilim5YildanUzunIskontosuz: number;
}

interface Props {
  hesaplaTiklandimi: boolean;
}
const KrediHesaplama: React.FC<Props> = ({ hesaplaTiklandimi }) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

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
    "D. Hesap Kodu",
    "Hesap Adı",
    "Ana Para",
    "İskontolu",
    "İskontosuz",
    "Raporlama Tarihine Kadar İşleyen Faiz Fon Vergi",
    "Kalan Faiz Fon Vergi",
    "Kalan Faiz Fon Verginin İskontolu Tutarı",
    "Faiz Oranı",
    "Vade",
    "1-3 Ay",
    "4-12 Ay",
    "1-5 Yıl",
    "5 Yıldan Uzun",
    "1-3 Ay",
    "4-12 Ay",
    "1-5 Yıl",
    "5 Yıldan Uzun",
  ];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Detay Hesap Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Hesap Adı
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Ana Para
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontolu
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontosuz
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Raporlama Tarihine Kadar İşleyen Faiz Fon Vergi
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Kalan Faiz Fon Vergi
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Kalan Faiz Fon Verginin İskontolu Tutarı
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Faiz Oranı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Vade
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // 1-3 Ay İskontolu
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // 4-12 Ay İskontolu
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // 1-5 Yıl İskontolu
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // 5 Yıldan Uzun İskontolu
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // 1-3 Ay İskontosuz
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // 4-12 Ay İskontosuz
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // 1-5 Yıl İskontosuz
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // 5 Yıldan Uzun İskontosuz
  ];

  // Nested Headers
  const nestedHeaders = [
    [
      { label: "", colspan: 10 },
      { label: "Vadesel Dağılım", colspan: 8 },
    ],
    [
      { label: "", colspan: 10 },
      { label: "İskontolu", colspan: 4 },
      { label: "İskontosuz", colspan: 4 },
    ],
    colHeaders,
  ];

  const afterGetColHeader = (col: any, TH: any) => {
    TH.style.height = "55px";

    let div = TH.querySelector("div");
    if (!div) {
      div = document.createElement("div");
      TH.appendChild(div);
    }

    div.style.whiteSpace = "normal";
    div.style.wordWrap = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.height = "100%";
    div.style.position = "relative";

    //typography body1
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    //color
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
    //customizer.activeMode === "dark" ? "#253662" : "#ECF2FF";

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#";

    // Create span for the header text
    let span = div.querySelector("span");
    if (!span) {
      span = document.createElement("span");
      div.appendChild(span);
    }
    span.style.position = "absolute";
    span.style.marginRight = "16px";
    span.style.left = "4px";

    // Create button if it does not exist
    let button = div.querySelector("button");
    if (!button) {
      button = document.createElement("button");
      button.style.display = "none";
      div.appendChild(button);
    }
    button.style.position = "absolute";
    button.style.right = "4px";
  };

  const afterGetRowHeader = (row: any, TH: any) => {
    let div = TH.querySelector("div");
    div.style.whiteSpace = "normal";
    div.style.wordWrap = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.height = "100%";

    //typography body1
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    //color
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
    //customizer.activeMode === "dark" ? "#253662" : "#ECF2FF";

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#";
  };

  const afterRenderer = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    //typography body1
    TD.style.fontFamily = plus.style.fontFamily;
    TD.style.fontWeight = 500;
    TD.style.fontSize = "0.875rem";
    TD.style.lineHeight = "1.334rem";
    //TD.style.textAlign = "left";

    //color
    TD.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";

    if (row % 2 === 0) {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
    } else {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      TD.style.borderRightColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
    }
  };

  const fetchData = async () => {
    try {
      const krediVerileri = await getKrediHesaplanmis(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      const rowsAll: any = [];
      krediVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.detayHesapKodu,
          veri.hesapAdi,
          veri.anaPara,
          veri.iskontolu,
          veri.iskontosuz,
          veri.faizFonVergi,
          veri.kalanFaizFonVergi,
          veri.kalanFaizFonVergiIskontolu,
          veri.faizOrani,
          veri.vade,
          veri.vadeselDagilim3AyIskontolu,
          veri.vadeselDagilim12AyIskontolu,
          veri.vadeselDagilim5YilIskontolu,
          veri.vadeselDagilim5YildanUzunIskontolu,
          veri.vadeselDagilim3AyIskontosuz,
          veri.vadeselDagilim12AyIskontosuz,
          veri.vadeselDagilim5YilIskontosuz,
          veri.vadeselDagilim5YildanUzunIskontosuz,
        ];
        rowsAll.push(newRow);
      });
      rowsAll.sort((a: any, b: any) => (a[0] > b[0] ? 1 : -1));

      setRowCount(rowsAll.length);
      setFetchedData(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
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

    const processedData = data.map((row: any) => row.slice(0));

    const headers = hotTableInstance.getColHeader().slice(0);

    const fullData = [headers, ...processedData];

    async function createExcelFile() {
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
        saveAs(blob, "KrediHesaplama.xlsx");
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.error("Excel dosyası oluşturulurken bir hata oluştu:", error);
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
      <HotTable
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
        nestedHeaders={nestedHeaders}
        //collapsibleColumns={true}
        columns={columns}
        colWidths={[
          80, 140, 100, 100, 100, 100, 100, 100, 100, 80, 100, 100, 100, 115,
          100, 100, 100, 115,
        ]}
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={18}
        filters={true}
        columnSorting={true}
        dropdownMenu={[
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        afterRenderer={afterRenderer}
        contextMenu={["alignment", "copy"]}
      />
      <Grid container marginTop={2} marginBottom={1}>
        <Grid item xs={12} lg={10}></Grid>
        <Grid
          item
          xs={12}
          lg={2}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <ExceleAktarButton
            handleDownload={handleDownload}
          ></ExceleAktarButton>
        </Grid>
      </Grid>
    </>
  );
};

export default KrediHesaplama;
