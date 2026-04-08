import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
  getOnemlilikVeOrneklemHesaplamaBazi,
  updateOnemlilikVeOrneklemHesaplamaBazi,
} from "@/api/PlanVeProgram/PlanVeProgram";
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
  maliTablolarIcinGenelOnemlilikSeviyesi: number;
  performansOnemliligi: number;
  kabulEdilebilirYanlislikYuzdesi: string;
  kabulEdilebilirYanlislikTutari: number;
}

interface Props {
  hesaplaTiklandimi: boolean;
  setHesaplaTiklandimi: (bool: boolean) => void;
}
const OnemlilikVeOrneklemHesaplamaBazi: React.FC<Props> = ({
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
      type: "dropdown",
      source: [0.1, 0.5, 1, 5],
      className: "htRight",
      strict: true,
      allowInvalid: false,
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

        if (prop === 5) {
          const rowData =
            hotTableComponent.current?.hotInstance.getDataAtRow(row);
          if (!rowData) return;

          const obj = {
            id: rowData[0],
            denetciId: user.denetciId || 0,
            denetlenenId: user.denetlenenId || 0,
            yil: user.yil || 0,
            hesaplamaBazi: rowData[1],
            oran: rowData[2],
            maliTablolarIcinGenelOnemlilikSeviyesi: rowData[3],
            performansOnemliligi: rowData[4],
            kabulEdilebilirYanlislikYuzdesi: rowData[5],
            kabulEdilebilirYanlislikTutari: rowData[6],
          };
          setOpenCartAlert(true);
          handleUpdate(obj);
        }
      }
    }
  };

  const handleUpdate = async (json: any) => {
    try {
      const result = await updateOnemlilikVeOrneklemHesaplamaBazi(json
      );
      if (result) {
        fetchData();
        setOpenCartAlert(false);
        enqueueSnackbar("Önemlilik Hesaplama Bazı Güncellendi", {
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
        enqueueSnackbar("Önemlilik Hesaplama Bazı Güncellenemedi", {
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
      const onemlilikHesaplamaBazi = await getOnemlilikVeOrneklemHesaplamaBazi(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (onemlilikHesaplamaBazi) {
        setHesaplaTiklandimi(false);

        const rowsAll: any = [];

        const newRow: any = [
          onemlilikHesaplamaBazi.id,
          onemlilikHesaplamaBazi.hesaplamaBazi,
          onemlilikHesaplamaBazi.oran,
          onemlilikHesaplamaBazi.maliTablolarIcinGenelOnemlilikSeviyesi,
          onemlilikHesaplamaBazi.performansOnemliligi,
          onemlilikHesaplamaBazi.kabulEdilebilirYanlislikYuzdesi,
          onemlilikHesaplamaBazi.kabulEdilebilirYanlislikTutari,
        ];
        rowsAll.push(newRow);

        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
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
          colWidths={[0, 0, 0, 55, 55, 30, 55]}
          stretchH="all"
          manualColumnResize={true}
          rowHeaders={true}
          rowHeights={35}
          autoWrapRow={true}
          minRows={rowCount}
          minCols={8}
          hiddenColumns={{
            columns: [0, 1, 2],
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
          contextMenu={["alignment", "copy"]}
        />
      )}
      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
    </>
  );
};

export default OnemlilikVeOrneklemHesaplamaBazi;

