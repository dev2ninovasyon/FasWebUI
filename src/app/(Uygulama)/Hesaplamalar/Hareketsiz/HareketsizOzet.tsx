import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
  getHareketsizStoklarOzet,
  getHareketsizTicariAlacaklarOzet,
} from "@/api/Hesaplamalar/Hesaplamalar";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  kebirKodu: number;
  hesapAdi: string;
  borcTutari: number;
  alacakTutari: number;
  netBakiye: number;
  paraBirimi: string;
}

interface Props {
  hesaplaTiklandimi: boolean;
  tip: string;
  onDataCount?: (count: number) => void;
}
const HareketsizOzet: React.FC<Props> = ({ hesaplaTiklandimi, tip, onDataCount }) => {
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
    "Hesap Adı",
    "Borç",
    "Alacak",
    "Bakiye",
    "Para Birimi",
  ];

  const columns = [
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
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
    }, // Hesap Adı
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
    }, // Borç
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
    }, // Alacak
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
    }, // Bakiye
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Para Birimi
  ];




  const fetchData = async () => {
    try {
      if (tip == "TicariAlacaklar") {
        const hareketsizTicariAlacaklarVerileri =
          await getHareketsizTicariAlacaklarOzet(user.denetciId || 0,
            user.yil || 0,
            user.denetlenenId || 0
          );

        const rowsAll: any = [];
        hareketsizTicariAlacaklarVerileri.forEach((veri: any) => {
          const newRow: any = [
            veri.kebirKodu,
            veri.hesapAdi,
            veri.borcTutari,
            veri.alacakTutari,
            veri.netBakiye,
            veri.paraBirimi,
          ];
          rowsAll.push(newRow);
        });

        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
        onDataCount && onDataCount(rowsAll.length);
      }
      if (tip == "Stoklar") {
        const hareketsizStoklarVerileri = await getHareketsizStoklarOzet(user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0
        );

        const rowsAll: any = [];
        hareketsizStoklarVerileri.forEach((veri: any) => {
          const newRow: any = [
            veri.kebirKodu,
            veri.hesapAdi,
            veri.borcTutari,
            veri.alacakTutari,
            veri.netBakiye,
            veri.paraBirimi,
          ];
          rowsAll.push(newRow);
        });

        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
        onDataCount && onDataCount(rowsAll.length);
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
      onDataCount && onDataCount(0);
    } else {
      fetchData();
    }
  }, [hesaplaTiklandimi, tip]);

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
    <div style={{ maxHeight: 342, overflowY: "auto" }}>
      <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
        style={{
          width: "calc(100% - 15px)",
          overflowX: "hidden",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={"auto"}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[35, 100, 45, 45, 45, 45]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={8}
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
    </div>
  );
};

export default HareketsizOzet;

