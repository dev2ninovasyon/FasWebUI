import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Fab, Grid, Tooltip, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
  getOrneklemByDipnot,
  getOrneklemByDipnotTers,
} from "@/api/DenetimKanitlari/DenetimKanitlari";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import OrneklemFisleri from "./OrneklemFisleri";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

// register Handsontable's modules
numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Veri {
  id: number;
  kebirKodu: number;
  hesapAdi: string;
  borc: number;
  borcIslemSayisi: number;
  borcOrtalama: number;
  alacak: number;
  alacakIslemSayisi: number;
  alacakOrtalama: number;
  kalanBakiye: number;
  toplamIslemSayisi: number;
  orneklemSayisi: number;
  borcOrneklemSayisi: number;
  alacakOrneklemSayisi: number;
  listelemeTuru: string;
  guvenilirlikDuzeyi: string;
}

interface Props {
  dipnot: string;
  tersMi?: boolean;
}
const Orneklem: React.FC<Props> = ({ dipnot, tersMi }) => {
  const hotTableComponent = useRef<any>(null);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [kebirKodu, setKebirKodu] = useState([]);

  const [detayTiklandimi, setDetayTiklandimi] = useState(false);

  const [rowCount, setRowCount] = useState(0);

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

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
    "Kebir Kodu",
    "Hesap Adı",
    "Borç",
    "B. Fiş Sayısı",
    "B. Ortalaması",
    "Alacak",
    "A. Fiş Sayısı",
    "A. Ortalaması",
    "Bakiye",
    "Toplam Fiş Sayısı",
    "Örneklem Sayısı",
    "Borç Örnek Sayısı",
    "Alacak Örnek Sayısı",
    "Listeleme Türü",
    "Güvenilirlik Düzeyi",
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
    }, // Borç
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
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Borç Ortalaması
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
    }, // Alacak
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
        pattern: "0,0.00",
        columnSorting: true,
        culture: "tr-TR",
      },
      className: "htRight",
      readOnly: true,
      editor: false,
    }, // Alacak Ortalaması
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
    }, // Bakiye
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
    }, // Toplam İşlem Sayısı
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
    }, // Örneklem Sayısı
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
    }, // Borç Örnek Sayısı
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
    }, // Alacak Örnek Sayısı
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Listeleme Türü
    {
      type: "text",
      columnSorting: true,
      className: "htLeft",
      allowInvalid: false,
      readOnly: true,
      editor: false,
    }, // Güvenilirlik Düzeyi
  ];




  const handleGetRowData = async (row: number) => {
    if (hotTableComponent.current) {
      const hotInstance = hotTableComponent.current.hotInstance;
      const cellMeta = hotInstance.getDataAtRow(row);
      console.log("Satır Verileri:", cellMeta);
      return cellMeta;
    }
  };

  const fetchData = async () => {
    try {
      if (tersMi) {
        const orneklemVerileri = await getOrneklemByDipnotTers(user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          dipnot
        );
        const kebirKoduAll: any = [];
        const rowsAll: any = [];

        orneklemVerileri.forEach((veri: any) => {
          const newRow: any = [
            veri.id,
            veri.kebirKodu,
            veri.hesapAdi,
            veri.borc,
            veri.borcIslemSayisi,
            veri.borcOrtalama,
            veri.alacak,
            veri.alacakIslemSayisi,
            veri.alacakOrtalama,
            veri.kalanBakiye,
            veri.toplamIslemSayisi,
            veri.orneklemSayisi,
            veri.borcOrneklemSayisi,
            veri.alacakOrneklemSayisi,
            veri.listelemeTuru,
            veri.guvenilirlikDuzeyi,
          ];
          kebirKoduAll.push(veri.kebirKodu);
          rowsAll.push(newRow);
        });

        setKebirKodu(kebirKoduAll);
        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
      } else {
        const orneklemVerileri = await getOrneklemByDipnot(user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          dipnot
        );
        const kebirKoduAll: any = [];
        const rowsAll: any = [];

        orneklemVerileri.forEach((veri: any) => {
          const newRow: any = [
            veri.id,
            veri.kebirKodu,
            veri.hesapAdi,
            veri.borc,
            veri.borcIslemSayisi,
            veri.borcOrtalama,
            veri.alacak,
            veri.alacakIslemSayisi,
            veri.alacakOrtalama,
            veri.kalanBakiye,
            veri.toplamIslemSayisi,
            veri.orneklemSayisi,
            veri.borcOrneklemSayisi,
            veri.alacakOrneklemSayisi,
            veri.listelemeTuru,
            veri.guvenilirlikDuzeyi,
          ];
          kebirKoduAll.push(veri.kebirKodu);
          rowsAll.push(newRow);
        });

        setKebirKodu(kebirKoduAll);
        setRowCount(rowsAll.length);
        setFetchedData(rowsAll);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [dipnot]);

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
          maxHeight: 432,
          maxWidth: "100%",
        }}
        language={dictionary.languageCode}
        ref={hotTableComponent}
        data={fetchedData}
        height={"auto"}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={[
          0, 70, 100, 80, 60, 80, 80, 60, 80, 80, 60, 60, 60, 60, 90, 60,
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
        contextMenu={["alignment", "copy"]}
      />
      {kebirKodu.length > 0 ? (
        <>
          <Grid container>
            <Grid
              my={2}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
              size={{
                xs: 12,
                lg: 12
              }}>
              <Tooltip title={detayTiklandimi ? "Detay Gizle" : "Detay Göster"}>
                <Fab
                  color="warning"
                  size="small"
                  onClick={() => setDetayTiklandimi(!detayTiklandimi)}
                >
                  {detayTiklandimi ? (
                    <IconEyeOff width={16} height={16} />
                  ) : (
                    <IconEye width={16} height={16} />
                  )}
                </Fab>
              </Tooltip>
            </Grid>
          </Grid>

          {detayTiklandimi && <OrneklemFisleri kebirKodu={kebirKodu} />}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Orneklem;
