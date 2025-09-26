import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { useRouter } from "next/navigation";
import { getFisNo } from "@/api/Donusum/FisGirisi";
import { getFisListesiVerileriByFisNo } from "@/api/Donusum/FisListesi";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Props {
  konsolidasyonMu?: boolean;
  hazirFislerTiklandimi: boolean;
  setHazirFislerTiklandimi: (bool: boolean) => void;
}

interface Veri {
  id: number;
  fisNo: number;
  fisTipi: string;
  detayKodu: string;
  hesapAdi: string;
  borc: number;
  alacak: number;
  aciklama: string;
}

const SonGirilenFisler: React.FC<Props> = ({
  konsolidasyonMu = false,
  hazirFislerTiklandimi,
  setHazirFislerTiklandimi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const [lastFisNo, setLastFisNo] = useState(1);

  let control = "";

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
    "Id",
    "Fiş No",
    "Tip",
    "Detay Kodu",
    "Hesap Adı",
    "Borç",
    "Alacak",
    "Açıklama",
  ];

  const columns = [
    {
      type: "numeric",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Id
    {
      type: "numeric",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Fiş No
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Tip
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Detay Kodu
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Hesap Adı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htRight",
    }, // Borc
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htRight",
    }, // Alacak
    {
      type: "text",
      columnSorting: true,
      readOnly: true,
      editor: false,
      className: "htLeft",
    }, // Açıklama
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
    TD.style.whiteSpace = "nowrap";
    TD.style.overflow = "hidden";

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

  const afterRenderer2 = (
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
    TD.style.whiteSpace = "nowrap";
    TD.style.overflow = "hidden";

    //color
    TD.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";

    if (col === 1) {
      if (parseInt(value) % 2 !== 0) {
        control = "odd";
      } else if (parseInt(value) % 2 == 0) {
        control = "even";
      }
    }

    if (control == "odd") {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
    } else if (control == "even") {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
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
      const fisVerileriByFisNo = await getFisListesiVerileriByFisNo(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        lastFisNo,
        konsolidasyonMu
      );
      const rowsAll: any = [];

      fisVerileriByFisNo.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.fisNo,
          veri.fisTipi,
          veri.detayKodu,
          veri.hesapAdi,
          veri.borc,
          veri.alacak,
          veri.aciklama,
        ];
        rowsAll.push(newRow);
      });

      setFetchedData(rowsAll);
      setRowCount(rowsAll.length);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchFisNo = async () => {
    try {
      const fisNo = await getFisNo(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        konsolidasyonMu
      );
      setLastFisNo(fisNo);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchFisNo();
  }, []);

  useEffect(() => {
    if (hazirFislerTiklandimi) {
      fetchFisNo();
      setHazirFislerTiklandimi(false);
    }
  }, [hazirFislerTiklandimi]);

  useEffect(() => {
    fetchData();
  }, [lastFisNo]);

  useEffect(() => {
    const hotInstance = hotTableComponent.current.hotInstance;

    hotInstance.updateSettings({
      afterRenderer: afterRenderer2,
    });

    hotInstance.render();
  }, [fetchedData]);

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
          maxWidth: "100%",
          overflow: smDown ? "auto" : "",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[0, 32, 40, 80, 130, 100, 100, 100, 100]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={9}
        hiddenColumns={{
          columns: [0],
        }}
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
            fise_git: {
              name: "Fişe Git",
              callback: async function (key, selection) {
                const row = await handleGetRowData(selection[0].start.row);
                router.push(`/Donusum/FisListesi/FisDetaylari/${row[1]}`);
              },
            },
          },
        }}
        copyPaste={false}
      />
    </>
  );
};

export default SonGirilenFisler;
