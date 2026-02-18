"use client";

import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material";
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { getKrediHesaplanmis } from "@/api/Hesaplamalar/Hesaplamalar";

// register Handsontable's modules
registerAllModules();

interface Veri {
  alinanKrediNumarasi: number;
  detayHesapKodu: string;
  hesapAdi: string;
  anaPara: number;
  iskontolu: number;
  iskontosuz: number;
  faizOrani: number;
  gun: number;
  vadeselDagilim3AyIskontolu: number;
  vadeselDagilim12AyIskontolu: number;
  vadeselDagilim5YilIskontolu: number;
  vadeselDagilim5YildanUzunIskontolu: number;
  vadeselDagilim3AyIskontosuz: number;
  vadeselDagilim12AyIskontosuz: number;
  vadeselDagilim5YilIskontosuz: number;
  vadeselDagilim5YildanUzunIskontosuz: number;
  faizFonVergi: number;
  kalanFaizFonVergi: number;
  kalanFaizFonVergiIskontolu: number;
  vade: string;
}

interface Props {
  hesaplaTiklandimi: boolean;
}

const KrediHesaplama = forwardRef<any, Props>(({ hesaplaTiklandimi }, ref) => {
  const hotTableComponent = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    get hotInstance() {
      return hotTableComponent.current?.hotInstance;
    },
  }));

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

  const nestedHeaders = [
    [
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "Vadesel Dağılım", colspan: 8 },
    ],
    [
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "", colspan: 1 },
      { label: "İskontolu", colspan: 4 },
      { label: "İskontosuz", colspan: 4 },
    ],
    [
      "D. Hesap\n Kodu",
      "Hesap Adı",
      "Ana Para",
      "İskontolu",
      "İskontosuz",
      "Raporlama Tarihine Kadar\n İşleyen Faiz Fon Vergi",
      "Kalan Faiz\n Fon Vergi",
      "Kalan Faiz Fon Verginin\n İskontolu Tutarı",
      "Faiz Oranı",
      "Vade",
      "Gün",
      "1-3 Ay",
      "4-12 Ay",
      "1-5 Yıl",
      "5 Yıldan\n Uzun",
      "1-3 Ay",
      "4-12 Ay",
      "1-5 Yıl",
      "5 Yıldan\n Uzun",
    ],
  ];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // D. Hesap Kodu
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
      numericFormat: { pattern: "0,0", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Gün
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontolu - 1-3 Ay
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontolu - 4-12 Ay
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontolu - 1-5 Yıl
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontolu - 5 Yıldan Uzun
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontosuz - 1-3 Ay
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontosuz - 4-12 Ay
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontosuz - 1-5 Yıl
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // İskontosuz - 5 Yıldan Uzun
  ];

  const afterGetColHeader = (col: any, TH: any) => {
    const rowIndex = (TH.parentElement as HTMLTableRowElement)?.sectionRowIndex;
    if (rowIndex === 0 || rowIndex === 1) {
      TH.style.height = "50px";
      TH.style.lineHeight = "50px";
    } else {
      TH.style.height = "65px";
    }

    let div = TH.querySelector("div");
    if (!div) {
      div = document.createElement("div");
      TH.appendChild(div);
    }

    div.style.whiteSpace = "pre-line";
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

    TH.style.borderColor =
      customizer.activeMode === "dark" ? "#10141c" : "#cccccc";

    // Create span for the header text
    let span = div.querySelector("span");
    if (!span) {
      span = document.createElement("span");
      div.appendChild(span);
    }
    span.style.position = "relative";
    span.style.paddingRight = "10px";
    span.style.paddingLeft = "4px";
    span.style.display = "block";
    span.style.width = "100%";
    span.style.textAlign = "center";

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
          veri.gun,
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

      setRowCount(rowsAll.length);
      setFetchedData(rowsAll);
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
  }, [
    customizer.isCollapse,
    customizer.SidebarWidth,
    customizer.MiniSidebarWidth,
  ]);

  return (
    <>
      <HotTable
        style={{
          height: "100%",
          width: "100%",
          maxHeight: 450,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={350}
        nestedHeaders={nestedHeaders}
        //collapsibleColumns={true}
        columns={columns}
        autoColumnSize={true}
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
    </>
  );
});

KrediHesaplama.displayName = "KrediHesaplama";

export default KrediHesaplama;
