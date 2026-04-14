import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getKurFarkiOrnekFisler } from "@/api/Hesaplamalar/Hesaplamalar";
import { createFisGirisiVerisi } from "@/api/Donusum/FisGirisi";
import { enqueueSnackbar } from "notistack";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  yevmiyeNo: number;
  fisTipi: string;
  detayKodu: string;
  hesapAdi: string;
  paraBirimi: string;
  borcTutari: number;
  alacakTutari: number;
  aciklama: string;
}

interface Props {
  kaydetTiklandimi: boolean;
  setkaydetTiklandimi(bool: boolean): void;
}

const AYNI_KALACAK_HESAPLAR = new Set([
  "102",
  "300",
  "301",
  "302",
  "303",
  "400",
  "401",
  "402",
]);

const KUR_FARKI_HESAP_ADLARI: Record<string, string> = {
  "646": "Kambiyo Kârları",
  "649": "Diğer Olağan Gelir ve Kârlar",
  "656": "Kambiyo Zararları",
  "659": "Diğer Olağan Gider ve Zararlar",
};

const getHesapPrefix = (hesapKodu: string) =>
  String(hesapKodu || "").trim().split(".")[0].slice(0, 3);

const getKurFarkiHesapKodu = (detayKodu: string) => {
  const trimmedDetayKodu = String(detayKodu || "").trim();

  if (trimmedDetayKodu.startsWith("646")) {
    return trimmedDetayKodu.replace(/^646/, "649");
  }

  if (trimmedDetayKodu.startsWith("656")) {
    return trimmedDetayKodu.replace(/^656/, "659");
  }

  return trimmedDetayKodu;
};

const getKurFarkiHesapAdi = (hesapKodu: string, mevcutHesapAdi: string) => {
  const hesapPrefix = getHesapPrefix(hesapKodu);
  return KUR_FARKI_HESAP_ADLARI[hesapPrefix] || mevcutHesapAdi;
};

const duzenleKurFarkiFisleri = (fisler: any[]) => {
  const fislarMap = new Map<number, any[]>();

  fisler.forEach((fis) => {
    const mevcutFis = fislarMap.get(fis.yevmiyeNo) || [];
    mevcutFis.push(fis);
    fislarMap.set(fis.yevmiyeNo, mevcutFis);
  });

  return fisler.map((fis) => {
    const detayKodu = String(fis.detayKodu || "").trim();
    const hesapPrefix = getHesapPrefix(detayKodu);

    if (hesapPrefix !== "646" && hesapPrefix !== "656") {
      return fis;
    }

    const fisSatirlari = fislarMap.get(fis.yevmiyeNo) || [];
    const karsiHesaplar = fisSatirlari
      .map((satir) => getHesapPrefix(satir.detayKodu))
      .filter((prefix) => prefix && prefix !== "646" && prefix !== "656");

    const ayniKalacakMi = karsiHesaplar.some((prefix) =>
      AYNI_KALACAK_HESAPLAR.has(prefix)
    );

    if (ayniKalacakMi) {
      return fis;
    }

    const yeniDetayKodu = getKurFarkiHesapKodu(detayKodu);

    return {
      ...fis,
      detayKodu: yeniDetayKodu,
      hesapAdi: getKurFarkiHesapAdi(yeniDetayKodu, fis.hesapAdi),
    };
  });
};

