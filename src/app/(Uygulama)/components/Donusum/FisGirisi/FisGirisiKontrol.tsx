import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { getProgramVukMizanWithoutType } from "@/api/Veri/Mizan";

// register Handsontable's modules
registerAllModules();

interface Props {
  filterValue: string;
  setKod: (str: string) => void;
  setAd: (str: string) => void;
  setBakiye: (lst: any) => void;
}

interface Veri {
  detayKodu: string;
  hesapAdi: string;
  bakiye: number;
}

const FisGirisiKontrol: React.FC<Props> = ({
  filterValue,
  setKod,
  setAd,
  setBakiye,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState<number>(1);

  const [fetchedData, setFetchedData] = useState<any[]>([]);

  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    if (filterValue) {
      const newFilteredData = fetchedData.filter(
        (row) => row[0].includes(filterValue) // İkinci sütunu filtrele
      );
      setFilteredData(newFilteredData);
      setRowCount(newFilteredData.length);
    } else {
      setFilteredData(fetchedData);
      setRowCount(fetchedData.length);
    }
  }, [filterValue]);

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

  const colHeaders = ["Detay Kodu", "Hesap Adı", "Bakiye"];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      readOnly: true,
      editor: false,
    }, // Detay Kodu
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      readOnly: true,
      editor: false,
    }, // Hesap Adı
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Bakiye
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

  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      const hotInstance = hotTableComponent.current.hotInstance;
      const cellMeta = hotInstance.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const fetchData = async () => {
    try {
      const programVukMizanVerileri = await getProgramVukMizanWithoutType(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      const rowsAll: any = [];
      programVukMizanVerileri.forEach((veri: any) => {
        const newRow: any = [veri.detayKodu, veri.hesapAdi, veri.netBakiye];
        rowsAll.push(newRow);
      });

      setRowCount(rowsAll.length);
      setFetchedData(rowsAll);
      setFilteredData(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
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
          : hotTableComponent.current.hotInstance.rootElement.clientWidth -
            diff,
      });
    }
  }, [customizer.isCollapse]);

  return (
    <>
      <HotTable
        style={{
          width: "100%",
          minHeight: "100px",
          maxHeight: 227,
          maxWidth: "100%",
          overflow: "auto",
        }}
        height={280}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={filteredData}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[60, 100, 100]}
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
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        afterRenderer={afterRenderer}
        contextMenu={{
          items: {
            alignment: {},
            copy: {},

            fise_aktar: {
              name: "Fişe aktar",
              callback: async function (key, selection) {
                const row = await handleGetRowData(selection[0].start.row);
                if (row[0].length == 3) {
                  enqueueSnackbar("Ana Hesabı Fişe Aktaramazsınız", {
                    variant: "warning",
                    autoHideDuration: 5000,
                    style: {
                      backgroundColor:
                        customizer.activeMode === "dark"
                          ? theme.palette.warning.dark
                          : theme.palette.warning.main,
                    },
                  });
                } else if (
                  row[0].startsWith("590") ||
                  row[0].startsWith("591") ||
                  row[0].startsWith("690") ||
                  row[0].startsWith("692")
                ) {
                  enqueueSnackbar(
                    "Dönem Kârı İle İlgili Hesabı Fişe Aktaramazsınız",
                    {
                      variant: "warning",
                      autoHideDuration: 5000,
                      style: {
                        backgroundColor:
                          customizer.activeMode === "dark"
                            ? theme.palette.warning.dark
                            : theme.palette.warning.main,
                      },
                    }
                  );
                } else {
                  setKod(row[0]);
                  setAd(row[1]);
                  setBakiye((prevBakiye: any) => {
                    const nextBakiye = [row[2]];
                    return [...prevBakiye, ...nextBakiye];
                  });
                }
              },
            },
          },
        }}
      />
    </>
  );
};

export default FisGirisiKontrol;
