import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, Paper, Typography, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  createKidemTazminatiBobiVerisi,
  deleteKidemTazminatiBobiVerisi,
  getKidemTazminatiBobiVerileriByDenetciDenetlenenYil,
} from "@/api/Veri/KidemTazminatiBobi";
import { getFormat } from "@/api/Veri/base";
import { enqueueSnackbar } from "notistack";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";

// register Handsontable's modules
registerAllModules();

interface Veri {
  tcKimlikNo: number;
  adiSoyadi: string;
  cinsiyeti: string;
  dogumTarihi: string;
  gorevDepartmani: string;
  brutUcretiAylik: number;
  isletmeyeGirisTarihi: string;
  isletmedenCikisTarihi: string;
  odenenBrutKidemTazminatiBobiTutariTL: number;
  sgkIstenAyrilisNedeniKodu: string;
  kullanilmamisIzinGunu: number;
  kullanilmamisIzneEsasBrutUcretAylik: number;
}

interface Props {
  kaydetTiklandimi: boolean;
  setKaydetTiklandimi: (b: boolean) => void;
}

const KidemTazminatiBobiVeriYukleme: React.FC<Props> = ({
  kaydetTiklandimi,
  setKaydetTiklandimi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState<number>(200);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const [duplicatesControl, setDuplicatesControl] = useState(false);

  const uyari = [
    "Boş Bırakılmaması Gereken Sütunlar: Adı Soyadı, Görev Departmanı, Brüt Ücreti (Aylık), İşletmeye Giriş Tarihi",
    "TC Kimlik No Sütunu Boş Bırakılabilir.",
    "Adı Soyadı Sütunu Boş Bırakılmamalıdır.",
    "Cinsiyeti Ve Sgk İşten Ayrılış Nedeni Kodu Sütunlarında Seçeneklerden Biri Seçilmelidir Veya Boş Bırakılabilir.",
    "Doğum Tarihi Ve İşletmeden Çıkış Tarihi Sütunlarına GG.AA.YYYY Formatında Tarih Girilmelidir Veya Boş Bırakılabilir.",
    "Görev Departmanı Sütununda Boş Bırakılmamalıdır Ve Seçeneklerden Biri Seçilmelidir Veya Boş Bırakılabilir.",
    "Brüt Ücreti (Aylık) Sütunu Sütunu Boş Bırakılmamalıdır Ve Ondalıklı Sayı 1000 Ayıracı Kullanılmadan Girilmelidir.",
    "İşletmeye Giriş Tarihi Sütunu Boş Bırakılmamalıdır Ve GG.AA.YYYY Formatında Tarih Girilmelidir.",
    "Ödenen Brüt Kıdem Tazminatı Tutarı (TL), Kullanılmamış İzin Günü Ve Kullanılmamış İzne Esas Brüt Ücret (Aylık) Sütunlarına Ondalıklı Sayı 1000 Ayıracı Kullanılmadan Girilmelidir Veya Boş Bırakılabilir.",
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

  const textValidator = (value: string, callback: (value: boolean) => void) => {
    if (!value || value.trim() === "") {
      // Eğer değer boşsa geçersiz kabul et
      callback(false);
    } else {
      callback(true);
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

  const dateValidatorAllowNull = (
    value: string,
    callback: (isValid: boolean) => void
  ) => {
    // Tarih formatı düzenli ifadesi (dd.mm.yyyy)
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!value || value.trim() === "") {
      // Eğer değer boşsa geçerli kabul et
      callback(true);
    } else if (dateRegex.test(value)) {
      const [, day, month, year] = value.match(dateRegex)!;

      const date = new Date(`${year}-${month}-${day}`);
      const isValidDate =
        date.getFullYear() === Number(year) &&
        date.getMonth() + 1 === Number(month) &&
        date.getDate() === Number(day);

      callback(isValidDate);
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

  const colHeaders = [
    "TC Kimlik No",
    "Adı Soyadı",
    "Cinsiyeti",
    "Doğum Tarihi",
    "Görev Departmanı",
    "Brüt Ücreti (Aylık)",
    "İşletmeye Giriş Tarihi",
    "İşletmeden Çıkış Tarihi",
    "Ödenen Brüt Kıdem Tazminatı Tutarı (TL)",
    "Sgk İşten Ayrılış Nedeni Kodu",
    "Kullanılmamış İzin Günü",
    "Kullanılmamış İzne Esas Brüt Ücret (Aylık)",
  ];

  const columns = [
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
    }, // TC Kimlik No
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      validator: textValidator,
      allowInvalid: false,
    }, // Adı Soyadı
    {
      type: "dropdown",
      source: ["", "Kadın", "Erkek"],
      className: "htLeft",
      allowInvalid: false,
    }, // Cinsiyeti
    {
      type: "date",
      dateFormat: "DD.MM.YYYY",
      columnSorting: true,
      className: "htRight",
      validator: dateValidator,
      allowInvalid: false,
    }, // Doğum Tarihi
    {
      type: "dropdown",
      source: ["Üretim", "Hizmet", "Ar-Ge", "Pazarlama", "Genel Yönetim"],
      className: "htLeft",
      allowInvalid: false,
    }, // Görev Departmanı
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      validator: numberValidator,
      allowInvalid: false,
    }, // Brüt Ücreti (Aylık)
    {
      type: "date",
      dateFormat: "DD.MM.YYYY",
      columnSorting: true,
      className: "htRight",
      validator: dateValidator,
      allowInvalid: false,
    }, // İşletmeye Giriş Tarihi
    {
      type: "date",
      dateFormat: "DD.MM.YYYY",
      columnSorting: true,
      className: "htRight",
      validator: dateValidatorAllowNull,
      allowInvalid: false,
    }, // İşletmeden Cıkış Tarihi
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      validator: numberValidatorAllowNull,
      allowInvalid: false,
    }, // Ödenen Brüt Kıdem Tazminatı Tutarı (TL)
    {
      type: "dropdown",
      source: [
        "",
        "1-Deneme süreli iş sözleşmesinin işverence feshi",
        "2-Deneme süreli iş sözleşmesinin işçi tarafından feshi",
        "3-Belirsiz süreli iş sözleşmesinin işçi tarafından feshi (istifa)",
        "4-Belirsiz süreli iş sözleşmesinin işveren tarafından haklı sebep bildirilmeden feshi",
        "5-Belirli süreli iş sözleşmesinin sona ermesi",
        "8-Emeklilik (yaşlılık) veya toptan ödeme nedeniyle",
        "9-Malulen emeklilik nedeniyle",
        "10-Ölüm",
        "11-İş kazası sonucu ölüm",
        "12-Askerlik",
        "13-Kadın işçinin evlenmesi",
        "14-Emeklilik için yaş dışında diğer şartların tamamlanması",
        "15-Toplu işçi çıkarma",
        "16-Sözleşme sona ermeden sigortalının aynı işverene ait diğer işyerine nakli",
        "17-İşyerinin kapanması",
        "18-İşin sona ermesi",
        "19-Mevsim bitimi (İş akdinin askıya alınması halinde kullanılır. Tekrar başlatılmayacaksa '4' nolu  kod kullanılır)",
        "20-Kampanya bitimi (İş akdinin askıya alınması halinde kullanılır. Tekrar başlatılmayacaksa '4' nolu  kod kullanılır)",
        "21-Statü değişikliği",
        "22-Diğer nedenler",
        "23-İşçi tarafından zorunlu nedenle fesih",
        "24-İşçi tarafından sağlık nedeniyle fesih",
        "25-İşçi tarafından işverenin ahlak ve iyi niyet kurallarına aykırı davranışı nedeni ile fesih",
        "26-Disiplin kurulu kararı ile fesih",
        "27-İşveren tarafından zorunlu nedenlerle ve tutukluluk nedeniyle fesih",
        "28-İşveren tarafından sağlık nedeni ile fesih",
        "29-İşveren tarafından işçinin ahlak ve iyi niyet kurallarına aykırı davranışı nedeni ile fesih",
        "30-Vize süresinin bitimi ( İş akdinin askıya alınması halinde kullanılır.  Tekrar başlatılmayacaksa '4' nolu  kod kullanılır)",
        "31-Borçlar Kanunu, Sendikalar Kanunu, Grev ve Lokavt Kanunu kapsamında kendi istek ve kusuru dışında fesih",
        "32-4046 sayılı Kanunun 21. maddesine göre özelleştirme nedeni ile fesih",
        "33-Gazeteci tarafından sözleşmenin feshi",
        "34-İşyerinin devri, işin veya işyerinin niteliğinin değişmesi nedeniyle fesih",
        "36-KHK ile işyerinin kapatılması",
        "37-KHK ile kamu görevinden çıkarma ",
        "38-Doğum nedeniyle ayrılma",
        "39-696 KHK ile kamu işçiliğine geçiş",
        "40-696 KHK ile kamu işçiliğine geçilmemesi sebebiyle çıkış",
        "41-Re’sen işten ayrılış bildirgesi düzenlenenler",
      ],
      className: "htLeft",
    }, // Sgk İşten Ayrılış Nedeni Kodu
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      validator: numberValidatorAllowNull,
      allowInvalid: false,
    }, // Kullanılmamış İzin Günü
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      validator: numberValidatorAllowNull,
      allowInvalid: false,
    }, // Kullanılmamış İzne Esas Brüt Ücret (Aylık)
  ];

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
      }
    }
  };

  const handleCreateKidemTazminatiBobiVerisi = async () => {
    if (fetchedData.filter((item: any) => item[1]).length == 0) {
      await handleDeleteKidemTazminatiBobiVerisi();
      return;
    }
    const keys = [
      "denetciId",
      "denetlenenId",
      "yil",
      "tcKimlikNo",
      "adiSoyadi",
      "cinsiyeti",
      "dogumTarihi",
      "gorevDepartmani",
      "brutUcretiAylik",
      "isletmeyeGirisTarihi",
      "isletmedenCikisTarihi",
      "odenenBrutKidemTazminatiBobiTutariTL",
      "sgkIstenAyrilisNedeniKodu",
      "kullanilmamisIzinGunu",
      "kullanilmamisIzneEsasBrutUcretAylik",
    ];

    const jsonData = fetchedData
      .filter((item: any) => item[1])
      .map((item: any) => {
        let obj: { [key: string]: any } = {};
        keys.forEach((key, index) => {
          if (key === "denetciId") {
            obj[key] = user.denetciId;
          } else if (key === "denetlenenId") {
            obj[key] = user.denetlenenId;
          } else if (key === "yil") {
            obj[key] = user.yil;
          } else if (
            key === "dogumTarihi" ||
            key === "isletmeyeGirisTarihi" ||
            key === "isletmedenCikisTarihi"
          ) {
            if (
              item[index - 3] == undefined ||
              item[index - 3] == null ||
              item[index - 3] == ""
            ) {
              obj[key] = null;
            } else {
              const rawValue = item[index - 3];
              const [day, month, year] = rawValue.split(".");
              obj[key] = new Date(
                `${year}-${month}-${day}T00:00:00Z`
              ).toISOString();
            }
          } else if (
            key === "odenenBrutKidemTazminatiBobiTutariTL" ||
            key === "kullanilmamisIzinGunu" ||
            key === "kullanilmamisIzneEsasBrutUcretAylik"
          ) {
            if (
              item[index - 3] == undefined ||
              item[index - 3] == null ||
              item[index - 3] == ""
            ) {
              obj[key] = 0.0;
            } else {
              obj[key] = item[index - 3];
            }
          } else if (
            key === "tcKimlikNo" ||
            key === "cinsiyeti" ||
            key === "sgkIstenAyrilisNedeniKodu"
          ) {
            if (
              item[index - 3] == undefined ||
              item[index - 3] == null ||
              item[index - 3] == ""
            ) {
              obj[key] = "";
            } else {
              obj[key] = item[index - 3];
            }
          } else {
            if (
              item[index - 3] == undefined ||
              item[index - 3] == null ||
              item[index - 3] == ""
            ) {
              obj[key] = null;
            } else {
              obj[key] = item[index - 3];
            }
          }
        });
        return obj;
      });

    try {
      const result = await createKidemTazminatiBobiVerisi(
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

  const handleDeleteKidemTazminatiBobiVerisi = async () => {
    try {
      const result = await deleteKidemTazminatiBobiVerisi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
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

  const fetchData = async () => {
    setEndRow(-1);
    try {
      const kidemTazminatiBobiVerileri =
        await getKidemTazminatiBobiVerileriByDenetciDenetlenenYil(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );
      const rowsAll: any = [];

      kidemTazminatiBobiVerileri.forEach((veri: any) => {
        const newRow: any = [
          veri.tcKimlikNo,
          veri.adiSoyadi,
          veri.cinsiyeti,
          veri.dogumTarihi !== null && veri.dogumTarihi !== undefined
            ? veri.dogumTarihi.split("T")[0].split("-").reverse().join(".") !=
              "01.01.0001"
              ? veri.dogumTarihi.split("T")[0].split("-").reverse().join(".")
              : null
            : null,
          veri.gorevDepartmani,
          veri.brutUcretiAylik,
          veri.isletmeyeGirisTarihi !== null &&
          veri.isletmeyeGirisTarihi !== undefined
            ? veri.isletmeyeGirisTarihi
                .split("T")[0]
                .split("-")
                .reverse()
                .join(".")
            : null,
          veri.isletmedenCikisTarihi != null &&
          veri.isletmedenCikisTarihi != undefined
            ? veri.isletmedenCikisTarihi
                .split("T")[0]
                .split("-")
                .reverse()
                .join(".") != "01.01.0001"
              ? veri.isletmedenCikisTarihi
                  .split("T")[0]
                  .split("-")
                  .reverse()
                  .join(".")
              : null
            : null,
          veri.odenenBrutKidemTazminatiBobiTutariTL,
          veri.sgkIstenAyrilisNedeniKodu,
          veri.kullanilmamisIzinGunu,
          veri.kullanilmamisIzneEsasBrutUcretAylik,
        ];
        rowsAll.push(newRow);
      });
      setFetchedData(rowsAll);
      setDuplicatesControl(true);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchRowCount = async () => {
    try {
      const format = await getFormat(
        user.token || "",
        "Kıdem Tazminatı (Bobi)"
      );
      setRowCount(format.satirSayisi);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchRowCount();
  }, []);

  useEffect(() => {
    if (kaydetTiklandimi) {
      handleCreateKidemTazminatiBobiVerisi();
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
        saveAs(blob, "KidemTazminatiBobiFormati.xlsx");
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
      <Grid container>
        <Grid item xs={12} lg={12}>
          <Paper
            elevation={2}
            sx={{
              p: 1,
              mb: 2,
              borderRadius: 1,
              backgroundColor: "warning.light",
            }}
          >
            {uyari.map((mesaj, index) => (
              <Typography
                key={index}
                variant="body1"
                sx={{ color: "warning.dark" }}
              >
                - {mesaj}
              </Typography>
            ))}
          </Paper>
        </Grid>
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
        colWidths={[80, 110, 80, 90, 100, 100, 90, 90, 110, 130, 80, 90]}
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
        afterCreateRow={handleCreateRow} // Add createRow hook
        afterRemoveRow={handleAfterRemoveRow} // Add afterRemoveRow hook
        contextMenu={[
          "row_above",
          "row_below",
          "remove_row",
          "alignment",
          "copy",
        ]}
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

export default KidemTazminatiBobiVeriYukleme;
