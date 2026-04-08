import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getDonusumMizan } from "@/api/Donusum/Donusum";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  kebirKodu: string | number;
  detayKodu: string;
  yil: number;
  hesapAdi: string;
  vukBorc: number;
  vukAlacak: number;
  fisBorc: number;
  fisAlacak: number;
  raporBorc: number;
  raporAlacak: number;
  borcBakiye: number;
  alacakBakiye: number;
}

type VeriSatiri = Array<string | number | undefined>;

interface Props {
  konsolidasyonMu?: boolean;
  donusumIslemiYapTiklandiMi?: boolean;
  setDonusumIslemiYapTiklandiMi?: (bool: boolean) => void;
}

const DonusumMizanKontrol: React.FC<Props> = ({
  konsolidasyonMu = false,
  donusumIslemiYapTiklandiMi,
  setDonusumIslemiYapTiklandiMi,
}) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<VeriSatiri[]>([]);
  const [sourceData, setSourceData] = useState<Veri[]>([]);

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
    "Kebir Kodu",
    "Detay Kodu",
    "Yıl",
    "Hesap Adı",
    "Vuk Borç",
    "Vuk Alacak",
    "Dönüşüm Borç",
    "Dönüşüm Alacak",
    "Rapor Borç",
    "Rapor Alacak",
    "Borç Bakiye",
    "Alacak Bakiye",
  ];

  const columns = [
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
    }, // Detay Kodu
    {
      type: "numeric",
      columnSorting: true,
      className: "htLeft",
      readOnly: true,
      editor: false,
    }, // Yıl
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
        pattern: "0,0",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Vuk Borç
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
    }, // Vuk Alacak
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
    }, // Dönüşüm Borç
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
    }, // Dönüşüm Alacak
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
    }, // Rapor Borç
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
    }, // Rapor Alacak
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
    }, // Borç Bakiye
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
    }, // Alacak Bakiye
  ];



  const afterRenderer = (
    TD: any,
    row: any,
    col: any,
    prop: any,
    value: any,
    cellProperties: any
  ) => {
    //TD.style.textAlign = "left";

    // Torba Hesap ters bakiye kontrolü: 257.00, 268.00, 278.00 — raporBorc ≠ raporAlacak ise kırmızı
    const rowData = sourceData[row];
    if (rowData) {
      const detayKodu = rowData.detayKodu;
      const raporBorc = rowData.raporBorc;
      const raporAlacak = rowData.raporAlacak;
      if (
        (detayKodu === "257.00" || detayKodu === "268.00" || detayKodu === "278.00") &&
        raporBorc !== raporAlacak
      ) {
        TD.style.backgroundColor =
          customizer.activeMode === "dark" ? "#5c1a1a" : "#ffebee";
        
      }
    }
  };

  const fetchData = async () => {
    try {
      const donusumMizanVerileri = await getDonusumMizan(user.denetlenenId || 0,
        user.yil || 0,
        konsolidasyonMu
      );

      let totalVukBorc = 0;
      let totalVukAlacak = 0;

      let totalFisBorc = 0;
      let totalFisAlacak = 0;

      let totalRaporBorc = 0;
      let totalRaporAlacak = 0;

      let totalBorcBakiye = 0;
      let totalAlacakBakiye = 0;

      const rowsAll: VeriSatiri[] = [];
      const normalizedRows: Veri[] = [];

      donusumMizanVerileri.forEach((veri: Veri) => {
        if (
          veri.vukBorc === 0 &&
          veri.vukAlacak === 0 &&
          veri.fisBorc === 0 &&
          veri.fisAlacak === 0 &&
          veri.raporBorc === 0 &&
          veri.raporAlacak === 0 &&
          veri.borcBakiye === 0 &&
          veri.alacakBakiye === 0
        ) {
          return;
        }

        // Negatif bakiye düzeltme
        const normalizedVeri = { ...veri };

        if (normalizedVeri.borcBakiye < 0) {
          normalizedVeri.alacakBakiye = Math.abs(normalizedVeri.borcBakiye);
          normalizedVeri.borcBakiye = 0;
        } else if (normalizedVeri.alacakBakiye < 0) {
          normalizedVeri.borcBakiye = Math.abs(normalizedVeri.alacakBakiye);
          normalizedVeri.alacakBakiye = 0;
        }

        const newRow: VeriSatiri = [
          normalizedVeri.kebirKodu,
          normalizedVeri.detayKodu,
          normalizedVeri.yil,
          normalizedVeri.hesapAdi,
          normalizedVeri.vukBorc,
          normalizedVeri.vukAlacak,
          normalizedVeri.fisBorc,
          normalizedVeri.fisAlacak,
          normalizedVeri.raporBorc,
          normalizedVeri.raporAlacak,
          normalizedVeri.borcBakiye,
          normalizedVeri.alacakBakiye,
        ];

        normalizedRows.push(normalizedVeri);
        rowsAll.push(newRow);

        if (normalizedVeri.detayKodu.length > 3) {
          totalVukBorc = Number((totalVukBorc + (normalizedVeri.vukBorc || 0)).toFixed(2));
          totalVukAlacak = Number((totalVukAlacak + (normalizedVeri.vukAlacak || 0)).toFixed(2));

          totalFisBorc = Number((totalFisBorc + (normalizedVeri.fisBorc || 0)).toFixed(2));
          totalFisAlacak = Number((totalFisAlacak + (normalizedVeri.fisAlacak || 0)).toFixed(2));

          totalRaporBorc = Number((totalRaporBorc + (normalizedVeri.raporBorc || 0)).toFixed(2));
          totalRaporAlacak = Number((totalRaporAlacak + (normalizedVeri.raporAlacak || 0)).toFixed(2));

          totalBorcBakiye = Number((totalBorcBakiye + (normalizedVeri.borcBakiye || 0)).toFixed(2));
          totalAlacakBakiye = Number((totalAlacakBakiye + (normalizedVeri.alacakBakiye || 0)).toFixed(2));
        }
      });

      rowsAll.push([
        undefined,
        undefined,
        undefined,
        "Toplam",
        totalVukBorc,
        totalVukAlacak,
        totalFisBorc,
        totalFisAlacak,
        totalRaporBorc,
        totalRaporAlacak,
        totalBorcBakiye,
        totalAlacakBakiye,
      ]);
      setRowCount(rowsAll.length);
      setSourceData(normalizedRows);
      setFetchedData(rowsAll);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!donusumIslemiYapTiklandiMi) {
      fetchData();
    } else {
      setRowCount(0);
      setSourceData([]);
      setFetchedData([]);
    }
  }, [donusumIslemiYapTiklandiMi]);

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
        saveAs(blob, "DonusumMizan.xlsx");
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
      <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
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
        colWidths={[50, 50, 50, 120, 100, 100, 100, 100, 100, 100, 100, 100]}
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
        licenseKey="non-commercial-and-evaluation" // For non-commercial use only
        afterRenderer={afterRenderer}
        contextMenu={["alignment", "copy"]}
      />
      <Grid container marginTop={2} marginBottom={1}>
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

export default DonusumMizanKontrol;