const KurFarkiOrnekFisler: React.FC<Props> = ({
  kaydetTiklandimi,
  setkaydetTiklandimi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<any[]>([]);

  const handleKaydet = async (selectedFetchedData: any) => {
    const keys = [
      "denetciId",
      "denetlenenId",
      "yil",
      "yevmiyeNo",
      "fisTipi",
      "detayKodu",
      "hesapAdi",
      "borc",
      "alacak",
      "aciklama",
      "tarih",
    ];

    const jsonData = selectedFetchedData
      .filter((veri: any) => veri[0])
      .map((item: any[]) => {
        let obj: { [key: string]: any } = {};

        keys.forEach((key, i) => {
          if (key === "denetciId") {
            obj[key] = user.denetciId;
          } else if (key === "denetlenenId") {
            obj[key] = user.denetlenenId;
          } else if (key === "yil") {
            obj[key] = user.yil ? user.yil : 0;
          } else if (key === "tarih") {
            obj[key] = "";
          } else if (key === "borc" || key === "alacak" || key === "aciklama") {
            obj[key] = item[i - 1];
          } else {
            obj[key] = item[i - 2];
          }
        });

        return obj;
      });

    try {
      const result = await createFisGirisiVerisi(jsonData,
        false
      );
      if (result) {
        enqueueSnackbar("Fiş Kaydedildi", {
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
        enqueueSnackbar("Fiş Kaydedilemedi", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
          },
        });
      }
      setkaydetTiklandimi(false);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const numberValidator = (
    value: string,
    callback: (value: boolean) => void
  ) => {
    const numberRegex = /^[0-9]+(\.[0-9]+)?$/; // Regex to match numbers with optional decimal part
    if (numberRegex.test(value)) {
      callback(true);
    } else {
      enqueueSnackbar("Hatalı Sayı Girişi. Ondalıklı Sayı Girilmelidir.", {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
          maxWidth: "720px",
        },
      });
      callback(false);
    }
  };

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
    "Seçim",
    "No",
    "Fiş Tipi",
    "Detay Kodu",
    "Hesap Adı",
    "Para Birimi",
    "Borç",
    "Alacak",
    "Açıklama",
  ];

  const columns = [
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
    }, // Fiş No
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Fiş Tipi
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
      validator: numberValidator,
      allowInvalid: false,
    }, // Borç
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      validator: numberValidator,
      allowInvalid: false,
    }, // Alacak
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Açıklama
  ];




  const handleAfterChange = async (changes: any, source: any) => {
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

  const handleBeforeChange = (changes: any[]) => {
    if (!changes) return;

    for (let i = 0; i < changes.length; i++) {
      const [row, prop, oldValue, newValue] = changes[i];

      if ([6, 7].includes(prop)) {
        if (typeof newValue === "string") {
          let normalized = newValue.trim();
          
          // Turkish format: 47.792,87 → remove dots → replace comma with dot
          if (normalized.includes(',')) {
            normalized = normalized.replace(/\./g, '').replace(',', '.');
          }
          // International format: 47792.87 stays as-is
          
          changes[i][3] = normalized;
        }
      }
    }
  };

  const fetchData = async () => {
    try {
      const kurFarkiOrnekFisVerileri = await getKurFarkiOrnekFisler(
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      const duzenlenmisFisler = duzenleKurFarkiFisleri(
        kurFarkiOrnekFisVerileri || []
      );

      const rowsAll: any = [];
      duzenlenmisFisler.forEach((veri: any) => {
        const newRow: any = [
          true,
          veri.yevmiyeNo,
          veri.fisTipi,
          veri.detayKodu,
          veri.hesapAdi,
          veri.paraBirimi,
          veri.borcTutari,
          veri.alacakTutari,
          veri.aciklama,
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
        saveAs(blob, `KurFarkiOrnekFisler.xlsx`);
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
      }
    }
    createExcelFile();
  };

  useEffect(() => {
    if (kaydetTiklandimi && fetchedData) {
      handleKaydet(fetchedData);
    }
  }, [kaydetTiklandimi]);

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
          maxHeight: 342,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={342}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[30, 18, 35, 50, 60, 50, 50, 50, 50]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={9}
        filters={true}
        columnSorting={true}
        dropdownMenu={[
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        afterChange={handleAfterChange} // Add afterChange hook
        beforeChange={handleBeforeChange} // Add beforeChange hook
        contextMenu={["alignment", "copy"]}
      />
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
      </Grid>
    </>
  );
};

export default KurFarkiOrnekFisler;

