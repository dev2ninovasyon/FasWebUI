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
  useMemo,
} from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
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

const KrediHesaplamaBakiye = forwardRef<any, Props>(
  ({ hesaplaTiklandimi }, ref) => {
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
        "Para Birimi",
        "Mizan Bakiye",
        "İskontolu Bakiye",
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
          data: "paraBirimi",
          type: "text",
          className: "htCenter",
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

          return {
            hesapKodu: String(veri.hesapKodu ?? "").trim(),
            hesapAdi: String(veri.hesapAdi ?? ""),
            mizanBakiye: mizan,
            iskontolu,
            fark,
            detayKodu: String(veri.hesapKodu ?? ""),
            paraBirimi: String(veri.paraBirimi ?? "TL"),
            borc: fark < 0 ? Math.abs(fark) : null,
            alacak: fark > 0 ? fark : null,
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
            maxHeight: 350,
            maxWidth: "100%",
          }}
          language={dictionary.languageCode}
          ref={hotTableComponent}
          data={fetchedData}
          colHeaders={colHeaders}
          height={350}
          columns={columns}
          colWidths={[80, 220, 80, 130, 130, 130]}
          manualColumnResize={true}
          rowHeaders={true}
          rowHeights={35}
          autoWrapRow={true}
          minRows={rowCount}
          minCols={colHeaders.length}
          filters={true}
          columnSorting={true}
          dropdownMenu={[
            "filter_by_condition",
            "filter_by_value",
            "filter_action_bar",
          ]}
          licenseKey="non-commercial-and-evaluation"
          stretchH="all"
          afterGetColHeader={afterGetColHeader}
          afterGetRowHeader={afterGetRowHeader}
          afterRenderer={afterRenderer}
          contextMenu={["alignment", "copy"]}
        />
      </>
    );
  }
);

KrediHesaplamaBakiye.displayName = "KrediHesaplamaBakiye";

export default KrediHesaplamaBakiye;