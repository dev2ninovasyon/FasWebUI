"use client";
import "@/lib/handsontableSetup";

import { HotTable } from "@handsontable/react";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'handsontable/styles/ht-icons-main.css';
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme, Box, Alert, Button } from "@mui/material";
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
import { useRouter } from "next/navigation";

// register Handsontable's modules
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
  onDataCount?: (count: number) => void;
}

const KrediHesaplamaBakiye = forwardRef<any, Props>(
  ({ hesaplaTiklandimi, onDataCount }, ref) => {
    const hotTableComponent = useRef<any>(null);
    const router = useRouter();

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
    const [warnings, setWarnings] = useState<string[]>([]);
    const [programMizanMissing, setProgramMizanMissing] = useState(false);

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




    const fetchData = async () => {
      try {
        const response = await getKrediHesaplanmisBakiye(
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0
        );

        // Yeni response yapısı { data: [], warnings: [] }
        const krediVerileri = response?.data || [];
        const responseWarnings = response?.warnings || [];

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
        onDataCount?.(mapped.length);

        const marker = "__NO_PROGRAM_MIZAN__";
        const hasMarker = responseWarnings.includes(marker);
        setProgramMizanMissing(hasMarker);
        const filtered = responseWarnings.filter((w: string) => w !== marker);
        setWarnings(filtered);
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
        setRowCount(0);
        setFetchedData([]);
        setWarnings([]);
      }
    };

    // No toast notifications on this page; only inline alert when program mizan missing

    useEffect(() => {
      fetchData();
    }, [user.denetciId, user.yil, user.denetlenenId]);



    useEffect(() => {
      if (hesaplaTiklandimi) {
        setFetchedData([]);
        setRowCount(0);
        setWarnings([]);
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
        <Box
          sx={{
            position: "relative",
            width: "100%",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            overflow: "hidden",
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <HotTable theme={customizer.activeMode === "dark" ? "horizon-dark" : "horizon"}
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
            colWidths={[60, 160, 60, 90, 90, 90]}
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
            contextMenu={["alignment", "copy"]}
          />

          {programMizanMissing && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: "70%", md: "60%" },
                pointerEvents: "auto",
                zIndex: 10,
              }}
            >
              <Alert
                severity="warning"
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.warning.dark}`,
                  backgroundColor: "rgba(255,250,205,0.92)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ textAlign: "center", width: "100%" }}>
                  <Box sx={{ fontWeight: 600, mb: 1 }}>
                    Tabloyu görüntüleyebilmek için program formatına dönüştürmelisiniz.
                  </Box>
                  <Box sx={{ mb: 2, color: (theme) => theme.palette.warning.dark, fontWeight: 500 }}>
                    Buraya tıklayınız
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => router.push("/Veri/Mizanlar/EDefterMizan")}
                      sx={{ textTransform: "none" }}
                    >
                      Git
                    </Button>
                  </Box>
                </Box>
              </Alert>
            </Box>
          )}
        </Box>
      </>
    );
  }
);

KrediHesaplamaBakiye.displayName = "KrediHesaplamaBakiye";

export default KrediHesaplamaBakiye;