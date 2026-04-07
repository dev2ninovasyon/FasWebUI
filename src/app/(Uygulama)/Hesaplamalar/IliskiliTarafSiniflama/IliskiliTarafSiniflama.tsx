import "@/lib/handsontableSetup";
import { HotTable } from "@handsontable/react";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'handsontable/styles/ht-icons-main.css';
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getIliskiliTarafSiniflama } from "@/api/Hesaplamalar/Hesaplamalar";
import { getIliskiliTaraflarByDenetlenenId } from "@/api/Musteri/MusteriIslemleri";
import { FloatingButtonFisler } from "@/app/(Uygulama)/components/Hesaplamalar/FloatingButtonFisler";
import { IconX, IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import IliskiliTarafSiniflamaOrnekFisler from "./IliskiliTarafSiniflamaOrnekFisler";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  secim: boolean;
  kebirKodu: number;
  detayKodu: string;
  hesapAdi: string;
  borcTutari: number;
  alacakTutari: number;
  netBakiye: number;
  paraBirimi: string;
}

interface Props {
  hesap: number;
}

const IliskiliTarafSiniflama: React.FC<Props> = ({ hesap }) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [noDataOpen, setNoDataOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);

  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] =
    useState(false);

  const [json, setJson] = useState<any>();
  const [warn, setWarn] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

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
    "Seçim",
    "Kebir Kodu",
    "Detay Kodu",
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
    }, // Id
    {
      type: "checkbox",
      className: "htCenter",
    }, // Seçim
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
    }, // Detay Kodu
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




  const afterChange = (changes: any, source: string) => {
    if (source === "edit" || source === "Autofill.fill") {
      const updatedSelectedRows = fetchedData.filter((row) => row[1] == true);
      setSelectedRows(updatedSelectedRows);
    }

    if (selectedRows.length > 0) {
      setWarn(false);
    } else {
      setWarn(true);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const iliskiliTarafSiniflamaVerileri = await getIliskiliTarafSiniflama(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        hesap
      );

      const iliskiliTaraflar = await getIliskiliTaraflarByDenetlenenId(
        user.denetlenenId || 0
      );

      let totalBorc = 0;
      let totalAlacak = 0;
      let totalBakiye = 0;
      const rowsAll: any = [];
      iliskiliTarafSiniflamaVerileri.forEach((veri: any) => {
        // Pre-selection logic: check if calculation name contains any related party name
        const isRelated = iliskiliTaraflar?.some((it: any) =>
          veri.hesapAdi?.toLowerCase().includes(it.adi?.toLowerCase())
        ) || false;

        const newRow: any = [
          veri.id,
          isRelated || veri.secim || false,
          veri.kebirKodu,
          veri.detayKodu,
          veri.hesapAdi,
          veri.borcTutari,
          veri.alacakTutari,
          veri.netBakiye,
          veri.paraBirimi,
        ];
        rowsAll.push(newRow);
        totalBorc += veri.borcTutari;
        totalAlacak += veri.alacakTutari;
        totalBakiye += veri.netBakiye;
      });
      rowsAll.push([
        undefined,
        undefined,
        undefined,
        undefined,
        "Toplam",
        totalBorc,
        totalAlacak,
        Math.abs(totalBorc - totalAlacak),
        undefined,
      ]);
      setRowCount(rowsAll.length);
      setFetchedData(rowsAll);
      setNoDataOpen(rowsAll.length === 0);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJson = async () => {
    try {
      const keys = [
        "denetciId",
        "denetlenenId",
        "yil",
        "kebirKodu",
        "detayKodu",
        "hesapAdi",
        "borcTutari",
        "alacakTutari",
        "netBakiye",
        "paraBirimi",
      ];

      const jsonData = selectedRows.map((item: any[]) => {
        let obj: { [key: string]: any } = {};
        keys.forEach((key, index) => {
          if (key === "denetciId") {
            obj[key] = user.denetciId;
          } else if (key === "denetlenenId") {
            obj[key] = user.denetlenenId;
          } else if (key === "yil") {
            obj[key] = user.yil;
          } else {
            obj[key] = item[index - 1];
          }
        });
        return obj;
      });
      setJson(jsonData);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (floatingButtonTiklandimi) {
      handleJson();
    }
  }, [floatingButtonTiklandimi]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row.slice(0));

    const headers = hotTableInstance.getColHeader().slice(0);

    const fullData = [headers, ...processedData];

    async function createExcelFile() {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sayfa1");

      fullData.forEach((row: any) => {
        worksheet.addRow(row);
      });

      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        name: "Calibri",
        size: 12,
        bold: true,
        color: { argb: "FFFFFF" },
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1a6786" },
      };
      headerRow.alignment = { horizontal: "left" };

      worksheet.columns.forEach((column) => {
        column.width = 25;
      });

      try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `IliskiliTarafSiniflamaHesaplama.xlsx`);
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
      }
    }
    createExcelFile();
  };

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
      <Box sx={{ position: "relative" }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: customizer.activeMode === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
              zIndex: 1000,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {selectedRows.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            FasAı dan seçilen fişler ilgili fişleri kontrol edebilirsiniz.
          </Alert>
        )}
        <HotTable theme={customizer.activeMode === "dark" ? "horizon-dark" : "horizon"}
          style={{
            height: "100%",
            width: "100%",
            maxHeight: 684,
            maxWidth: "100%",
          }}
          language={dictionary.languageCode}
          ref={hotTableComponent}
          data={fetchedData}
          height={684}
          colHeaders={colHeaders}
          columns={columns}
          colWidths={[35, 25, 35, 45, 60, 45, 45, 45, 35]}
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
          afterChange={afterChange}
          contextMenu={["alignment", "copy"]}
        />
      </Box>
      <Grid container marginTop={2}>
        <Grid
          size={{
            xs: 12,
            lg: 10
          }}></Grid>
        <Grid
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
          size={{
            xs: 12,
            lg: 2
          }}>
          <ExceleAktarButton
            handleDownload={handleDownload}
          ></ExceleAktarButton>
        </Grid>
        <FloatingButtonFisler
          warn={warn}
          handleClick={() => setFloatingButtonTiklandimi(true)}
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
            İlişkili taraf sınıflama verisi bulunamadı.
          </Alert>
        </Snackbar>
        <Dialog
          open={floatingButtonTiklandimi}
          onClose={() => setFloatingButtonTiklandimi(false)}
          fullWidth
          maxWidth={false}
          fullScreen={isFullScreen}
          PaperProps={isFullScreen ? {} : { sx: { maxWidth: "98vw" } }}
        >
          <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Box>
                <Typography variant="h5" p={1}>
                  Sizin için oluşturduğum fişleri kaydetmek ister misiniz?
                </Typography>
                <Typography variant="body1" p={1}>
                  Sizin için oluşturduğum fiş kayıtlarının doğruluğunu mutlaka
                  kontrol edin. Fişlerinizi kontrol etmeden kaydetmek, hatalı
                  kayıtların oluşmasına yol açabilir. Unutmayın, bu alanda
                  gerçekleştirdiğiniz işlemlerden kaynaklanan hatalı kayıtlar
                  <strong> tamamen sizin sorumluluğunuzdadır</strong>.
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <IconButton
                  size="small"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                >
                  {isFullScreen ? (
                    <IconArrowsMinimize size="24" />
                  ) : (
                    <IconArrowsMaximize size="24" />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setFloatingButtonTiklandimi(false)}
                >
                  <IconX size="24" />
                </IconButton>
              </Box>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            <IliskiliTarafSiniflamaOrnekFisler
              json={json}
              hesap={hesap}
              kaydetTiklandimi={kaydetTiklandimi}
              setkaydetTiklandimi={setKaydetTiklandimi}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
            <Button
              variant="outlined"
              color="success"
              onClick={() => {
                setKaydetTiklandimi(true);
                setFloatingButtonTiklandimi(false);
              }}
              sx={{ width: "20%" }}
            >
              Evet, Kaydet
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setFloatingButtonTiklandimi(false)}
              sx={{ width: "20%" }}
            >
              Hayır, Vazgeç
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
};

export default IliskiliTarafSiniflama;

