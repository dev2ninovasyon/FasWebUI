import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import {
  getOnemlilikVeOrneklem,
  updateOnemlilikVeOrneklem,
} from "@/api/PlanVeProgram/PlanVeProgram";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  kebirKodu: number;
  hesapAdi: string;
  borcAlacakToplami: number;
  mizanIcindekiPayi: number;
  kabulEdilebilirYanlislik: number;
  performansOnemliligi: number;
  borcIslemSayisi: number;
  alacakIslemSayisi: number;
  toplamIslemSayisi: number;
  risk: string;
  tespit: string;
}

interface Props {
  hesaplaTiklandimi: boolean;
}

const OnemlilikVeOrneklem: React.FC<Props> = ({ hesaplaTiklandimi }) => {
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

  const textValidator = (value: string, callback: (value: boolean) => void) => {
    if (!value || value.trim() === "") {
      // Eğer değer boşsa geçersiz kabul et
      callback(false);
    } else {
      callback(true);
    }
  };

  const colHeaders = [
    "Id",
    "Kebir Kodu",
    "Hesap Adı",
    "Borç Alacak Toplamı",
    "Mizan İçindeki Payı",
    "Genel Önemlilik",
    "Performans Önemliliği",
    "B. Fiş Sayısı",
    "A. Fiş Sayısı",
    "Toplam Fiş Sayısı",
    "Risk",
    "Tespit",
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
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Borç Fiş Sayısı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Alacak Fiş Sayısı
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Toplam Fiş Sayısı
    {
      type: "dropdown",
      source: ["Düşük", "Orta", "Yüksek"],
      className: "htLeft",
      allowInvalid: false,
    }, // Risk
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      validator: textValidator,
      allowInvalid: false,
    }, //Tespit
  ];

  const afterGetColHeader = (col: any, TH: any) => {
    TH.style.height = "50px";

    let div = TH.querySelector("div");
    if (!div) {
      div = document.createElement("div");
      TH.appendChild(div);
    }

    div.style.whiteSpace = "normal";
    div.style.wordWrap = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.height = "100%";
    div.style.position = "relative";

    //typography body1
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    //color
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
    //customizer.activeMode === "dark" ? "#253662" : "#ECF2FF";

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#";

    // Create span for the header text
    let span = div.querySelector("span");
    if (!span) {
      span = document.createElement("span");
      div.appendChild(span);
    }
    span.textContent = colHeaders[col];
    span.style.position = "absolute";
    span.style.marginRight = "16px";
    span.style.left = "4px";

    // Create button if it does not exist
    let button = div.querySelector("button");
    if (!button) {
      button = document.createElement("button");
      button.style.display = "none";
      div.appendChild(button);
    }
    button.style.position = "absolute";
    button.style.right = "4px";
  };

  const afterGetRowHeader = (row: any, TH: any) => {
    let div = TH.querySelector("div");
    div.style.whiteSpace = "normal";
    div.style.wordWrap = "break-word";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.height = "100%";

    //typography body1
    TH.style.fontFamily = plus.style.fontFamily;
    TH.style.fontWeight = 500;
    TH.style.fontSize = "0.875rem";
    TH.style.lineHeight = "1.334rem";

    //color
    TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
    TH.style.backgroundColor = theme.palette.primary.light;
    //customizer.activeMode === "dark" ? "#253662" : "#ECF2FF";

    TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#";
  };

  const afterRenderer = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    //typography body1
    TD.style.fontFamily = plus.style.fontFamily;
    TD.style.fontWeight = 500;
    TD.style.fontSize = "0.875rem";
    TD.style.lineHeight = "1.334rem";
    //TD.style.textAlign = "left";

    //color
    TD.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";

    if (row % 2 === 0) {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
    } else {
      TD.style.backgroundColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      TD.style.borderColor =
        customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
      TD.style.borderRightColor =
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

  const handleAfterChange = (changes: any, source: any) => {
    if (source === "loadData") {
      return; // Skip this hook on loadData
    }
    if (changes) {
      for (const [row, prop, oldValue, newValue] of changes) {
        console.log(
          `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
        );

        if (prop === 10 || prop === 11) {
          const rowData =
            hotTableComponent.current?.hotInstance.getDataAtRow(row);
          if (!rowData) return;

          const obj = {
            id: rowData[0],
            denetciId: user.denetciId || 0,
            denetlenenId: user.denetlenenId || 0,
            yil: user.yil || 0,
            kebirKodu: rowData[1],
            hesapAdi: rowData[2],
            borcAlacakToplami: rowData[3],
            mizanIcindekiPayi: rowData[4],
            kabulEdilebilirYanlislik: rowData[5],
            performansOnemliligi: rowData[6],
            borcIslemSayisi: rowData[7],
            alacakIslemSayisi: rowData[8],
            toplamIslemSayisi: rowData[9],
            risk: rowData[10],
            tespit: rowData[11],
          };
          setOpenCartAlert(true);
          handleUpdate(obj);
        }
      }
    }
  };

  const handleUpdate = async (json: any) => {
    try {
      const result = await updateOnemlilikVeOrneklem(user.token || "", json);
      if (result) {
        fetchData();
        setOpenCartAlert(false);
        enqueueSnackbar("Örneklem Güncellendi", {
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
        enqueueSnackbar("Örneklem Güncellenemedi", {
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
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const fisVerileri = await getOnemlilikVeOrneklem(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      const rowsAll: any = [];
      fisVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.id,
          veri.kebirKodu,
          veri.hesapAdi,
          veri.borcAlacakToplami,
          veri.mizanIcindekiPayi,
          veri.kabulEdilebilirYanlislik,
          veri.performansOnemliligi,
          veri.borcIslemSayisi,
          veri.alacakIslemSayisi,
          veri.toplamIslemSayisi,
          veri.risk,
          veri.tespit,
        ];
        rowsAll.push(newRow);
      });

      setRowCount(rowsAll.length);
      setFetchedData(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setFetchedData([]);
      setRowCount(0);
    } else {
      fetchData();
    }
  }, [hesaplaTiklandimi]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row.slice(1));

    const headers = hotTableInstance.getColHeader().slice(1);

    const fullData = [headers, ...processedData];

    async function createExcelFile() {
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
        saveAs(blob, "OnemlilikVeOrneklem.xlsx");
        console.log("Excel dosyası başarıyla oluşturuldu");
      } catch (error) {
        console.error("Excel dosyası oluşturulurken bir hata oluştu:", error);
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
      <HotTable
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
        colWidths={[
          0, 70, 100, 100, 60, 100, 100, 60, 100, 100, 60, 60, 60, 60, 100, 80,
        ]}
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
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        afterRenderer={afterRenderer}
        afterChange={handleAfterChange}
        contextMenu={["alignment", "copy"]}
      />
      <Grid container marginTop={2} marginBottom={1}>
        <Grid item xs={12} lg={10}></Grid>
        <Grid
          item
          xs={12}
          lg={2}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <ExceleAktarButton
            handleDownload={handleDownload}
          ></ExceleAktarButton>
        </Grid>
      </Grid>
      {openCartAlert && (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        ></InfoAlertCart>
      )}
    </>
  );
};

export default OnemlilikVeOrneklem;
