import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Box, Button, Grid, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import {
  createVadeliBankaMevduatiFaizTahakkuk,
  getVadeliBankaMevduatiFaizTahakkuk,
} from "@/api/Hesaplamalar/Hesaplamalar";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  detayKodu: string;
  hesapAdi: string;
  paraBirimi: string;
  faizBaslangicTarihi: string;
  faizTahakkukTarihi: string;
  bilesikFaizOrani: number;
  dovizTutari: number;
  hesaplananBakiye: number;
  mizanBakiye: number;
  tahakkukEdenGunSayisi: number;
  tahakkukEttirilmisFaizTutari: number;
  tahakkukEttirilmesiGerekenFaizTutari: number;
  tahakkukEdilecekFaizTutari: number;
}

const VadeliBankaMevduatiFaizTahakkuk = () => {
  const hotTableComponent = useRef<any>(null);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<any[]>([]);

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

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

  const dateValidator = (
    value: string,
    callback: (isValid: boolean) => void
  ) => {
    // Tarih formatı düzenli ifadesi (dd.mm.yyyy)
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (dateRegex.test(value)) {
      callback(true);
    } else {
      enqueueSnackbar(
        "Hatalı Tarih Girişi. GG.AA.YYYY Formatında Tarih Girmelisiniz.",
        {
          variant: "warning",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.warning.dark
                : theme.palette.warning.main,
            maxWidth: "720px",
          },
        }
      );
      callback(false);
    }
  };

  const colHeaders = [
    "Id",
    "Detay Kodu",
    "Hesap Adı",
    "Para Birimi",
    "Faiz Başlangıç Tarihi",
    "Faiz Tahakkuk Tarihi",
    "Bileşik Faiz Oranı %",
    "Döviz Tutarı",
    "Hesaplanan Bakiye",
    "Mizan Bakiye",
    "Tahakkuk Eden Gün Sayısı",
    "Tahakkuk Ettirilmiş Faiz Tutarı",
    "Tahakkuk Ettirilmesi Gereken Faiz Tutarı",
    "Tahakkuk Edilecek Faiz Tutarı",
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
      type: "date",
      dateFormat: "DD.MM.YYYY",
      columnSorting: true,
      className: "htRight",
      validator: dateValidator,
      allowInvalid: false,
    }, // Faiz Başlangıç Tarihi
    {
      type: "date",
      dateFormat: "DD.MM.YYYY",
      columnSorting: true,
      className: "htRight",
      validator: dateValidator,
      allowInvalid: false,
    }, // Faiz Tahakkuk Tarihi
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
    }, // Bileşik Faiz Oranı
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
    }, // Döviz Tutarı
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
    }, // Hesaplanan Bakiye
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
    }, // Mizan Bakiye
    {
      type: "numeric",
      numericFormat: {
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Tahakkuk Eden Gün Sayısı
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
    }, // Tahakkuk Ettirilmiş Faiz Tutarı
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
    }, // Tahakkuk Ettirilmesi Gereken Faiz Tutarı
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
    }, // Tahakkuk Edilecek Faiz Tutarı
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

  const handleJson = async () => {
    try {
      const keys = [
        "denetciId",
        "denetlenenId",
        "yil",
        "id",
        "detayKodu",
        "hesapAdi",
        "paraBirimi",
        "faizBaslangicTarihi",
        "faizTahakkukTarihi",
        "bilesikFaizOrani",
        "dovizTutari",
        "hesaplananBakiye",
        "mizanBakiye",
        "tahakkukEdenGunSayisi",
        "tahakkukEttirilmisFaizTutari",
        "tahakkukEttirilmesiGerekenFaizTutari",
        "tahakkukEdilecekFaizTutari",
      ];

      const jsonData =
        fetchedData.length === 1
          ? keys.reduce(
              (acc: { [key: string]: any }, key: string, index: number) => {
                if (key === "denetciId") {
                  acc[key] = user.denetciId;
                } else if (key === "denetlenenId") {
                  acc[key] = user.denetlenenId;
                } else if (key === "yil") {
                  acc[key] = user.yil;
                } else {
                  if (
                    key === "faizBaslangicTarihi" ||
                    key === "faizTahakkukTarihi"
                  ) {
                    acc[key] =
                      acc[index - 3] != null &&
                      acc[index - 3] != "" &&
                      acc[index - 3] != undefined
                        ? new Date(
                            acc[index - 3].split(".").reverse().join("-")
                          ).toISOString()
                        : null;
                  } else {
                    acc[key] = acc[index - 3];
                  }
                }
                return acc;
              },
              {}
            )
          : fetchedData.map((item: any[]) => {
              let obj: { [key: string]: any } = {};
              keys.forEach((key, index) => {
                if (key === "denetciId") {
                  obj[key] = user.denetciId;
                } else if (key === "denetlenenId") {
                  obj[key] = user.denetlenenId;
                } else if (key === "yil") {
                  obj[key] = user.yil;
                } else {
                  if (
                    key === "faizBaslangicTarihi" ||
                    key === "faizTahakkukTarihi"
                  ) {
                    obj[key] =
                      item[index - 3] != null &&
                      item[index - 3] != "" &&
                      item[index - 3] != undefined
                        ? new Date(
                            item[index - 3].split(".").reverse().join("-")
                          ).toISOString()
                        : null;
                  } else {
                    obj[key] = item[index - 3];
                  }
                }
              });
              return obj;
            });
      return jsonData;
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleHesapla = async () => {
    try {
      let json = await handleJson();

      const result = await createVadeliBankaMevduatiFaizTahakkuk(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        json
      );

      setHesaplaTiklandimi(false);
      if (result) {
        enqueueSnackbar("Vadeli Banka Mevduatı Faiz Tahakkuk Hesaplandı", {
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
        enqueueSnackbar("Vadeli Banka Mevduatı Faiz Tahakkuk Hesaplanamadı", {
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
      const vadeliBankaMevduatiFaizTahakkukVerileri =
        await getVadeliBankaMevduatiFaizTahakkuk(
          user.token || "",
          user.denetciId || 0,
          user.yil || 0,
          user.denetlenenId || 0
        );

      const rowsAll: any = [];

      vadeliBankaMevduatiFaizTahakkukVerileri.forEach((veri: any) => {
        if (
          veri.faizBaslangicTarihi !== null &&
          veri.faizTahakkukTarihi !== undefined
        ) {
          const newRow: any = [
            veri.id,
            veri.detayKodu,
            veri.hesapAdi,
            veri.paraBirimi,
            veri.faizBaslangicTarihi
              .split("T")[0]
              .split("-")
              .reverse()
              .join("."),
            veri.faizTahakkukTarihi
              .split("T")[0]
              .split("-")
              .reverse()
              .join("."),
            veri.bilesikFaizOrani * 100,
            veri.dovizTutari,
            veri.hesaplananBakiye,
            veri.mizanBakiye,
            veri.tahakkukEdenGunSayisi,
            veri.tahakkukEttirilmisFaizTutari,
            veri.tahakkukEttirilmesiGerekenFaizTutari,
            veri.tahakkukEdilecekFaizTutari,
          ];
          rowsAll.push(newRow);
        } else {
          const newRow: any = [
            veri.id,
            veri.detayKodu,
            veri.hesapAdi,
            veri.paraBirimi,
            veri.faizBaslangicTarihi,
            veri.faizTahakkukTarihi,
            veri.bilesikFaizOrani,
            veri.dovizTutari,
            veri.hesaplananBakiye,
            veri.mizanBakiye,
            veri.tahakkukEdenGunSayisi,
            veri.tahakkukEttirilmisFaizTutari,
            veri.tahakkukEttirilmesiGerekenFaizTutari,
            veri.tahakkukEdilecekFaizTutari,
          ];
          rowsAll.push(newRow);
        }
      });
      rowsAll.sort((a: any, b: any) => (a[0] > b[0] ? 1 : -1));

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
      setOpenCartAlert(true);
      setFetchedData([]);
      setRowCount(0);
    } else {
      setOpenCartAlert(false);
      fetchData();
    }
  }, [hesaplaTiklandimi]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row.slice(0));

    const headers = hotTableInstance.getColHeader().slice(0);

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
        saveAs(blob, `VadeliBankaMevduatiFaizTahakkukHesapla.xlsx`);
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
      <Grid
        item
        xs={12}
        lg={12}
        sx={{
          display: "flex",
          flexDirection: smDown ? "column" : "row",
          alignItems: "center",
          justifyContent: "flex-end",
          mb: 2,
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: smDown ? "column" : "row",
            gap: 1,
            width: smDown ? "100%" : "auto",
          }}
        >
          <Button
            type="button"
            size="medium"
            disabled={hesaplaTiklandimi}
            variant="outlined"
            color="primary"
            sx={{ height: "100%" }}
            onClick={() => {
              setHesaplaTiklandimi(true);
              handleHesapla();
            }}
          >
            Hesapla
          </Button>
        </Box>
      </Grid>
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
        colWidths={[60, 80, 100, 60, 80, 80, 60, 80, 80, 80, 80, 80, 80, 80]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={14}
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
        contextMenu={["alignment", "copy"]}
      />
      <Grid container marginTop={2}>
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
        {openCartAlert && (
          <InfoAlertCart
            openCartAlert={openCartAlert}
            setOpenCartAlert={setOpenCartAlert}
          ></InfoAlertCart>
        )}
      </Grid>
    </>
  );
};

export default VadeliBankaMevduatiFaizTahakkuk;
