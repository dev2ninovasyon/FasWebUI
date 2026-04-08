import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




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
    "No",
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




  const afterRenderer2 = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    TD.style.whiteSpace = "nowrap";
    TD.style.overflow = "hidden";

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
      
    } else if (control == "even") {
      TD.style.backgroundColor =
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
      const fisVerileriByFisNo = await getFisListesiVerileriByFisNo(user.denetciId || 0,
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
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchFisNo = async () => {
    try {
      const fisNo = await getFisNo(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        konsolidasyonMu
      );
      setLastFisNo(fisNo);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
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
      <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
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
        colWidths={[0, 28, 40, 80, 130, 100, 100, 100, 100]}
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
        afterRenderer={afterRenderer2}
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
        copyPaste={true}
      />
    </>
  );
};

export default SonGirilenFisler;

