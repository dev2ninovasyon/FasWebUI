"use client";
import "@/lib/handsontableSetup";

import { HotTable } from "@handsontable/react";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'handsontable/styles/ht-icons-main.css';
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
import { getKrediHesaplanmisDetay } from "@/api/Hesaplamalar/Hesaplamalar";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  paraBirimi: string;
  kisaVadeliAnaPara: number;
  uzunVadeliAnaPara: number;
}

interface Props {
  hesaplaTiklandimi: boolean;
  onDataCount?: (count: number) => void;
}

const KrediHesaplamaDetay = forwardRef<any, Props>(
  ({ hesaplaTiklandimi, onDataCount }, ref) => {
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

    const colHeaders = [
      "Para Birimi",
      "Kalan Uzun Vadeli Borçlanmaların Kısa Vadeye Dönüşen Ana Para Tutarları",
      "Kalan Uzun Vadeli Borçlanmaların Ana Para Tutarları",
    ];

    const columns = [
      {
        type: "text",
        columnSorting: true,
        className: "htLeft",
        allowInvalid: false,
        readOnly: true,
        editor: false,
      }, // Para Birimi
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
      }, // Kalan Uzun Vadeli Borçlanmaların Kısa Vadeye Dönüşen Ana Para Tutarları
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
      }, // Kalan Uzun Vadeli Borçlanmaların Ana Para Tutarları
    ];




    const fetchData = async () => {
      try {
        const krediDetayVerileri = await getKrediHesaplanmisDetay(
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0
        );

        const rowsAll: any = [];
        krediDetayVerileri.forEach((veri: any) => {
          const newRow: any = [
            veri.paraBirimi,
            veri.kisaVadeliAnaPara,
            veri.uzunVadeliAnaPara,
          ];
          rowsAll.push(newRow);
        });

        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
        onDataCount?.(rowsAll.length);
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
        <HotTable theme={customizer.activeMode === "dark" ? "horizon-dark" : "horizon"}
          style={{
            height: "100%",
            width: "100%",
            maxHeight: 250,
            maxWidth: "100%",
          }}
          language={dictionary.languageCode}
          ref={hotTableComponent}
          data={fetchedData}
          height={250}
          colHeaders={colHeaders}
          columns={columns}
          colWidths={[35, 65, 65]}
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
      </>
    );
  }
);

KrediHesaplamaDetay.displayName = "KrediHesaplamaDetay";

export default KrediHesaplamaDetay;
