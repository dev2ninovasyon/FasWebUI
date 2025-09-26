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
import { getDonusumMizan } from "@/api/Donusum/Donusum";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  kebirKodu: number;
  detayKodu: number;
  yil: number;
  hesapAdi: string;
  vukBorc: number;
  vukAlacak: number;
  fisBorc: number;
  fisAlacak: number;
  raporBorc: number;
  raporAlacak: number;
  borcBakiye: number;
  alacakBakiye: number;
}

interface Props {
  konsolidasyonMu?: boolean;
  donusumIslemiYapTiklandiMi?: boolean;
  setDonusumIslemiYapTiklandiMi?: (bool: boolean) => void;
}

const DonusumMizanKontrol: React.FC<Props> = ({
  konsolidasyonMu = false,
  donusumIslemiYapTiklandiMi,
  setDonusumIslemiYapTiklandiMi,
}) => {
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
    "Kebir Kodu",
    "Detay Kodu",
    "Yıl",
    "Hesap Adı",
    "Vuk Borç",
    "Vuk Alacak",
    "Dönüşüm Borç",
    "Dönüşüm Alacak",
    "Rapor Borç",
    "Rapor Alacak",
    "Borç Bakiye",
    "Alacak Bakiye",
  ];

  const columns = [
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      readOnly: true,
      editor: false,
    }, // Kebir Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Detay Kodu
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      readOnly: true,
      editor: false,
    }, // Yıl
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
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Vuk Borç
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Vuk Alacak
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Dönüşüm Borç
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Dönüşüm Alacak
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Rapor Borç
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Rapor Alacak
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Borç Bakiye
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Alacak Bakiye
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
    span.textContent = colHeaders[col];
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
      const donusumMizanVerileri = await getDonusumMizan(
        user.token || "",
        user.denetlenenId || 0,
        user.yil || 0,
        konsolidasyonMu
      );

      let totalVukBorc = 0;
      let totalVukAlacak = 0;

      let totalFisBorc = 0;
      let totalFisAlacak = 0;

      let totalRaporBorc = 0;
      let totalRaporAlacak = 0;

      let totalBorcBakiye = 0;
      let totalAlacakBakiye = 0;

      const rowsAll: any = [];
      donusumMizanVerileri.forEach((veri: any) => {
        if (
          veri.vukBorc === 0 &&
          veri.vukAlacak === 0 &&
          veri.fisBorc === 0 &&
          veri.fisAlacak === 0 &&
          veri.raporBorc === 0 &&
          veri.raporAlacak === 0 &&
          veri.borcBakiye === 0 &&
          veri.alacakBakiye === 0
        ) {
          return;
        }

        // Negatif bakiye düzeltme
        if (veri.borcBakiye < 0) {
          veri.alacakBakiye = Math.abs(veri.borcBakiye);
          veri.borcBakiye = 0;
        } else if (veri.alacakBakiye < 0) {
          veri.borcBakiye = Math.abs(veri.alacakBakiye);
          veri.alacakBakiye = 0;
        }

        const newRow: any = [
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
          veri.borcBakiye,
          veri.alacakBakiye,
        ];

        rowsAll.push(newRow);

        if (veri.detayKodu.length == 3) {
          totalVukBorc += veri.vukBorc;
          totalVukAlacak += veri.vukAlacak;

          totalFisBorc += veri.fisBorc;
          totalFisAlacak += veri.fisAlacak;

          totalRaporBorc += veri.raporBorc;
          totalRaporAlacak += veri.raporAlacak;

          totalBorcBakiye += veri.borcBakiye;
          totalAlacakBakiye += veri.alacakBakiye;
        }
      });

      rowsAll.push([
        undefined,
        undefined,
        undefined,
        "Toplam",
        totalVukBorc,
        totalVukAlacak,
        totalFisBorc,
        totalFisAlacak,
        totalRaporBorc,
        totalRaporAlacak,
        totalBorcBakiye,
        totalAlacakBakiye,
      ]);
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
    if (!donusumIslemiYapTiklandiMi) {
      fetchData();
    } else {
      setRowCount(0);
      setFetchedData([]);
    }
  }, [donusumIslemiYapTiklandiMi]);

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
        saveAs(blob, "DonusumMizan.xlsx");
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
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[50, 50, 50, 120, 100, 100, 100, 100, 100, 100, 100, 100]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={12}
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

export default DonusumMizanKontrol;
