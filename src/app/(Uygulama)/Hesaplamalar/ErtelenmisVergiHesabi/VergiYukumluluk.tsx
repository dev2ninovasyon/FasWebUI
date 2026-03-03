"use client";

import "@/lib/handsontableSetup";
import { HotTable } from "@handsontable/react";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Alert, Box, Grid, Typography, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getVergiVarligiTumDetay } from "@/api/Hesaplamalar/Hesaplamalar";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Props {
  hesaplaTiklandimi: boolean;
  onDataCount?: (count: number) => void;
}

const VergiYukumluluk: React.FC<Props> = ({ hesaplaTiklandimi, onDataCount }) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);
  const [totalGelen, setTotalGelen] = useState(0);
  const [fetchedData, setFetchedData] = useState<any[]>([]);

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
    "Geçici Farkın Nedeni",
    "Geçici Fark Yükümlülük",
    "Ertelenen Vergi Yükümlülüğü",
  ];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    },
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
    },
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
    },
  ];

  const afterGetColHeader = (col: any, TH: any) => {
    TH.style.height = "50px";

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

    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#cccccc";

    let span = div.querySelector("span.colHeader");
    if (span) {
      span.style.paddingRight = "25px";
    }

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
    if (div) {
      div.style.whiteSpace = "normal";
      div.style.wordWrap = "break-word";
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = "center";
      div.style.height = "100%";
    }

    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
  };

  const afterRenderer = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    TD.style.fontFamily = plus.style.fontFamily;
    TD.style.fontWeight = 500;
    TD.style.fontSize = "0.875rem";
    TD.style.lineHeight = "1.334rem";

    const isTotalRow = cellProperties.instance.getDataAtCell(row, 0) === "Toplam";

    if (isTotalRow) {
      TD.style.fontWeight = "bold";
      TD.style.backgroundColor = theme.palette.primary.light;
    } else if (row % 2 === 0) {
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
      const res = await getVergiVarligiTumDetay(
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      if (res && Array.isArray(res)) {
        setTotalGelen(res.length);

        const filtered = res.filter((x: any) =>
          (x.geciciFarkYukumluluk && x.geciciFarkYukumluluk > 0) ||
          (x.ertelenenVergiYukumlulugu && x.ertelenenVergiYukumlulugu > 0)
        );

        let sumGecici = 0;
        let sumErtelenen = 0;

        const rows = filtered.map((veri: any) => {
          sumGecici += veri.geciciFarkYukumluluk || 0;
          sumErtelenen += veri.ertelenenVergiYukumlulugu || 0;
          return [
            veri.hesapAdi,
            veri.geciciFarkYukumluluk || 0,
            veri.ertelenenVergiYukumlulugu || 0,
          ];
        });

        rows.push(["Toplam", sumGecici, sumErtelenen]);

        setRowCount(rows.length);
        setFetchedData(rows);
        onDataCount?.(filtered.length);
      }
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

    const processedData = data.map((row: any) => row.slice(0));

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
        saveAs(blob, "ErtelenmisVergiHesabiHesaplama.xlsx");
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
      <Box sx={{ mb: 1, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Alert severity="info" sx={{ py: 0, px: 2, fontSize: "0.75rem" }}>
          Gelen satır sayısı: <strong>{totalGelen}</strong>
        </Alert>
        <Alert severity="success" sx={{ py: 0, px: 2, fontSize: "0.75rem" }}>
          Bu tabloya düşen satır: <strong>{rowCount > 0 ? rowCount - 1 : 0}</strong>
        </Alert>
      </Box>
      <HotTable
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
        colWidths={[80, 80, 80]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={3}
        filters={true}
        columnSorting={true}
        dropdownMenu={[
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        licenseKey="non-commercial-and-evaluation"
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        afterRenderer={afterRenderer}
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
            alignItems: "center",
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
    </>
  );
};

export default VergiYukumluluk;
