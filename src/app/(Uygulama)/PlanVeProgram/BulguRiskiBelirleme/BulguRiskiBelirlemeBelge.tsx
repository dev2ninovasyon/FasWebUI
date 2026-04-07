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
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

const BulguRiskiBelirlemeBelge = () => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const rowCount = 6;

  const fetchedData: any[] = [
    [
      "Detaylı denetim prosedürü",
      "%0-%15",
      "Tutar olarak ana kütlenin %31 ve daha fazlası",
      "31-50",
    ],
    [
      "Detaylı denetim prosedürü",
      "%16-%25",
      "Tutar olarak ana kütlenin %26-%30 arası",
      "26-30",
    ],
    [
      "Kısmen detaylı, kısmen analitik denetim prosedürü",
      "%26-%40",
      "Tutar olarak ana kütlenin %21-%25 arası",
      "21-25",
    ],
    [
      "Kısmen detaylı, kısmen analitik denetim prosedürü",
      "%41-%60",
      "Tutar olarak ana kütlenin %16-%20 arası",
      "16-20",
    ],
    [
      "Analitik incelemeye dayalı denetim prosedürü",
      "%61-%80",
      "Tutar olarak ana kütlenin %11-%15 arası	",
      "11-15",
    ],
    [
      "Analitik incelemeye dayalı denetim prosedürü",
      "%81-%100",
      "Tutar olarak ana kütlenin %0-%10 arası",
      "0-10",
    ],
  ];

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
    "Denetim Prosedürleri",
    "Bulgu Riski",
    "Toplanacak Denetim Kanıtı",
    "Risk",
  ];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Denetim Prosedürleri
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Bulgu Riski
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Toplanacak Denetim Kanıtı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Risk
  ];




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
      <HotTable theme={customizer.activeMode === "dark" ? "horizon-dark" : "horizon"}
        style={{
          height: "100%",
          width: "100%",
          maxHeight: 296,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={296}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[45, 45, 45, 45]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={4}
        filters={true}
        columnSorting={true}
        dropdownMenu={[
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        contextMenu={["alignment", "copy"]}
      />
    </>
  );
};

export default BulguRiskiBelirlemeBelge;
