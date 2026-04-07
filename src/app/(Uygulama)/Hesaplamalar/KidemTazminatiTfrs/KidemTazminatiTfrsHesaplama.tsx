import "@/lib/handsontableSetup";
import { HotTable } from "@handsontable/react"; import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'handsontable/styles/ht-icons-main.css';
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modulesnumbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  aciklama: string;
  sayisi: number;
}

interface Props {
  data: Veri[];
  title: string;
}

const KidemTazminatiTfrsHesaplama: React.FC<Props> = ({ data, title }) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<any[]>([]);
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

  const colHeaders = [title, ""];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Açıklama

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
    }, // Sayısı
  ];




  useEffect(() => {
    setFetchedData(data);
    setNoDataOpen(data.length === 0);
    setRowCount(data.length);
  }, [data]);

  useEffect(() => {
    if (hotTableComponent.current) {
      const diff = customizer.isCollapse
        ? 0
        : customizer.SidebarWidth && customizer.MiniSidebarWidth
          ? customizer.SidebarWidth - customizer.MiniSidebarWidth
          : 0;

      hotTableComponent.current.hotInstance.updateSettings({
        width: customizer.isCollapse
          ? "99.9%"
          : hotTableComponent.current.hotInstance.rootElement.clientWidth -
          diff,
      });
    }
  }, [customizer.isCollapse]);

  return (
    <>
      <HotTable theme={customizer.activeMode === "dark" ? "horizon-dark" : "horizon"}
        style={{
          height: "100%",
          width: "99%",
          maxHeight: 468,
          maxWidth: "99.9%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={468}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[170, 60]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={2}
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
          Kıdem tazminatı (TFRS) hesaplama verisi bulunamadı.
        </Alert>
      </Snackbar>
    </>
  );
};

export default KidemTazminatiTfrsHesaplama;
