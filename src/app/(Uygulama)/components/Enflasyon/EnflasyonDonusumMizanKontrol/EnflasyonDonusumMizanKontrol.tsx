"use client";
import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getEnflasyonDetayMizan } from "@/api/Enflasyon/DetayMizan";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

const EnflasyonDonusumMizanKontrol: React.FC = () => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);
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
    "Kebir Kodu",
    "Detay Kodu",
    "Yıl",
    "Hesap Adı",
    "VUK Borç",
    "VUK Alacak",
    "Fiş Borç",
    "Fiş Alacak",
    "Rapor Borç",
    "Rapor Alacak",
    "Enflasyon Fiş Borç",
    "Enflasyon Fiş Alacak",
    "Enflasyon Fiş Bakiye",
    "Düzeltme Bakiye",
  ];

  const numericCol = {
    type: "numeric" as const,
    numericFormat: { pattern: "0,0", culture: "tr-TR" },
    className: "htRight",
    readOnly: true,
    editor: false as const,
    columnSorting: true,
  };

  const columns = [
    { type: "numeric" as const, columnSorting: true, className: "htLeft", readOnly: true, editor: false as const },
    { type: "text" as const, columnSorting: true, className: "htLeft", readOnly: true, editor: false as const },
    { type: "numeric" as const, columnSorting: true, className: "htLeft", readOnly: true, editor: false as const },
    { type: "text" as const, columnSorting: true, className: "htLeft", readOnly: true, editor: false as const },
    numericCol,
    numericCol,
    numericCol,
    numericCol,
    numericCol,
    numericCol,
    numericCol,
    numericCol,
    numericCol,
    numericCol,
  ];




  const fetchData = async () => {
    try {
      const veriler = await getEnflasyonDetayMizan(user.denetlenenId || 0, user.yil || 0);
      if (!veriler || veriler.length === 0) {
        setRowCount(0);
        setFetchedData([]);
        return;
      }

      let totalVukBorc = 0, totalVukAlacak = 0;
      let totalFisBorc = 0, totalFisAlacak = 0;
      let totalRaporBorc = 0, totalRaporAlacak = 0;
      let totalEnfFisBorc = 0, totalEnfFisAlacak = 0, totalEnfFisBakiye = 0;
      let totalDuzeltmeBakiye = 0;

      const rows: any[] = [];
      veriler.forEach((veri: any) => {
        const row = [
          veri.kebirKodu,
          veri.detayKodu,
          veri.yil,
          veri.hesapAdi,
          veri.vukBorc,
          veri.vukAlacak,
          veri.fisBorc,
          veri.fisAlacak,
          veri.raporBorc,
          veri.raporAlacak,
          veri.enflasyonFisBorc,
          veri.enflasyonFisAlacak,
          veri.enflasyonFisBakiye,
          veri.duzeltmeBakiye,
        ];
        rows.push(row);

        if (veri.detayKodu && String(veri.detayKodu).length > 3) {
          totalVukBorc = Number((totalVukBorc + (veri.vukBorc || 0)).toFixed(2));
          totalVukAlacak = Number((totalVukAlacak + (veri.vukAlacak || 0)).toFixed(2));
          totalFisBorc = Number((totalFisBorc + (veri.fisBorc || 0)).toFixed(2));
          totalFisAlacak = Number((totalFisAlacak + (veri.fisAlacak || 0)).toFixed(2));
          totalRaporBorc = Number((totalRaporBorc + (veri.raporBorc || 0)).toFixed(2));
          totalRaporAlacak = Number((totalRaporAlacak + (veri.raporAlacak || 0)).toFixed(2));
          totalEnfFisBorc = Number((totalEnfFisBorc + (veri.enflasyonFisBorc || 0)).toFixed(2));
          totalEnfFisAlacak = Number((totalEnfFisAlacak + (veri.enflasyonFisAlacak || 0)).toFixed(2));
          totalEnfFisBakiye = Number((totalEnfFisBakiye + (veri.enflasyonFisBakiye || 0)).toFixed(2));
          totalDuzeltmeBakiye = Number((totalDuzeltmeBakiye + (veri.duzeltmeBakiye || 0)).toFixed(2));
        }
      });

      rows.push([
        undefined, undefined, undefined, "Toplam",
        totalVukBorc, totalVukAlacak,
        totalFisBorc, totalFisAlacak,
        totalRaporBorc, totalRaporAlacak,
        totalEnfFisBorc, totalEnfFisAlacak, totalEnfFisBakiye,
        totalDuzeltmeBakiye,
      ]);

      setRowCount(rows.length);
      setFetchedData(rows);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();
    const headers = hotTableInstance.getColHeader().slice(0);
    const fullData = [headers, ...data.map((row: any) => row.slice(0))];

    async function createExcelFile() {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sayfa1");
      fullData.forEach((row: any) => worksheet.addRow(row));
      const headerRow = worksheet.getRow(1);
      headerRow.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1a6786" } };
      headerRow.alignment = { horizontal: "left" };
      worksheet.columns.forEach((column) => { column.width = 25; });
      try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "EnflasyonDonusumMizan.xlsx");
      } catch (error) {
        console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
      }
    }
    createExcelFile();
  };

  return (
    <>
      <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
        style={{ height: "100%", width: "100%", maxHeight: 684, maxWidth: "100%" }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={684}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[60, 70, 50, 120, 90, 90, 90, 90, 90, 90, 110, 110, 110, 110]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={14}
        filters={true}
        columnSorting={true}
        dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]}
        licenseKey="non-commercial-and-evaluation"
        contextMenu={["alignment", "copy"]}
      />
      <Grid container marginTop={2} marginBottom={1}>
        <Grid size={{ xs: 12, lg: 10 }} />
        <Grid sx={{ display: "flex", justifyContent: "flex-end" }} size={{ xs: 12, lg: 2 }}>
          <ExceleAktarButton handleDownload={handleDownload} />
        </Grid>
      </Grid>
    </>
  );
};

export default EnflasyonDonusumMizanKontrol;
