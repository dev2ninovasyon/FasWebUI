import { HotTable } from "@handsontable/react";
import type { ColumnSettings } from "handsontable/settings"; // Handsontable'dan ColumnSettings tipi
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  createKrediHesaplamaDetayVerisi,
  deleteKrediHesaplamaDetayVerisi,
  getKrediHesaplamaDetayVerileriByDenetciDenetlenenYil,
} from "@/api/Veri/KrediHesaplamaDetay";
import { getFormat } from "@/api/Veri/base";
import { enqueueSnackbar } from "notistack";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import { usePathname } from "next/navigation";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import { getKrediHesaplamaVerileriByDenetciDenetlenenYilId } from "@/api/Veri/KrediHesaplama";
import WarnBox from "@/app/(Uygulama)/components/Alerts/WarnBox";

// register Handsontable's modules
registerAllModules();

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  taksitTarihi: string;
  taksitTutari: number;
  faizTutari: number;
  fonVergi: number;
  anaPara: number;
  bakiye: number;
}

interface Props {
  kaydetTiklandimi: boolean;
  setKaydetTiklandimi: (b: boolean) => void;
  setSonKaydedilmeTarihi: (str: string) => void;
}

const KrediDetayVeriYukleme: React.FC<Props> = ({
  kaydetTiklandimi,
  setKaydetTiklandimi,
  setSonKaydedilmeTarihi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("KrediDetaylari") + 1;
  const pathKrediId = parseInt(segments[idIndex]);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [alinanKrediTutar, setAlinanKrediTutar] = useState<number>(0);

  const [tur, setTur] = useState<string>("");

  const [rowCount, setRowCount] = useState<number>(1);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const [duplicatesControl, setDuplicatesControl] = useState(false);

  const uyari = [
    "Boş Bırakılmaması Gereken Sütunlar: Taksit Tarihi, Taksit Tutarı, Faiz Tutarı",
    "Taksit Tarihi Sütunu Boş Bırakılmamalıdır Ve GG.AA.YYYY Formatında Tarih Girilmelidir.",
    "Taksit Tutarı Ve Faiz Tutarı Sütunları Boş Bırakılmamalıdır Ve Ondalıklı Sayı Girilmelidir.",
    "Fon + Vergi Ve Ana Para Sütunlarına Ondalıklı Sayı Girilmelidir Veya Boş Bırakılabilir.",
  ];

  const [endRow, setEndRow] = useState(-1);

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
      callback(false);
    }
  };

  const numberValidatorAllowNull = (
    value: string,
    callback: (value: boolean) => void
  ) => {
    const numberRegex = /^[0-9]+(\.[0-9]+)?$/; // Regex to match numbers with optional decimal part
    if (!value || String(value).trim() === "") {
      // Eğer değer boşsa geçerli kabul et
      callback(true);
    } else if (numberRegex.test(value)) {
      callback(true);
    } else {
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
      callback(false);
    }
  };

  function isRowEmpty(row: Veri): boolean {
    return Object.values(row).every(
      (value) =>
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
    );
  }

  function findDuplicateRows(data: Veri[]): number[] {
    const seenRows = new Set<string>();
    const duplicates: number[] = [];

    data.forEach((row, index) => {
      if (isRowEmpty(row)) return; // tüm değerler boşsa geç

      const rowString = JSON.stringify(row, Object.keys(row).sort());

      if (seenRows.has(rowString)) {
        duplicates.push(index + 1); // 1-based row number
      } else {
        seenRows.add(rowString);
      }
    });

    return duplicates;
  }

  useEffect(() => {
    if (duplicatesControl) {
      const duplicateRowNumbers = findDuplicateRows(fetchedData);

      if (duplicateRowNumbers.length > 0) {
        const duplicatesMessage = duplicateRowNumbers.join(", ") + " ";

        enqueueSnackbar(
          `${duplicatesMessage}Numaralı Satır${
            duplicateRowNumbers.length > 1 ? "lar" : ""
          } Tekrar Eden Veri İçeriyor. Kontrol Edin.`,
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
      }

      setDuplicatesControl(false);
    }
  }, [duplicatesControl]);

  const [colHeaders, setColHeaders] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnSettings[]>([]);

  useEffect(() => {
    setColHeaders(
      [
        tur == "Taksitli Kredi" ? "Taksit Tarihi" : "Vade Tarihi",
        tur == "Taksitli Kredi" ? "Taksit Tutarı" : "Ana Para",
        "Faiz Tutarı",
        "Fon + Vergi",
        tur == "Taksitli Kredi" ? "Ana Para" : "Ödenen Tutar",
        tur == "Taksitli Kredi" && "Kalan",
      ].filter(Boolean) as string[]
    );

    setColumns(
      [
        {
          type: "date",
          dateFormat: "DD.MM.YYYY",
          columnSorting: true,
          className: "htRight",
          validator: dateValidator,
          allowInvalid: false,
        }, // Taksit Tarihi - Vade Tarihi
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
        }, // Taksit Tutarı - Ana Para
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
        }, // Faiz Tutarı
        {
          type: "numeric",
          numericFormat: {
            pattern: "0,0.00",
            columnSorting: true,
            culture: "tr-TR",
          },
          className: "htRight",
          validator: numberValidatorAllowNull,
          allowInvalid: false,
        }, // Fon + Vergi
        {
          type: "numeric",
          numericFormat: {
            pattern: "0,0.00",
            columnSorting: true,
            culture: "tr-TR",
          },
          className: "htRight",
          validator: numberValidatorAllowNull,
          allowInvalid: false,
        }, // Ana Para - Ödenen Tutar
        tur == "Taksitli Kredi" && {
          type: "numeric",
          numericFormat: {
            pattern: "0,0.00",
            columnSorting: true,
            culture: "tr-TR",
          },
          className: "htRight",
          readOnly: true,
          editor: false,
        }, // Kalan
      ].filter(Boolean) as ColumnSettings[]
    );
  }, [tur]);

  const afterGetColHeader = (col: any, TH: any) => {
    // Set the height of the column headers
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

    if (row <= endRow && (value == undefined || value == null || value == "")) {
      TD.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
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

  const handleCreateRow = async (index: number, amount: number) => {
    if (amount == 1 && index != rowCount - 1) {
      console.log(
        `Yeni satır(lar) eklendi: ${amount} adet satır ${index} indexinden itibaren.`
      );
    }
  };

  const handleAfterRemoveRow = async (
    index: number,
    amount: number,
    physicalRows: number[],
    source: any
  ) => {
    console.log(
      `Satır(lar) silindi: ${amount} adet satır ${index} indexinden itibaren.${physicalRows}`
    );
  };

  const afterPaste = async (data: any, coords: any) => {
    console.log("Pasted data:", data);

    console.log("Pasted startRow coordinates:", coords[0].startRow);
    console.log("Pasted endRow coordinates:", coords[0].endRow);
    console.log("Pasted startCol coordinates:", coords[0].startCol);
    console.log("Pasted endCol coordinates:", coords[0].endCol);

    if (endRow < coords[0].endRow) {
      setEndRow(coords[0].endRow);
    }
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

        if (prop === 4 && tur == "Taksitli Kredi") {
          const hot = hotTableComponent.current.hotInstance;

          const anaParalar: number[] = [];
          const yeniBakiyeler: number[] = [];

          // 1. Ana paraları oku
          for (let i = 0; i < fetchedData.length; i++) {
            if (!hot.getDataAtCell(i, 0)) break;

            const anaPara = Number(hot.getDataAtCell(i, 4) || 0);
            anaParalar.push(anaPara);
          }

          // 2. Bakiyeleri hesapla
          for (let i = 0; i < anaParalar.length; i++) {
            if (i === 0) {
              yeniBakiyeler[i] = alinanKrediTutar - anaParalar[i];
            } else {
              yeniBakiyeler[i] = yeniBakiyeler[i - 1] - anaParalar[i];
            }

            fetchedData[i].bakiye = yeniBakiyeler[i]; // veri kaynağını da güncelle
          }

          // 3. Hesaplanan bakiyeleri tabloya yaz
          for (let i = 0; i < yeniBakiyeler.length; i++) {
            hot.setDataAtCell(i, 5, yeniBakiyeler[i]);
          }
        }
      }
    }
  };

  const handleBeforeChange = (changes: any[]) => {
    if (!changes) return;

    for (let i = 0; i < changes.length; i++) {
      const [row, prop, oldValue, newValue] = changes[i];

      if ([1, 2, 3, 4].includes(prop)) {
        if (typeof newValue === "string") {
          const cleanedNewValue = newValue.replaceAll(/\./g, "");
          changes[i][3] = cleanedNewValue;
        }
      }
    }
  };

  const handleCreateKrediHesaplamaDetayVerisi = async () => {
    if (fetchedData.filter((item: any) => item[0]).length == 0) {
      await handleDeleteKrediHesaplamaDetayVerisi();
      return;
    }
    const keys = [
      "denetciId",
      "denetlenenId",
      "yil",
      "krediHesaplamaId",
      "taksitTarihi",
      tur == "Taksitli Kredi" ? "taksitTutari" : "anaPara",
      "faizTutari",
      "fonVergi",
      tur == "Taksitli Kredi" ? "anaPara" : "taksitTutari",
    ];
    const jsonData = fetchedData
      .filter((item: any) => item[0])
      .map((item: any) => {
        let obj: { [key: string]: any } = {};
        keys.forEach((key, index) => {
          if (key === "denetciId") {
            obj[key] = user.denetciId;
          } else if (key === "denetlenenId") {
            obj[key] = user.denetlenenId;
          } else if (key === "yil") {
            obj[key] = user.yil;
          } else if (key === "krediHesaplamaId") {
            obj[key] = pathKrediId;
          } else if (key === "taksitTarihi") {
            if (
              item[index - 4] == undefined ||
              item[index - 4] == null ||
              item[index - 4] == ""
            ) {
              obj[key] = null;
            } else {
              const rawValue = item[index - 4];
              const [day, month, year] = rawValue.split(".");
              obj[key] = new Date(
                `${year}-${month}-${day}T00:00:00Z`
              ).toISOString();
            }
          } else if (key === "fonVergi" || key === "anaPara") {
            if (
              item[index - 4] == undefined ||
              item[index - 4] == null ||
              item[index - 4] == ""
            ) {
              obj[key] = 0.0;
            } else {
              obj[key] = item[index - 4];
            }
          } else {
            if (
              item[index - 4] == undefined ||
              item[index - 4] == null ||
              item[index - 4] == ""
            ) {
              obj[key] = null;
            } else {
              obj[key] = item[index - 4];
            }
          }
        });

        return obj;
      });

    try {
      const result = await createKrediHesaplamaDetayVerisi(
        user.token || "",
        jsonData
      );
      if (result) {
        await fetchData();
        enqueueSnackbar("Kaydedildi", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
            maxWidth: "720px",
          },
        });
      } else {
        enqueueSnackbar("Kaydedilemedi", {
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

  const handleDeleteKrediHesaplamaDetayVerisi = async () => {
    try {
      const result = await deleteKrediHesaplamaDetayVerisi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        pathKrediId || 0
      );
      if (result) {
        await fetchData();
        enqueueSnackbar("Kaydedildi", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
            maxWidth: "720px",
          },
        });
      } else {
        enqueueSnackbar("Kaydedilemedi", {
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

  const fetchDataKredi = async () => {
    setEndRow(-1);
    try {
      const krediHesaplama =
        await getKrediHesaplamaVerileriByDenetciDenetlenenYilId(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          pathKrediId || 0
        );
      if (krediHesaplama != undefined) {
        setAlinanKrediTutar(krediHesaplama.alinanKrediTutar);
        setTur(krediHesaplama.tur);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    setEndRow(-1);
    try {
      const krediHesaplamaDetayVerileri =
        await getKrediHesaplamaDetayVerileriByDenetciDenetlenenYil(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          pathKrediId || 0
        );

      const rowsAll: any = [];
      let kaydedilmeTarihi: Date | null = null;
      let kaydedilmeTarihiFormatted: string | null = null;

      krediHesaplamaDetayVerileri.forEach((veri: any) => {
        const veriTarih = new Date(veri.sonKaydedilmeTarihi);
        if (veriTarih && !isNaN(veriTarih.getTime())) {
          if (!kaydedilmeTarihi || veriTarih > kaydedilmeTarihi) {
            kaydedilmeTarihi = veriTarih;
            kaydedilmeTarihiFormatted = veriTarih.toLocaleString("tr-TR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }

        const newRow: any = [
          veri.taksitTarihi !== null && veri.taksitTarihi !== undefined
            ? veri.taksitTarihi.split("T")[0].split("-").reverse().join(".")
            : null,
          tur == "Taksitli Kredi" ? veri.taksitTutari : veri.anaPara,
          veri.faizTutari,
          veri.fonVergi,
          tur == "Taksitli Kredi" ? veri.anaPara : veri.taksitTutari,
        ];
        rowsAll.push(newRow);
      });
      setFetchedData(rowsAll);
      setDuplicatesControl(true);

      if (kaydedilmeTarihiFormatted) {
        setSonKaydedilmeTarihi(kaydedilmeTarihiFormatted);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchRowCount = async () => {
    try {
      if (tur == "Taksitli Kredi") {
        const format = await getFormat(user.token || "", "Kredi Hesaplama");
        setRowCount(format.satirSayisi);
      } else {
        setRowCount(1);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDataKredi();
  }, []);

  useEffect(() => {
    fetchData();
    fetchRowCount();
  }, [tur]);

  useEffect(() => {
    if (kaydetTiklandimi) {
      handleCreateKrediHesaplamaDetayVerisi();
      setKaydetTiklandimi(false);
    }
  }, [kaydetTiklandimi]);

  const handleDownload = () => {
    const hotTableInstance = hotTableComponent.current.hotInstance;
    const data = hotTableInstance.getData();

    const processedData = data.map((row: any) => row);

    const headers = hotTableInstance.getColHeader();

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
        saveAs(blob, "KrediHesaplamaDetayFormati.xlsx");
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
      <WarnBox warn={uyari} />
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
        colWidths={[100, 100, 100, 100, 100, 100]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={12}
        filters={true}
        columnSorting={true}
        dropdownMenu={[
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar",
        ]}
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        afterRenderer={afterRenderer}
        afterPaste={afterPaste} // Add afterPaste hook
        afterChange={handleAfterChange} // Add afterChange hook
        beforeChange={handleBeforeChange} // Add beforeChange hook
        afterCreateRow={handleCreateRow} // Add createRow hook
        afterRemoveRow={handleAfterRemoveRow} // Add afterRemoveRow hook
        contextMenu={
          tur === "Taksitli Kredi"
            ? {
                items: [
                  "row_above",
                  "row_below",
                  "remove_row",
                  "alignment",
                  "copy",
                ],
              }
            : {
                items: ["alignment", "copy"],
              }
        }
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
      </Grid>
    </>
  );
};

export default KrediDetayVeriYukleme;
