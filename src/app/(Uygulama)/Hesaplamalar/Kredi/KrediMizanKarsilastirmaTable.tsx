import React, { useEffect, useState, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useSelector, useDispatch } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme, Box } from "@mui/material";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { getKrediMizanKarsilastirmasi } from "@/api/Hesaplamalar/Hesaplamalar";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface KrediMizanKarsilastirmaRow {
  detayKodu: string;
  hesapAdi: string;
  anaPara: number;
  mizanBakiye: number;
  fark: number;
  farkVar: boolean;
}

interface KrediMizanKarsilastirmaTableProps {
  hesaplaTiklandimi: boolean;
}

const KrediMizanKarsilastirmaTable: React.FC<KrediMizanKarsilastirmaTableProps> =
  ({ hesaplaTiklandimi }) => {
    const hotTableComponent = useRef<any>(null);
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const dispatch = useDispatch();
    const theme = useTheme();

    const [rows, setRows] = useState<KrediMizanKarsilastirmaRow[]>([]);
    const [loading, setLoading] = useState(false);
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
      "Detay Hesap Kodu",
      "Hesap Adı",
      "Ana Para",
      "Mizan Bakiye",
      "Fark",
    ];

    const columns = [
      {
        type: "text",
        className: "htLeft",
        allowInvalid: false,
        readOnly: true,
        editor: false,
      },
      {
        type: "text",
        className: "htLeft",
        allowInvalid: false,
        readOnly: true,
        editor: false,
      },
      {
        type: "numeric",
        numericFormat: {
          pattern: "0,0.00",
          culture: "tr-TR",
        },
        className: "htRight",
        readOnly: true,
        editor: false,
      },
      {
        type: "numeric",
        numericFormat: {
          pattern: "0,0.00",
          culture: "tr-TR",
        },
        className: "htRight",
        readOnly: true,
        editor: false,
      },
      {
        type: "numeric",
        numericFormat: {
          pattern: "0,0.00",
          culture: "tr-TR",
        },
        className: "htRight",
        readOnly: true,
        editor: false,
      },
    ];

    const afterGetColHeader = (col: any, TH: any) => {
      TH.style.height = "40px";

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
      TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#e0e0e0";

      let span = div.querySelector("span");
      if (!span) {
        span = document.createElement("span");
        div.appendChild(span);
      }
      span.textContent = colHeaders[col];
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
      div.style.whiteSpace = "normal";
      div.style.wordWrap = "break-word";
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = "center";
      div.style.height = "100%";

      TH.style.fontFamily = plus.style.fontFamily;
      TH.style.fontWeight = 500;
      TH.style.fontSize = "0.875rem";
      TH.style.lineHeight = "1.334rem";

      TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
      TH.style.backgroundColor = theme.palette.primary.light;
      TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#e0e0e0";
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

      TD.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";

      if (row % 2 === 0) {
        TD.style.backgroundColor =
          customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
        TD.style.borderColor =
          customizer.activeMode === "dark" ? "#10141c" : "#e0e0e0";
      } else {
        TD.style.backgroundColor =
          customizer.activeMode === "dark" ? "#10141c" : "#f5f5f5";
        TD.style.borderColor =
          customizer.activeMode === "dark" ? "#10141c" : "#e0e0e0";
      }

      // Fark sütunu (col === 4) için kırmızı renklendir
      if (col === 4) {
        const currentRowData = fetchedData[row];
        const isFarkVar = currentRowData && currentRowData[5]; // farkVar is at index 5

        if (isFarkVar) {
          TD.style.color = "#d32f2f";
          TD.style.fontWeight = "bold";
        }
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🔵 Kredi Mizan API isteği başlatılıyor:", {
          denetciId: user.denetciId,
          yil: user.yil,
          denetlenenId: user.denetlenenId,
        });

        const result = await getKrediMizanKarsilastirmasi(
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0 || 0
        );

        console.log("📊 API Response Data (Raw):", result);

        let dataArray: KrediMizanKarsilastirmaRow[] = [];

        if (result && result.data && Array.isArray(result.data)) {
          dataArray = result.data;
        } else if (Array.isArray(result)) {
          dataArray = result;
        } else if (result?.success && result.data && Array.isArray(result.data)) {
          dataArray = result.data;
        }

        console.log("📊 İşlenen veriler:", dataArray);

        if (dataArray && dataArray.length > 0) {
          setRows(dataArray);
          
          // Convert to Handsontable format
          const hotData = dataArray.map((row) => [
            row.detayKodu,
            row.hesapAdi,
            row.anaPara,
            row.mizanBakiye,
            row.fark,
            row.farkVar, // Hidden column for styling logic
          ]);

          setFetchedData(hotData);
          console.log("🟢 Veriler başarıyla yüklendi:", dataArray.length, "satır");
        } else {
          setRows([]);
          setFetchedData([]);
          console.warn("⚠️ Veri bulunamadı veya boş array:", result);
        }
      } catch (error) {
        console.error("❌ API Hatası:", error);
        enqueueSnackbar("Veri yüklenirken hata oluştu", { variant: "error" });
        setRows([]);
        setFetchedData([]);
      } finally {
        setLoading(false);
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
    }, [
      customizer.isCollapse,
      customizer.SidebarWidth,
      customizer.MiniSidebarWidth,
    ]);

    return (
      <Box sx={{ mb: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            Loading...
          </Box>
        ) : rows.length === 0 ? (
          <Box p={2}>
            Kredi Mizan Karşılaştırması verisi bulunmamaktadır.
          </Box>
        ) : (
          <HotTable
            style={{
              height: "100%",
              width: "100%",
              maxHeight: 300,
              maxWidth: "100%",
            }}
            language={dictionary.languageCode}
            ref={hotTableComponent}
            data={fetchedData}
            height={300}
            colHeaders={colHeaders}
            columns={columns}
            colWidths={[25, 40, 20, 20, 20]}
            stretchH="all"
            manualColumnResize={true}
            rowHeaders={true}
            rowHeights={35}
            autoWrapRow={true}
            minRows={rows.length || 5}
            minCols={5}
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
        )}
      </Box>
    );
  };

export default KrediMizanKarsilastirmaTable;
