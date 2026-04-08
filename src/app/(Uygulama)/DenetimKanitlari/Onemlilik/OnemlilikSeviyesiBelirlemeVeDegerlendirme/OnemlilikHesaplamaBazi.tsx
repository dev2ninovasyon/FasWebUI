import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Alert, Box, CircularProgress, IconButton, Snackbar, useTheme } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { getOnemlilikHesaplamaBazi } from "@/api/DenetimKanitlari/DenetimKanitlari";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  hesaplamaBazi: string;
  oran: number;
  maliTablolarIcinGenelOnemlilikSeviyesi: number;
  performansOnemliligi: number;
  kabulEdilebilirYanlislikYuzdesi: string;
  kabulEdilebilirYanlislikTutari: number;
}

const OnemlilikHesaplamaBazi = () => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);
  const [loading, setLoading] = useState(true);
  const [noDataOpen, setNoDataOpen] = useState(false);

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
    "Hesaplama Bazı",
    "Oran",
    "Mali Tablolar İçin Genel Önemlilik Seviyesi",
    "Performans Önemliliği",
    "Kabul Edilebilir Yanlışlık Yüzdesi",
    "Kabul Edilebilir Yanlışlık Tutarı",
  ];

  const columns = [
    { type: "numeric", columnSorting: true, readOnly: true, editor: false }, // Id
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Hesaplama Bazı
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
    }, // Oran
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
    }, // Mali Tablolar İçin Genel Önemlilik Seviyesi
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
    }, // Kabul Edilebilir Yanlışlık Yüzdesi
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
    }, // Kabul Edilebilir Yanlışlık Tutarı
  ];




  const fetchData = async () => {
    setLoading(true);
    try {
      const onemlilikHesaplamaBaziVerileri = await getOnemlilikHesaplamaBazi(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (onemlilikHesaplamaBaziVerileri) {
        const rowsAll: any = [];

        const newRow: any = [
          onemlilikHesaplamaBaziVerileri.id,
          onemlilikHesaplamaBaziVerileri.hesaplamaBazi,
          onemlilikHesaplamaBaziVerileri.oran,
          onemlilikHesaplamaBaziVerileri.maliTablolarIcinGenelOnemlilikSeviyesi,
          onemlilikHesaplamaBaziVerileri.performansOnemliligi,
          onemlilikHesaplamaBaziVerileri.kabulEdilebilirYanlislikYuzdesi,
          onemlilikHesaplamaBaziVerileri.kabulEdilebilirYanlislikTutari,
        ];
        rowsAll.push(newRow);

        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
        setNoDataOpen(rowsAll.length === 0);
      } else {
        setNoDataOpen(true);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    } finally {
      setLoading(false);
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
  }, [customizer.isCollapse, customizer.SidebarWidth, customizer.MiniSidebarWidth]);

  return (
    <Box sx={{ position: "relative" }}>
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.7)"
                : "rgba(255, 255, 255, 0.7)",
            zIndex: 1,
            minHeight: "168px",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {fetchedData.length > 0 && (
        <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
          style={{
            height: "100%",
            width: "100%",
            maxHeight: 168,
            maxWidth: "100%",
          }}
          language={dictionary.languageCode}
          ref={hotTableComponent}
          data={fetchedData}
          height={168}
          colHeaders={colHeaders}
          columns={columns}
          colWidths={[0, 50, 50, 100, 100, 50, 100]}
          stretchH="all"
          manualColumnResize={true}
          rowHeaders={true}
          rowHeights={35}
          autoWrapRow={true}
          minRows={rowCount}
          minCols={8}
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
          contextMenu={["alignment", "copy"]}
        />
      )}
      <Snackbar
        open={noDataOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="warning"
          variant="filled"
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setNoDataOpen(false)}
            >
              <Close fontSize="small" />
            </IconButton>
          }
          sx={{ width: "100%", fontSize: "14px" }}
        >
          Önemlilik hesaplama bazı bulunamadı.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OnemlilikHesaplamaBazi;
