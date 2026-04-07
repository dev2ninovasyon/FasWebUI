"use client";

import "@/lib/handsontableSetup";
import { HotTable } from "@handsontable/react";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'handsontable/styles/ht-icons-main.css';
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



  const afterRenderer = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {

    const isTotalRow = cellProperties.instance.getDataAtCell(row, 0) === "Toplam";

    if (isTotalRow) {
      TD.style.backgroundColor = theme.palette.primary.light;
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
      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Box sx={{ minWidth: 450 }}>
          <HotTable theme={customizer.activeMode === "dark" ? "horizon-dark" : "horizon"}
            style={{
              height: "100%",
              width: "100%",
              maxHeight: 342,
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
            afterRenderer={afterRenderer}
            contextMenu={["alignment", "copy"]}
          />
        </Box>
      </Box>
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
