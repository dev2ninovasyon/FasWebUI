import "@/lib/handsontableSetup";
import { HotTable } from "@handsontable/react";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'handsontable/styles/ht-icons-main.css';
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
  getMizanVerileri,
  getProgramVukMizanWithoutType,
} from "@/api/Veri/Mizan";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Props {
  konsolidasyonMu?: boolean;
  filterValue: string;
  setKod: (str: string) => void;
  setAd: (str: string) => void;
  onTransfer?: (kod: string) => void;
  highlightedKod?: string;
}

interface Veri {
  detayKodu: string;
  hesapAdi: string;
  bakiye: number;
}

const FisGirisiKontrol: React.FC<Props> = ({
  konsolidasyonMu = false,
  filterValue,
  setKod,
  setAd,
  onTransfer,
  highlightedKod,
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
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Bakiye
  ];



  const afterRenderer = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    //TD.style.textAlign = "left";

    let rowHighlighted = false;
    if (highlightedKod && hotTableComponent.current) {
      const hot = hotTableComponent.current.hotInstance;
      const rowData = hot.getDataAtRow(row);
      rowHighlighted = String(rowData?.[0] ?? "") === String(highlightedKod);
    }

    if (rowHighlighted) {
      TD.style.backgroundColor = "rgba(149, 208, 255, 0.35)";
      
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
      if (konsolidasyonMu) {
        const birlestirilmisMizanVerileri = await getMizanVerileri(user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          "BirlestirilmisMizan"
        );

        const rowsAll: any = [];
        birlestirilmisMizanVerileri.forEach((veri: any) => {
          const newRow: any = [veri.detayKodu, veri.hesapAdi, veri.netBakiye];
          rowsAll.push(newRow);
        });

        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
        setFilteredData(rowsAll);
      } else {
        const programVukMizanVerileri = await getProgramVukMizanWithoutType(user.denetciId || 0,
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
      }
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
          : hotTableComponent.current.hotInstance.rootElement.clientWidth -
            diff,
      });
    }
  }, [customizer.isCollapse]);

  return (
    <>
      <HotTable theme={customizer.activeMode === "dark" ? "horizon-dark" : "horizon"}
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
                  if (onTransfer) {
                    onTransfer(row[0]);
                  }
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

