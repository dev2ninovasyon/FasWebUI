import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  createKidemTazminatiTfrsVerisi,
  createMultipleKidemTazminatiTfrsVerisi,
  createNullKidemTazminatiTfrsVerisi,
  deleteKidemTazminatiTfrsVerisi,
  getKidemTazminatiTfrsVerileriByDenetciDenetlenenYil,
  updateKidemTazminatiTfrsVerisi,
  updateMultipleKidemTazminatiTfrsVerisi,
} from "@/api/Veri/KidemTazminatiTfrs";
import { getFormat } from "@/api/Veri/base";
import { enqueueSnackbar } from "notistack";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";

// register Handsontable's modules
registerAllModules();

interface Veri {
  siraNo: number;
  adiSoyadi: string;
  cinsiyeti: string;
  calistigiDepartman: string;
  kidemTazminatinaEsasUcret: number;
  dogumTarihi: string;
  iseGirisTarihi: string;
  sigortaIlkGirisTarihi: string;
  varsaPrimOdenmemisGunSayisi: number;
  kullanilmamisIzinGunu: number;
  kullanilmamisIzneEsasBrutUcret: number;
}

const KidemTazminatiTfrsVeriYukleme = () => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState<number>(200);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);
  const [multiplePasteData, setMultiplePasteData] = useState<any>([]);

  const [afterPasteCompleted, setAfterPasteCompleted] = useState(false);
  const [halfPasteControl, setHalfPasteControl] = useState<boolean>(false);

  const [duplicatesControl, setDuplicatesControl] = useState(false);

  const [startRow, setStartRow] = useState(0);
  const [endRow, setEndRow] = useState(0);
  const [startCol, setStartCol] = useState(0);
  const [endCol, setEndCol] = useState(0);

  const [control, setControl] = useState(false);

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
    setTimeout(() => {
      if (numberRegex.test(value)) {
        callback(true);
      } else {
        enqueueSnackbar("Hatalı Sayı Girişi. Ondalıklı Sayı Girmelisiniz.", {
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
    }, 1000);
  };

  const dateValidator = (
    value: string,
    callback: (isValid: boolean) => void
  ) => {
    // Tarih formatı düzenli ifadesi (dd.mm.yyyy)
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;

    setTimeout(() => {
      if (dateRegex.test(value)) {
        const [, day, month, year] = value.match(dateRegex)!;

        const date = new Date(`${year}-${month}-${day}`);
        const isValidDate =
          date.getFullYear() === Number(year) &&
          date.getMonth() + 1 === Number(month) &&
          date.getDate() === Number(day);

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
    }, 1000);
  };

  function findDuplicateRows(data: any): Veri[] {
    const rowsAsString = new Set<string>();
    const duplicateRows: Veri[] = [];

    const keys = Object.keys(data);

    const [firstKey, ...restKeys] = keys;

    for (const row of data) {
      const { [firstKey]: _, ...rowWithoutSiraNo } = row;

      const rowString = JSON.stringify(
        rowWithoutSiraNo,
        Object.keys(rowWithoutSiraNo).sort()
      );

      if (!rowString.includes("null") && !rowString.includes("{}")) {
        if (rowsAsString.has(rowString)) {
          duplicateRows.push(row);
        } else {
          rowsAsString.add(rowString);
        }
      }
    }
    return duplicateRows;
  }

  useEffect(() => {
    if (duplicatesControl) {
      const duplicatesList = findDuplicateRows(fetchedData);

      let duplicatesMessage = "";
      if (duplicatesList != undefined && duplicatesList != null) {
        duplicatesList.forEach((item: any) => {
          if (item[0] != undefined && item[0] != null) {
            duplicatesMessage = duplicatesMessage + " " + item[0] + ". ";
          }
        });
        if (duplicatesMessage != "") {
          if (duplicatesList.length > 1) {
            enqueueSnackbar(
              duplicatesMessage +
                "Satırlar Tekrar Eden Veri İçeriyor. Kontol Edin.",
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
          } else {
            enqueueSnackbar(
              duplicatesMessage +
                "Satır Tekrar Eden Veri İçeriyor. Kontol Edin.",
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
      }
      setDuplicatesControl(false);
    }
  }, [duplicatesControl]);

  const colHeaders = [
    "SiraNo",
    "Adı Soyadı",
    "Cinsiyeti",
    "Çalıştığı Departman",
    "Kıdem Tazminatına Esas Ücret",
    "Doğum Tarihi",
    "İşe Giriş Tarihi",
    "Sigorta İlk Giriş Tarihi",
    "(Varsa) Prim Ödenmemiş Gün Sayısı",
    "Kullanılmamış İzin Günü",
    "Kullanılmamış İzne Esas Brüt Ücret",
  ];

  const columns = [
    { type: "numeric", columnSorting: true, readOnly: true, editor: false }, // SiraNo
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
    }, // Adı Soyadı
    {
      type: "dropdown",
      source: ["Kadın", "Erkek"],
      className: "htLeft",
      allowInvalid: false,
    }, // Cinsiyeti
    {
      type: "dropdown",
      source: ["Üretim", "Hizmet", "Ar-Ge", "Pazarlama", "Genel Yönetim"],
      className: "htLeft",
      allowInvalid: false,
    }, // Çalıştığı Departman
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      validator: numberValidator,
      allowInvalid: false,
    }, // Kıdem Tazminatına Esas Ücret
    {
      type: "date",
      dateFormat: "DD.MM.YYYY",
      columnSorting: true,
      className: "htRight",
      validator: dateValidator,
      allowInvalid: false,
    }, // Doğum Tarihi
    {
      type: "date",
      dateFormat: "DD.MM.YYYY",
      columnSorting: true,
      className: "htRight",
      validator: dateValidator,
      allowInvalid: false,
    }, // İşe Giriş Tarihi
    {
      type: "date",
      dateFormat: "DD.MM.YYYY",
      columnSorting: true,
      className: "htRight",
      validator: dateValidator,
      allowInvalid: false,
    }, // Sigorta İlk Giriş Tarihi
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htLeft",
      validator: numberValidator,
      allowInvalid: false,
    }, // (Varsa) Prim Ödenmemiş Gün Sayısı
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htLeft",
      validator: numberValidator,
      allowInvalid: false,
    }, // Kullanılmamış İzin Günü
    {
      type: "numeric",
      numericFormat: { pattern: "0,0.00", columnSorting: true },
      className: "htRight",
      validator: numberValidator,
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

    if (
      row >= startRow &&
      row <= endRow &&
      col >= startCol &&
      col <= endCol &&
      value == null
    ) {
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
      setStartRow(0);
      setEndRow(0);
      setStartCol(0);
      setEndCol(0);
      console.log(
        `Yeni satır(lar) eklendi: ${amount} adet satır ${index} indexinden itibaren.`
      );
      setControl(true);
      await handleUpdateMultipleKidemTazminatiTfrsVerisi(index);
      await handleCreateNullKidemTazminatiTfrsVerisi(index);
    }
  };

  const handleAfterRemoveRow = async (
    index: number,
    amount: number,
    physicalRows: number[],
    source: any
  ) => {
    setStartRow(0);
    setEndRow(0);
    setStartCol(0);
    setEndCol(0);
    console.log(
      `Satır(lar) silindi: ${amount} adet satır ${index} indexinden itibaren.${physicalRows}`
    );
    const siraNos = physicalRows.map((row) => row + 1);
    handleDeleteKidemTazminatiTfrsVerisi(siraNos);
  };

  const afterPaste = async (data: any, coords: any) => {
    console.log("Pasted data:", data);

    console.log("Pasted startRow coordinates:", coords[0].startRow);
    console.log("Pasted endRow coordinates:", coords[0].endRow);
    console.log("Pasted startCol coordinates:", coords[0].startCol);
    console.log("Pasted endCol coordinates:", coords[0].endCol);
    setStartRow(coords[0].startRow);
    setEndRow(coords[0].endRow);
    setStartCol(coords[0].startCol);
    setEndCol(coords[0].endCol);

    if (halfPasteControl == false) {
      let j = 0;
      for (
        let i = coords[0].startRow;
        i < data.length + coords[0].startRow;
        i++
      ) {
        data[j].unshift(i + 1);
        if (data[j][5] != "" && data[j][5] != null && data[j][5] != 0) {
          const dateParts = data[j][5].split(".");
          if (dateParts.length === 3) {
            const [day, month, year] = dateParts;
            const formattedDate = `${year}-${month}-${day}`;
            data[j][5] = new Date(formattedDate).toISOString();
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
          }
        } else if (data[j][6] != "" && data[j][6] != null && data[j][6] != 0) {
          const dateParts = data[j][6].split(".");
          if (dateParts.length === 3) {
            const [day, month, year] = dateParts;
            const formattedDate = `${year}-${month}-${day}`;
            data[j][6] = new Date(formattedDate).toISOString();
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
          }
        } else if (data[j][7] != "" && data[j][7] != null && data[j][7] != 0) {
          const dateParts = data[j][7].split(".");
          if (dateParts.length === 3) {
            const [day, month, year] = dateParts;
            const formattedDate = `${year}-${month}-${day}`;
            data[j][7] = new Date(formattedDate).toISOString();
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
          }
        }
        j++;
      }
      setMultiplePasteData(data);
    }
  };

  const handleAfterChange = async (changes: any, source: any) => {
    //Değişen Cellin Satır Indexi
    let changedRow = -1;
    //Değişen Cellerin Satır Indexleri (Distinct)
    let changedRows: any = [];
    //Değişen Cellin Satır Verileri
    let changedRowData: any;
    if (source === "loadData") {
      return; // Skip this hook on loadData
    }
    if (changes) {
      for (const [row, prop, oldValue, newValue] of changes) {
        console.log(
          `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
        );
        changedRow = row;

        if (changedRows.length == 0) {
          changedRows.push(row);
        }
        if (changedRows[changedRows.length - 1] != row) {
          changedRows.push(row);
        }

        changedRowData = await handleGetRowData(row);

        //Cell Güncelleme
        if (
          changedRow >= 0 &&
          changedRowData[0] != null &&
          changedRowData[1] != null &&
          changedRowData[2] != null &&
          changedRowData[3] != null &&
          changedRowData[4] != null &&
          changedRowData[5] != null &&
          changedRowData[6] != null &&
          changedRowData[7] != null &&
          changedRowData[8] != null &&
          changedRowData[9] != null &&
          changedRowData[10] != null
        ) {
          await handleUpdateKidemTazminatiTfrsVerisi(changedRow);

          changedRow = -1;
          changedRows = [];
        }
      }
    }
    //Tek satır Yaratma
    if (
      changedRow >= 0 &&
      changedRows.length < 2 &&
      changedRowData[0] == null &&
      changedRowData[1] != null &&
      changedRowData[2] != null &&
      changedRowData[3] != null &&
      changedRowData[4] != null &&
      changedRowData[5] != null &&
      changedRowData[6] != null &&
      changedRowData[7] != null &&
      changedRowData[8] != null &&
      changedRowData[9] != null &&
      changedRowData[10] != null
    ) {
      await handleCreateKidemTazminatiTfrsVerisi(changedRow);
      changedRow = -1;
      changedRows = [];
    }
    //Çok Satır Yaratma
    if (
      changedRow >= 0 &&
      changedRows.length >= 2 &&
      changedRowData[0] == null &&
      changedRowData[1] != null &&
      changedRowData[2] != null &&
      changedRowData[3] != null &&
      changedRowData[4] != null &&
      changedRowData[5] != null &&
      changedRowData[6] != null &&
      changedRowData[7] != null &&
      changedRowData[8] != null &&
      changedRowData[9] != null &&
      changedRowData[10] != null
    ) {
      //Düzgün Çok Satır Yaratma
      if (halfPasteControl == false) {
        setAfterPasteCompleted(true);
        changedRow = -1;
        changedRows = [];
      }
      //Yarım Yarım Çok satır Yaratma
      else {
        for (const x of changedRows) {
          if (
            changedRow >= 0 &&
            changedRows.length >= 2 &&
            changedRowData[0] == null &&
            changedRowData[1] != null &&
            changedRowData[2] != null &&
            changedRowData[3] != null &&
            changedRowData[4] != null &&
            changedRowData[5] != null &&
            changedRowData[6] != null &&
            changedRowData[7] != null &&
            changedRowData[8] != null &&
            changedRowData[9] != null &&
            changedRowData[10] != null
          ) {
            await handleCreateKidemTazminatiTfrsVerisi(x);
          }
        }
        setHalfPasteControl(false);
        changedRow = -1;
        changedRows = [];
      }
    }
    //Yarım Yarım Çok satır Kontrol
    if (
      changedRow >= 0 &&
      changedRows.length >= 2 &&
      changedRowData[0] == null &&
      (changedRowData[1] == null ||
        changedRowData[2] == null ||
        changedRowData[3] == null ||
        changedRowData[4] == null ||
        changedRowData[5] == null ||
        changedRowData[6] == null ||
        changedRowData[7] == null ||
        changedRowData[8] == null ||
        changedRowData[9] == null ||
        changedRowData[10] == null)
    ) {
      setHalfPasteControl(true);
    }
  };

  const handleCreateKidemTazminatiTfrsVerisi = async (row: number) => {
    const rowData = await handleGetRowData(row);

    const createdKidemTazminatiTfrsVerisi = {
      denetciId: user.denetciId,
      denetlenenId: user.denetlenenId,
      yil: user.yil,
      siraNo: row + 1,
      adiSoyadi: rowData[1],
      cinsiyeti: rowData[2],
      calistigiDepartman: rowData[3],
      kidemTazminatinaEsasUcret: rowData[4],
      dogumTarihi: new Date(
        rowData[5].split(".").reverse().join("-")
      ).toISOString(),
      iseGirisTarihi: new Date(
        rowData[6].split(".").reverse().join("-")
      ).toISOString(),
      sigortaIlkGirisTarihi: new Date(
        rowData[7].split(".").reverse().join("-")
      ).toISOString(),
      varsaPrimOdenmemisGunSayisi: rowData[8],
      kullanilmamisIzinGunu: rowData[9],
      kullanilmamisIzneEsasBrutUcret: rowData[10],
    };

    try {
      const result = await createKidemTazminatiTfrsVerisi(
        user.token || "",
        createdKidemTazminatiTfrsVerisi
      );
      if (result) {
        if (halfPasteControl == false) {
          await fetchData();
        }
        console.log("Kıdem Tazminati Tfrs Verisi ekleme başarılı");
      } else {
        console.error("Kıdem Tazminati Tfrs Verisi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCreateMultipleKidemTazminatiTfrsVerisi = async () => {
    const keys = [
      "denetciId",
      "denetlenenId",
      "yil",
      "siraNo",
      "adiSoyadi",
      "cinsiyeti",
      "calistigiDepartman",
      "kidemTazminatinaEsasUcret",
      "dogumTarihi",
      "iseGirisTarihi",
      "sigortaIlkGirisTarihi",
      "varsaPrimOdenmemisGunSayisi",
      "kullanilmamisIzinGunu",
      "kullanilmamisIzneEsasBrutUcret",
    ];

    const jsonData =
      multiplePasteData.length === 1
        ? keys.reduce(
            (acc: { [key: string]: any }, key: string, index: number) => {
              if (key === "denetciId") {
                acc[key] = user.denetciId;
              } else if (key === "denetlenenId") {
                acc[key] = user.denetlenenId;
              } else if (key === "yil") {
                acc[key] = user.yil;
              } else if (
                key === "kidemTazminatinaEsasUcret" ||
                key === "varsaPrimOdenmemisGunSayisi" ||
                key === "kullanilmamisIzinGunu" ||
                key === "kullanilmamisIzneEsasBrutUcret"
              ) {
                acc[key] = parseFloat(
                  multiplePasteData[0][index - 3].replace(",", ".")
                );
              } else {
                acc[key] = multiplePasteData[0][index - 3];
              }
              return acc;
            },
            {}
          )
        : multiplePasteData.map((item: any[]) => {
            let obj: { [key: string]: any } = {};
            keys.forEach((key, index) => {
              if (key === "denetciId") {
                obj[key] = user.denetciId;
              } else if (key === "denetlenenId") {
                obj[key] = user.denetlenenId;
              } else if (key === "yil") {
                obj[key] = user.yil;
              } else if (
                key === "kidemTazminatinaEsasUcret" ||
                key === "varsaPrimOdenmemisGunSayisi" ||
                key === "kullanilmamisIzinGunu" ||
                key === "kullanilmamisIzneEsasBrutUcret"
              ) {
                obj[key] = parseFloat(item[index - 3].replace(",", "."));
              } else {
                obj[key] = item[index - 3];
              }
            });
            return obj;
          });

    try {
      const result = await createMultipleKidemTazminatiTfrsVerisi(
        user.token || "",
        jsonData
      );
      if (result) {
        if (halfPasteControl == false) {
          await fetchData();
        }
        console.log("Kıdem Tazminati Tfrs Verisi ekleme başarılı");
      } else {
        console.error("Kıdem Tazminati Tfrs Verisi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCreateNullKidemTazminatiTfrsVerisi = async (siraNo: number) => {
    try {
      const result = await createNullKidemTazminatiTfrsVerisi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        siraNo + 1 || 0
      );
      if (result) {
        if (halfPasteControl == false && control == false) {
          await fetchData();
        }
        console.log("Kıdem Tazminati Tfrs Verisi ekleme başarılı");
      } else {
        console.error("Kıdem Tazminati Tfrs Verisi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleUpdateKidemTazminatiTfrsVerisi = async (row: number) => {
    const rowData = await handleGetRowData(row);

    const updatedKidemTazminatiTfrsVerisi = {
      adiSoyadi: rowData[1],
      cinsiyeti: rowData[2],
      calistigiDepartman: rowData[3],
      kidemTazminatinaEsasUcret: rowData[4],
      dogumTarihi: new Date(
        rowData[5].split(".").reverse().join("-")
      ).toISOString(),
      iseGirisTarihi: new Date(
        rowData[6].split(".").reverse().join("-")
      ).toISOString(),
      sigortaIlkGirisTarihi: new Date(
        rowData[7].split(".").reverse().join("-")
      ).toISOString(),
      varsaPrimOdenmemisGunSayisi: rowData[8],
      kullanilmamisIzinGunu: rowData[9],
      kullanilmamisIzneEsasBrutUcretAylik: rowData[10],
    };
    try {
      const result = await updateKidemTazminatiTfrsVerisi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        row + 1,
        updatedKidemTazminatiTfrsVerisi
      );
      if (result) {
        console.log("Kıdem Tazminati Tfrs Verisi güncelleme başarılı");
      } else {
        console.error("Kıdem Tazminati Tfrs Verisi güncelleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleUpdateMultipleKidemTazminatiTfrsVerisi = async (
    siraNo: number
  ) => {
    try {
      const result = await updateMultipleKidemTazminatiTfrsVerisi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        siraNo || 0
      );
      if (result) {
        console.log("Kıdem Tazminati Tfrs Verisi güncelleme başarılı");
      } else {
        console.error("Kıdem Tazminati Tfrs Verisi güncelleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleDeleteKidemTazminatiTfrsVerisi = async (siraNo: number[]) => {
    try {
      const result = await deleteKidemTazminatiTfrsVerisi(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        siraNo
      );
      if (result) {
        if (halfPasteControl == false && control == false) {
          await fetchData();
        }
        console.log("Kıdem Tazminati Tfrs Verisi silme başarılı");
      } else {
        console.error("Kıdem Tazminati Tfrs Verisi silme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const KidemTazminatiTfrsVerileri =
        await getKidemTazminatiTfrsVerileriByDenetciDenetlenenYil(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );
      const rowsAll: any = [];

      KidemTazminatiTfrsVerileri.forEach((veri: any) => {
        if (
          veri.dogumTarihi !== null &&
          veri.dogumTarihi !== undefined &&
          veri.iseGirisTarihi !== null &&
          veri.iseGirisTarihi !== undefined &&
          veri.sigortaIlkGirisTarihi !== null &&
          veri.sigortaIlkGirisTarihi !== undefined
        ) {
          const newRow: any = [
            veri.siraNo,
            veri.adiSoyadi,
            veri.cinsiyeti,
            veri.calistigiDepartman,
            veri.kidemTazminatinaEsasUcret,
            veri.dogumTarihi.split("T")[0].split("-").reverse().join("."),
            veri.iseGirisTarihi.split("T")[0].split("-").reverse().join("."),
            veri.sigortaIlkGirisTarihi
              .split("T")[0]
              .split("-")
              .reverse()
              .join("."),
            veri.varsaPrimOdenmemisGunSayisi,
            veri.kullanilmamisIzinGunu,
            veri.kullanilmamisIzneEsasBrutUcret,
          ];
          rowsAll.push(newRow);
        } else {
          const newRow: any = [
            veri.siraNo,
            veri.adiSoyadi,
            veri.cinsiyeti,
            veri.calistigiDepartman,
            veri.kidemTazminatinaEsasUcret,
            veri.dogumTarihi,
            veri.iseGirisTarihi,
            veri.sigortaIlkGirisTarihi,
            veri.varsaPrimOdenmemisGunSayisi,
            veri.kullanilmamisIzinGunu,
            veri.kullanilmamisIzneEsasBrutUcret,
          ];
          rowsAll.push(newRow);
        }
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
        "Kıdem Tazminatı (Tfrs)"
      );
      setRowCount(format.satirSayisi);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchRowCount();
  }, []);

  useEffect(() => {
    if (halfPasteControl == false) {
      fetchData();
    }
  }, [halfPasteControl]);

  useEffect(() => {
    if (afterPasteCompleted) {
      handleCreateMultipleKidemTazminatiTfrsVerisi();
      setAfterPasteCompleted(false);
    }
  }, [afterPasteCompleted]);

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
        saveAs(blob, "KidemTazminatiTfrsFormati.xlsx");
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
        colWidths={[0, 130, 80, 90, 100, 90, 90, 90, 90, 90, 90]}
        stretchH="all"
        manualColumnResize={true}
        rowHeaders={true}
        rowHeights={35}
        autoWrapRow={true}
        minRows={rowCount}
        minCols={10}
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

export default KidemTazminatiTfrsVeriYukleme;
