import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme, Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { getOnemlilikByDipnot } from "@/api/DenetimKanitlari/DenetimKanitlari";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  kebirKodu: number;
  hesapAdi: string;
  borcAlacakToplami: number;
  borcAlacakToplamiMizanIcindekiPayi: number;
  kabulEdilebilirYanlislikDuzeyi: number;
  performansOnemliligi: number;
  incelenenOrnekTutari: number;
  tespit: string;
}

interface Props {
  dipnot: string;
  isReport?: boolean;
}
const Onemlilik: React.FC<Props> = ({ dipnot, isReport }) => {
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
    "Id",
    "Kebir Kodu",
    "Hesap Adı",
    "Borç Alacak Toplamı",
    "Mizan İçindeki Payı",
    "Genel Önemlilik",
    "Performans Önemliliği",
    "İncelenen Örnek Tutarı",
    "Tespit Açıklama",
  ];

  const columns = [
    { type: "numeric", columnSorting: true, readOnly: true, editor: false }, // Id
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
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
      readOnly: true,
      editor: false,
    }, // Borç Alacak Toplamı
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
    }, // Mizan İçindeki Payı
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
    }, // Genel Önemlilik
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
    }, // Performans Önemliliği
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
    }, // İncelenen Örnek Tutarı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      readOnly: true,
      editor: false,
    }, // Tespit Açıklama
  ];





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
      const onemlilikVerileri = await getOnemlilikByDipnot(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        dipnot
      );

      const rowsAll: any = [];
      onemlilikVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.kebirKodu,
          veri.hesapAdi,
          veri.borcAlacakToplami,
          veri.borcAlacakToplamiMizanIcindekiPayi,
          veri.kabulEdilebilirYanlislikDuzeyi,
          veri.performansOnemliligi,
          veri.incelenenOrnekTutari,
          veri.tespit,
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
    fetchData();
  }, [dipnot]);

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
    <Box>
      <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
        Önemlilik
      </Typography>
      <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
        style={{
          height: isReport ? "auto" : "100%",
          width: "100%",
          maxHeight: isReport ? "none" : 432,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={isReport ? "auto" : 432}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[0, 40, 100, 80, 60, 80, 80, 80, 100]}
        stretchH="all"
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={8}
        hiddenColumns={{
          columns: [0],
        }}
        filters={!isReport}
        columnSorting={!isReport}
        dropdownMenu={isReport ? false : [
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        manualColumnResize={!isReport}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        contextMenu={isReport ? false : ["alignment", "copy"]}
        readOnly={isReport}
      />
    </Box>
  );
};

export default Onemlilik;

