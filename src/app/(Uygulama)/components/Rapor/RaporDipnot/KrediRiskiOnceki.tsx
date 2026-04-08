import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
  getKrediRiski,
  updateKrediRiski,
} from "@/api/DenetimRaporu/DenetimRaporu";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  yil: number;
  kalemAdi: string;
  ticariAlacaklarIliskiliTaraf: number;
  ticariAlacaklarDigerTaraf: number;
  digerAlacaklarIliskiliTaraf: number;
  digerAlacaklarDigerTaraf: number;
  finansalYatirimlar: number;
  nakitVeNakitBenzeleri: number;
  toplam: number;
}

interface Props {
  dipnotKodu: number;
  kaydetTiklandimi: boolean;
  setKaydetTiklandimi: (bool: boolean) => void;
  konsolide?: boolean;
}

const KrediRiskiOnceki: React.FC<Props> = ({
  dipnotKodu,
  kaydetTiklandimi,
  setKaydetTiklandimi,
  konsolide,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState<number>(7);

  const [fetchedData, setFetchedData] = useState<any[]>([]);

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

  const colHeaders = [
    "Id",
    `Kredi Riski (${user.yil ? user.yil - 1 : 0})`,
    "Ticari A. İlişkili T.",
    "Ticari A. Diğer T.",
    "Diğer A. İlişkili T.",
    "Diğer A. Diğer T.",
    "Finansal Yatırımlar",
    "Nakit ve Nakit Benzerleri",
    "Toplam",
  ];

  const columns = [
    { type: "numeric", columnSorting: true, readOnly: true, editor: false }, // Id
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
    }, // Ticari A. İlişkili T.
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
    }, // Ticari A. Diğer T.
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
    }, // Diğer A. İlişkili T.
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
    }, // Diğer A. Diğer T.
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
    }, // Finansal Yatırımlar
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
    }, // Nakit ve Nakit Benzerleri
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
    }, // Toplam
  ];




  const afterPaste = async (data: any, coords: any) => {
    console.log("Pasted data:", data);

    console.log("Pasted startRow coordinates:", coords[0].startRow);
    console.log("Pasted endRow coordinates:", coords[0].endRow);
    console.log("Pasted startCol coordinates:", coords[0].startCol);
    console.log("Pasted endCol coordinates:", coords[0].endCol);
  };

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

      if ([2, 3, 4, 5, 6, 7, 8].includes(prop)) {
        if (typeof newValue === "string") {
          const cleanedNewValue = newValue.replaceAll(/\./g, "");
          changes[i][3] = cleanedNewValue;
        }
      }
    }
  };

  const handleSaveKrediRiskiVerisi = async () => {
    const keys = [
      "denetciId",
      "denetlenenId",
      "yil",
      "id",
      "kalemAdi",
      "ticariAlacaklarIliskiliTaraf",
      "ticariAlacaklarDigerTaraf",
      "digerAlacaklarIliskiliTaraf",
      "digerAlacaklarDigerTaraf",
      "finansalYatirimlar",
      "nakitVeNakitBenzeleri",
      "toplam",
    ];

    const jsonData = fetchedData.map((item: any[]) => {
      let obj: { [key: string]: any } = {};

      keys.forEach((key, i) => {
        if (key === "denetciId") {
          obj[key] = user.denetciId;
        } else if (key === "denetlenenId") {
          obj[key] = user.denetlenenId;
        } else if (key === "yil") {
          obj[key] = user.yil ? user.yil - 1 : 0;
        } else {
          obj[key] = item[i - 3];
        }
      });

      return obj;
    });

    const result = await updateKrediRiski(jsonData);
    if (result) {
      console.log("Kredi Riski Önceki güncellendi.");
    } else {
      console.log("Kredi Riski Önceki güncellenemedi.");
    }
  };

  const fetchData = async () => {
    try {
      if (dipnotKodu == 381 || dipnotKodu == 45) {
        const krediRiskiVerileri = await getKrediRiski(user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          konsolide
        );

        const rowsAll: any = [];
        if (krediRiskiVerileri && Array.isArray(krediRiskiVerileri)) {
          krediRiskiVerileri
            .filter((veri: Veri) => veri.yil == (user.yil ? user.yil - 1 : 0))
            .forEach((veri: any) => {
              const newRow: any = [
                veri.id,
                veri.kalemAdi,
                veri.ticariAlacaklarIliskiliTaraf,
                veri.ticariAlacaklarDigerTaraf,
                veri.digerAlacaklarIliskiliTaraf,
                veri.digerAlacaklarDigerTaraf,
                veri.finansalYatirimlar,
                veri.nakitVeNakitBenzeleri,
                veri.toplam,
              ];
              rowsAll.push(newRow);
            });
        }
        setFetchedData(rowsAll);
        setRowCount(rowsAll.length);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (kaydetTiklandimi) {
      handleSaveKrediRiskiVerisi();
      setKaydetTiklandimi(false);
    }
  }, [kaydetTiklandimi]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row.slice(1));

    const headers = hotTableInstance.getColHeader().slice(1);

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
        saveAs(blob, "KrediRiski.xlsx");
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
  }, [customizer.isCollapse]);

  return (
    <>
      <CustomHotTable dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]} filters={true}  theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
        style={{
          height: "100%",
          width: "100%",
          maxHeight: 342,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={684}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[120, 120, 100, 100, 100, 100, 100, 100, 100]}
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
        columnSorting={true}
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        afterPaste={afterPaste} // Add afterPaste hook
        afterChange={handleAfterChange} // Add afterChange hook
        beforeChange={handleBeforeChange} // Add beforeChange hook
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

export default KrediRiskiOnceki;

