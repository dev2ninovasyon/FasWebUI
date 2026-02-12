import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getKrediHesaplanmisBakiye } from "@/api/Hesaplamalar/Hesaplamalar";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  hesapKodu: string;
  hesapAdi: string;
  mizanBakiye: number;
  iskontolu: number;
  fark: number;

  detayKodu: string;
  paraBirimi: string;
  borc: number | null;
  alacak: number | null;
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
  }, [customizer.activeMode, dispatch]);

  const colHeaders = useMemo(
    () => [
      "Hesap Kodu",
      "Hesap Adı",
      "Mizan Bakiye",
      "İskontolu",
      "Fark",
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        data: "hesapKodu",
        type: "text",
        className: "htLeft",
        readOnly: true,
        editor: false,
      },
      {
        data: "hesapAdi",
        type: "text",
        className: "htLeft",
        readOnly: true,
        editor: false,
      },
      {
        data: "mizanBakiye",
        type: "numeric",
        numericFormat: { pattern: "0,0.00", culture: "tr-TR" },
        className: "htRight",
        readOnly: true,
        editor: false,
      },
      {
        data: "iskontolu",
        type: "numeric",
        numericFormat: { pattern: "0,0.00", culture: "tr-TR" },
        className: "htRight",
        readOnly: true,
        editor: false,
      },
      {
        data: "fark",
        type: "numeric",
        numericFormat: { pattern: "0,0.00", culture: "tr-TR" },
        className: "htRight",
        readOnly: true,
        editor: false,
      },
    ],
    []
  );

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

    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = "500";
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#";

    let span = div.querySelector("span");
    if (!span) {
      span = document.createElement("span");
      div.appendChild(span);
    }
    span.style.position = "absolute";
    span.style.marginRight = "16px";
    span.style.left = "4px";

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
    if (!div) return;

    div.style.whiteSpace = "normal";
    div.style.wordWrap = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.height = "100%";

    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = "500";
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
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
    TD.style.fontFamily = plus.style.fontFamily;
    TD.style.fontWeight = "500";
    TD.style.fontSize = "0.875rem";
    TD.style.lineHeight = "1.334rem";

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
      const krediVerileri = await getKrediHesaplanmisBakiye(
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      const list = Array.isArray(krediVerileri) ? krediVerileri : [];

      const mapped: Veri[] = list.map((veri: any) => {
        const mizan = Number(veri.mizanBakiye ?? 0);
        const iskontolu = Number(veri.iskontolu ?? 0);
        const fark = Number(veri.fark ?? (mizan - iskontolu));

        // İstediğin kurala göre:
        // fark eksi ise 660 BORÇ, artı ise 660 ALACAK
        const borc = fark < 0 ? Math.abs(fark) : null;
        const alacak = fark > 0 ? fark : null;

        return {
          hesapKodu: String(veri.hesapKodu ?? ""),
          hesapAdi: String(veri.hesapAdi ?? ""),
          mizanBakiye: mizan,
          iskontolu,
          fark,
          detayKodu: "660-01",
          paraBirimi: String(veri.paraBirimi ?? "TL"),
          borc,
          alacak,
        };
      });

      setRowCount(mapped.length);
      setFetchedData(mapped);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
      setRowCount(0);
      setFetchedData([]);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setFetchedData([]);
      setRowCount(0);
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hesaplaTiklandimi]);

  const handleDownload = () => {
    const hot = hotTableComponent.current?.hotInstance;
    if (!hot) return;

    const data: Veri[] = hot.getSourceData() || [];

    const headers = colHeaders.slice(0);
    const rows = data.map((r) => [
      r.hesapKodu,
      r.hesapAdi,
      r.mizanBakiye,
      r.iskontolu,
      r.fark,
      r.detayKodu,
      r.paraBirimi,
      r.borc ?? 0,
      r.alacak ?? 0,
    ]);

    const fullData = [headers, ...rows];

    async function createExcelFile() {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sayfa1");

      fullData.forEach((row) => worksheet.addRow(row));

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

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "KrediHesaplama.xlsx");
    }

    createExcelFile().catch((e) =>
      console.log("Excel dosyası oluşturulurken bir hata oluştu:", e)
    );
  };

  useEffect(() => {
    const handleResize = () => {
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
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [customizer.isCollapse, customizer.SidebarWidth, customizer.MiniSidebarWidth]);

  return (
    <>
      <HotTable
        style={{ height: "100%", width: "100%", maxHeight: 684, maxWidth: "100%" }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        colHeaders={colHeaders}
        height={684}
        columns={columns}
        colWidths={[80, 220, 130, 130, 130]}
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={colHeaders.length}
        filters={true}
        columnSorting={true}
        dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]}
        licenseKey="non-commercial-and-evaluation"
        stretchH="all"
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        afterRenderer={afterRenderer}
        contextMenu={["alignment", "copy"]}
      />

      <Grid container marginTop={2} marginBottom={1}>
        <Grid size={{ xs: 12, lg: 10 }} />
        <Grid
          sx={{ display: "flex", justifyContent: "flex-end" }}
          size={{ xs: 12, lg: 2 }}
        >
          <ExceleAktarButton handleDownload={handleDownload} />
        </Grid>
      </Grid>
    </>
  );
};

export default KrediHesaplama;