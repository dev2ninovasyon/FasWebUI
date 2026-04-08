import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
  createOnemlilikHesaplamaBazi,
  getOnemlilikSeviyesi,
} from "@/api/DenetimKanitlari/DenetimKanitlari";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  hesaplamaBazi: string;
  oran: number;
  hesaplamaBazininTutari: number;
  maliTablolarIcinGenelOnemlilikSeviyesi: number;
}

interface Props {
  hesaplaTiklandimi: boolean;
  setHesaplaTiklandimi: (bool: boolean) => void;
}
const OnemlilikSeviyesi: React.FC<Props> = ({
  hesaplaTiklandimi,
  setHesaplaTiklandimi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const [openCartAlert, setOpenCartAlert] = useState(false);

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
    "Hesaplama Bazının Tutarı",
    "Genel Önemlilik Seviyesi",
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
    }, // Hesaplama Bazının Tutarı
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
    }, // Genel Önemlilik Seviyesi
  ];




  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      const hotInstance = hotTableComponent.current.hotInstance;
      const cellMeta = hotInstance.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const handleAfterChange = (changes: any, source: any) => {
    if (source === "loadData") {
      return; // Skip this hook on loadData
    }
    if (changes) {
      for (const [row, prop, oldValue, newValue] of changes) {
        console.log(
          `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
        );
      }
    }
  };

  const handleOnemlilikHesaplamaBazi = async (row: number) => {
    try {
      const rowData = hotTableComponent.current?.hotInstance.getDataAtRow(row);
      if (!rowData) return;

      const json = {
        id: rowData[0],
        denetciId: user.denetciId || 0,
        denetlenenId: user.denetlenenId || 0,
        yil: user.yil || 0,
        hesaplamaBazi: rowData[1],
        oran: rowData[2],
        hesaplamaBazininTutari: rowData[3],
        maliTablolarIcinGenelOnemlilikSeviyesi: rowData[4],
      };

      const result = await createOnemlilikHesaplamaBazi(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        json
      );
      if (result) {
        fetchData();
        setHesaplaTiklandimi(true);
        setOpenCartAlert(false);
        enqueueSnackbar("Önemlilik Hesaplandı", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
          },
        });
      } else {
        setOpenCartAlert(false);
        enqueueSnackbar("Önemlilik Hesaplanamadı", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const onemlilikSeviyesiVerileri = await getOnemlilikSeviyesi(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      const rowsAll: any = [];
      onemlilikSeviyesiVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.hesaplamaBazi,
          veri.oran,
          veri.hesaplamaBazininTutari,
          veri.maliTablolarIcinGenelOnemlilikSeviyesi,
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
          maxHeight: 248,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={248}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[0, 100, 50, 100, 100]}
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
        afterChange={handleAfterChange}
        contextMenu={{
          items: {
            onemlilik_seviyesi_hesapla: {
              name: "Önemlilik Seviyesi Hesapla",
              callback: async function (key, selection) {
                const row = await handleGetRowData(selection[0].start.row);
                handleOnemlilikHesaplamaBazi(selection[0].start.row);
              },
            },
          },
        }}
      />
      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
    </>
  );
};

export default OnemlilikSeviyesi;

