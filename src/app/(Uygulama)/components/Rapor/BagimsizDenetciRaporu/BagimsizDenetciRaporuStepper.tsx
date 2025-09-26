"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import CustomSwitch from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSwitch";
import { IconFileTypeDoc, IconX } from "@tabler/icons-react";
import {
  getRaporDipnot,
  getRaporGorus,
  updateRaporGorus,
} from "@/api/DenetimRaporu/DenetimRaporu";
import RaporGorusCard from "@/app/(Uygulama)/components/Rapor/RaporGorus/RaporGorusCard";
import {
  getFinansalDurumTablosu,
  getKarZararTablosu,
  getNakitAkisTablosu,
  getOzkaynakTablosu,
} from "@/api/FinansalTablolar/FinansalToblolar";
import dynamic from "next/dynamic";
import Rapor from "./Rapor";
import jsPDF from "jspdf";
import { base64FontBold, base64FontRegular } from "./Roboto";
import { IconFileTypePdf } from "@tabler/icons-react";
import RaporTfrs from "./RaporTfrs";

const RaporGorusEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Rapor/RaporGorus/RaporGorusEditor"),
  { ssr: false }
);

const steps = [
  "Görüş Düzenleme",
  "Parametreler",
  "Kapak Tasarımı",
  "Bağımsız Denetçi Raporu",
];

interface Veri {
  id: number;
  baslik: string;
  text: string;
}

interface VeriFT {
  id: number;
  parentId?: number | null;
  kalemAdi: string;
  dipnot: string;
  formul: string;
  tutarYil1: number;
  tutarYil2: number;
  tutarYil3: number;
}

interface VeriFT2 {
  id: number;
  dikeyKalemId: number;
  yatayKalemId: number;
  dikeyKalemAdi: string;
  yatayKalemAdi: string;
  formul: number;
  tutar: number;
  kalemOzkaynakId: number;
  formulOzkaynakNavigationId: number;
}

interface VeriDipnot {
  id: number;
  dipnotKodu: number;
  text: string;
  baslikmi: boolean;
}

const BagimsizDenetciRaporuStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const customizer = useSelector((state: AppState) => state.customizer);
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down("md"));
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [fdtData, setFdtData] = React.useState<VeriFT[]>([]);
  const [kztdata, setKztData] = React.useState<VeriFT[]>([]);
  const [natData, setNatData] = React.useState<VeriFT[]>([]);
  const [ozkDataCari, setOzkDataCari] = React.useState<VeriFT2[]>([]);
  const [ozkDataOnceki, setOzkDataOnceki] = React.useState<VeriFT2[]>([]);

  const [ozkDikeyDataCari, setOzkDikeyDataCari] = React.useState<VeriFT2[]>([]);
  const [ozkDikeyDataOnceki, setOzkDikeyDataOnceki] = React.useState<VeriFT2[]>(
    []
  );
  const [ozkYatayDataCari, setOzkYatayDataCari] = React.useState<VeriFT2[]>([]);
  const [ozkYatayDataOnceki, setOzkYatayDataOnceki] = React.useState<VeriFT2[]>(
    []
  );

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [gorusVeriler, setGorusVeriler] = useState<Veri[]>([]);
  const [dipnotVeriler, setDipnotVeriler] = useState<any[]>([]);

  const [raporGorusu, setRaporGorusu] = useState("OlumluGorus");
  const handleChangeRaporGorusu = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRaporGorusu(event.target.value);
  };

  const [ticariAlacaklar, setTicariAlacaklar] = React.useState(false);
  const [stoklar, setStoklar] = React.useState(false);
  const [maddiDuranVarliklar, setMaddiDuranVarliklar] = React.useState(false);
  const [hasilat, setHasilat] = React.useState(false);
  const [ticariBorclar, setTicariBorclar] = React.useState(false);
  const [nakitVeNakitBenzerleri, setNakitVeNakitBenzerleri] =
    React.useState(false);
  const [satislarinMaliyeti, setSatislarinMaliyeti] = React.useState(false);
  const [satislar, setSatislar] = React.useState(false);
  const [enflasyonMuhasebesi, setEnflasyonMuhasebesi] = React.useState(false);
  const [diger, setDiger] = React.useState(false);

  const handleChangeTicariAlacaklar = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTicariAlacaklar(event.target.checked);
  };
  const handleChangeStoklar = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStoklar(event.target.checked);
  };
  const handleChangeMaddiDuranVarliklar = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMaddiDuranVarliklar(event.target.checked);
  };
  const handleChangeHasilat = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasilat(event.target.checked);
  };
  const handleChangeTicariBorclar = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTicariBorclar(event.target.checked);
  };
  const handleChangeNakitVeNakitBenzerleri = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNakitVeNakitBenzerleri(event.target.checked);
  };
  const handleChangeSatislarinMaliyeti = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSatislarinMaliyeti(event.target.checked);
  };
  const handleChangeSatislar = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSatislar(event.target.checked);
  };
  const handleChangeEnflasyonMuhasebesi = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEnflasyonMuhasebesi(event.target.checked);
  };
  const handleChangeDiger = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiger(event.target.checked);
  };

  const removeKilitDenetimKonusu = (
    htmlString: string,
    konu: string
  ): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const elements = doc.querySelectorAll("tr");

    elements.forEach((tr) => {
      if (tr.innerHTML.includes(`${konu}`)) {
        tr.remove();
      }
    });

    return doc.body.innerHTML;
  };

  const [detayHesaplar, setDetayHesaplar] = React.useState(false);
  const handleChangeDetayHesaplar = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDetayHesaplar(event.target.checked);
  };

  const [kapakImage, setKapakImage] = useState<string | null>(null);

  const handleKapakImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setKapakImage(objectURL);
      setKapak("ResimSec");
    }
  };

  const [kapak, setKapak] = useState("ResimSec");
  const handleChangeKapak = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value == "ResimSec") {
      setKapakImage(null);
    }
    if (event.target.value == "Resim1") {
      setKapakImage("/images/kapak/ArkaPlan1.jpg");
    }
    if (event.target.value == "Resim2") {
      setKapakImage("/images/kapak/ArkaPlan2.jpg");
    }
    if (event.target.value == "Resim3") {
      setKapakImage("/images/kapak/ArkaPlan3.png");
    }
    setKapak(event.target.value);
  };

  const [firmaLogoImage, setFirmaLogoImage] = useState<string | null>(null);

  const handleFirmaLogoImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setFirmaLogoImage(objectURL);
    }
  };

  const [dikeyKonum, setDikeyKonum] = useState("Ust");
  const handleChangeDikeyKonum = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDikeyKonum(event.target.value);
  };

  const [yatayKonum, setYatayKonum] = useState("Sol");
  const handleChangeYatayKonum = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setYatayKonum(event.target.value);
  };

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleUpdate = async () => {
    try {
      const keys = ["id", "text"];

      const jsonData = gorusVeriler.map((item: Veri) => {
        let obj: { [key: string]: any } = {};
        keys.forEach((key, index) => {
          if (key === "id") {
            obj[key] = item.id;
          } else if (key === "text") {
            obj[key] = item.text;
          }
        });
        return obj;
      });

      const result = await updateRaporGorus(user.token || "", jsonData);

      handleClosePopUp();
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const gorusVerileri = await getRaporGorus(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        user.denetimTuru || "",
        raporGorusu
      );

      const rowsAll: any = [];

      gorusVerileri.forEach((veri: any) => {
        let cleanedText = veri.text;
        if (raporGorusu == "OlumluGorus") {
          if (ticariAlacaklar == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Ticari alacakların geri kazanılabilirliği"
            );
          }
          if (stoklar == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Stok değer düşüklüğü karşılığı"
            );
          }
          if (maddiDuranVarliklar == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Maddi duran varlıkların yeniden değerleme metodu ile muhasebeleştirilmesi"
            );
          }
          if (hasilat == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Hasılatın finansal tablolara alınması"
            );
          }
          if (ticariBorclar == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Ticari Borçlar"
            );
          }
          if (nakitVeNakitBenzerleri == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Nakit ve Nakit Benzerleri"
            );
          }
          if (satislarinMaliyeti == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Satışların Maliyeti"
            );
          }
          if (satislar == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Şirketin satışları,"
            );
          }
          if (enflasyonMuhasebesi == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Enflasyon Muhasebesi"
            );
          }
          if (diger == false) {
            cleanedText = removeKilitDenetimKonusu(
              cleanedText,
              "Diğer Kilit Denetim Konusu"
            );
          }
        }
        const newRow: Veri = {
          id: veri.id,
          baslik: veri.baslik,
          text: cleanedText,
        };
        rowsAll.push(newRow);
      });

      setVeriler(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchFinansalTablolar = async () => {
    try {
      const finansalDurumTablosu = await getFinansalDurumTablosu(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        false
      );
      const newRowsFdt = finansalDurumTablosu.slice(1).map((veri: VeriFT) => ({
        id: veri.id,
        parentId:
          veri.parentId !== undefined
            ? veri.parentId === finansalDurumTablosu[0]?.id
              ? null
              : veri.parentId
            : null,
        kalemAdi: veri.kalemAdi,
        dipnot: veri.dipnot,
        formul: veri.formul,
        tutarYil1: veri.tutarYil1,
        tutarYil2: veri.tutarYil2,
        tutarYil3: veri.tutarYil3,
      }));

      setFdtData(
        newRowsFdt.filter(
          (veri: VeriFT) => veri.tutarYil1 != 0 || veri.tutarYil2 != 0
        )
      );

      const karZararTablosu = await getKarZararTablosu(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        false
      );

      const newRowsKzt = karZararTablosu.slice(1).map((veri: VeriFT) => ({
        id: veri.id,
        parentId:
          veri.parentId !== undefined
            ? veri.parentId === karZararTablosu[0]?.id
              ? null
              : veri.parentId
            : null,
        kalemAdi: veri.kalemAdi,
        dipnot: veri.dipnot,
        formul: veri.formul,
        tutarYil1: veri.tutarYil1,
        tutarYil2: veri.tutarYil2,
        tutarYil3: veri.tutarYil3,
      }));

      setKztData(
        newRowsKzt.filter(
          (veri: VeriFT) => veri.tutarYil1 != 0 || veri.tutarYil2 != 0
        )
      );

      const nakitAkisTablosu = await getNakitAkisTablosu(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        false
      );

      const newRowsNat = nakitAkisTablosu.slice(1).map((veri: VeriFT) => ({
        id: veri.id,
        parentId:
          veri.parentId !== undefined
            ? veri.parentId === nakitAkisTablosu[0]?.id
              ? null
              : veri.parentId
            : null,
        kalemAdi: veri.kalemAdi,
        dipnot: veri.dipnot,
        formul: veri.formul,
        tutarYil1: veri.tutarYil1,
        tutarYil2: veri.tutarYil2,
        tutarYil3: veri.tutarYil3,
      }));

      setNatData(
        newRowsNat.filter(
          (veri: VeriFT) => veri.tutarYil1 != 0 || veri.tutarYil2 != 0
        )
      );

      const ozkaynakTablosuCari = await getOzkaynakTablosu(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        false
      );

      const ozkaynakDataCari: VeriFT2[] = [];

      ozkaynakTablosuCari.forEach((veri: VeriFT2) => {
        const newRow = {
          id: veri.id,
          dikeyKalemId: veri.dikeyKalemId,
          yatayKalemId: veri.yatayKalemId,
          dikeyKalemAdi: veri.dikeyKalemAdi,
          yatayKalemAdi: veri.yatayKalemAdi,
          formul: veri.formul,
          tutar: veri.tutar,
          kalemOzkaynakId: veri.kalemOzkaynakId,
          formulOzkaynakNavigationId: veri.formulOzkaynakNavigationId,
        };

        if (veri.yatayKalemAdi && veri.dikeyKalemId) {
          ozkaynakDataCari.push(newRow);
        }
      });

      const distinctDikeyKalemObjCari = Array.from(
        new Map(
          ozkaynakDataCari.map((veri) => [veri.dikeyKalemId, veri])
        ).values()
      );

      const distinctYatayKalemObjCari = Array.from(
        new Map(
          ozkaynakDataCari.map((veri) => [veri.yatayKalemId, veri])
        ).values()
      );

      const filteredDikeyDataCari = distinctDikeyKalemObjCari.filter(
        (dikeyItem) => {
          const relatedOzkaynak = ozkaynakDataCari.filter(
            (ozk) => ozk.dikeyKalemId === dikeyItem.dikeyKalemId
          );
          return relatedOzkaynak.some((ozk) => ozk.tutar !== 0); // En az bir tutar sıfır değilse tutulur
        }
      );

      const filteredYatayDataCari = distinctYatayKalemObjCari.filter(
        (yatayItem) => {
          const relatedOzkaynak = ozkaynakDataCari.filter(
            (ozk) => ozk.yatayKalemId === yatayItem.yatayKalemId
          );
          return relatedOzkaynak.some((ozk) => ozk.tutar !== 0); // En az bir tutar sıfır değilse tutulur
        }
      );

      // Filtrelenmiş dikey ve yatay verilerin ID'lerini al
      const validDikeyIdsCari = new Set(
        filteredDikeyDataCari.map((item) => item.dikeyKalemId)
      );
      const validYatayIdsCari = new Set(
        filteredYatayDataCari.map((item) => item.yatayKalemId)
      );

      // ozkaynakData'yı geçerli dikey ve yatay ID'lere göre filtrele
      const filteredOzkaynakDataCari = ozkaynakDataCari.filter(
        (ozk) =>
          validDikeyIdsCari.has(ozk.dikeyKalemId) &&
          validYatayIdsCari.has(ozk.yatayKalemId)
      );

      setOzkDikeyDataCari(filteredDikeyDataCari);
      setOzkYatayDataCari(filteredYatayDataCari);
      setOzkDataCari(filteredOzkaynakDataCari);

      const ozkaynakTablosuOnceki = await getOzkaynakTablosu(
        user.token || "",
        user.denetciId || 0,
        user.yil ? user.yil - 1 : 0,
        user.denetlenenId || 0,
        false
      );

      const ozkaynakDataOnceki: VeriFT2[] = [];

      ozkaynakTablosuOnceki.forEach((veri: VeriFT2) => {
        const newRow = {
          id: veri.id,
          dikeyKalemId: veri.dikeyKalemId,
          yatayKalemId: veri.yatayKalemId,
          dikeyKalemAdi: veri.dikeyKalemAdi,
          yatayKalemAdi: veri.yatayKalemAdi,
          formul: veri.formul,
          tutar: veri.tutar,
          kalemOzkaynakId: veri.kalemOzkaynakId,
          formulOzkaynakNavigationId: veri.formulOzkaynakNavigationId,
        };

        if (veri.yatayKalemAdi && veri.dikeyKalemId) {
          ozkaynakDataOnceki.push(newRow);
        }
      });

      const distinctDikeyKalemObjOnceki = Array.from(
        new Map(
          ozkaynakDataOnceki.map((veri) => [veri.dikeyKalemId, veri])
        ).values()
      );

      const distinctYatayKalemObjOnceki = Array.from(
        new Map(
          ozkaynakDataOnceki.map((veri) => [veri.yatayKalemId, veri])
        ).values()
      );

      const filteredDikeyDataOnceki = distinctDikeyKalemObjOnceki.filter(
        (dikeyItem) => {
          const relatedOzkaynak = ozkaynakDataOnceki.filter(
            (ozk) => ozk.dikeyKalemId === dikeyItem.dikeyKalemId
          );
          return relatedOzkaynak.some((ozk) => ozk.tutar !== 0); // En az bir tutar sıfır değilse tutulur
        }
      );

      const filteredYatayDataOnceki = distinctYatayKalemObjOnceki.filter(
        (yatayItem) => {
          const relatedOzkaynak = ozkaynakDataOnceki.filter(
            (ozk) => ozk.yatayKalemId === yatayItem.yatayKalemId
          );
          return relatedOzkaynak.some((ozk) => ozk.tutar !== 0); // En az bir tutar sıfır değilse tutulur
        }
      );

      // Filtrelenmiş dikey ve yatay verilerin ID'lerini al
      const validDikeyIdsOnceki = new Set(
        filteredDikeyDataOnceki.map((item) => item.dikeyKalemId)
      );
      const validYatayIdsOnceki = new Set(
        filteredYatayDataOnceki.map((item) => item.yatayKalemId)
      );

      // ozkaynakData'yı geçerli dikey ve yatay ID'lere göre filtrele
      const filteredOzkaynakDataOnceki = ozkaynakDataOnceki.filter(
        (ozk) =>
          validDikeyIdsOnceki.has(ozk.dikeyKalemId) &&
          validYatayIdsOnceki.has(ozk.yatayKalemId)
      );

      setOzkDikeyDataOnceki(filteredDikeyDataOnceki);
      setOzkYatayDataOnceki(filteredYatayDataOnceki);
      setOzkDataOnceki(filteredOzkaynakDataOnceki);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchDipnot = async () => {
    try {
      const dipnotVerileri = await getRaporDipnot(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        user.denetimTuru || ""
      );

      const groupedData: Record<string, VeriDipnot[]> = {}; // Dipnot kodlarına göre gruplama için nesne
      dipnotVerileri.forEach((veri: any) => {
        const newRow: VeriDipnot = {
          id: veri.id,
          dipnotKodu:
            veri.dipnotKodu > 100 ? veri.dipnotKodu / 10 : veri.dipnotKodu,
          text: veri.text,
          baslikmi: veri.baslikmi,
        };

        // Eğer dipnotKodu için grup yoksa oluştur
        if (!groupedData[newRow.dipnotKodu]) {
          groupedData[newRow.dipnotKodu] = [];
        }
        // Yeni satırı gruba ekle
        groupedData[newRow.dipnotKodu].push(newRow);
      });

      // Grupları bir dizi formatına dönüştürmek isteyebilirsiniz
      const groupedArray = Object.entries(groupedData).map(([key, value]) => ({
        dipnotKodu: key,
        veriler: value,
      }));

      setDipnotVeriler(groupedArray); // Grup verilerini duruma aktar
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchFinansalTablolar();
    fetchDipnot();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [raporGorusu]);

  useEffect(() => {
    fetchData();
  }, [gorusVeriler]);

  useEffect(() => {
    fetchData();
  }, [
    ticariAlacaklar,
    stoklar,
    maddiDuranVarliklar,
    hasilat,
    ticariBorclar,
    nakitVeNakitBenzerleri,
    satislarinMaliyeti,
    satislar,
    enflasyonMuhasebesi,
    diger,
  ]);

  const handleCardClick = (veri: any) => {
    setGorusVeriler(veriler.filter((x) => x.baslik == veri.baslik));
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
    setGorusVeriler([]);
  };

  const isStepOptional = (step: number) => {
    return step == -1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      enqueueSnackbar("Bu Adımı Geçemezsiniz. Tamamlamanız Gerekmektedir.", {
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
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleStepClick = (stepName: string) => {
    const stepIndex = steps.indexOf(stepName);
    if (stepIndex !== -1) {
      setActiveStep(stepIndex);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  async function createPDF() {
    const reportElement = document.querySelector("div#report") as HTMLElement;
    const reportPage = document.querySelector(
      "div#report > div.page"
    ) as HTMLElement;
    const pageSize = {
      width: reportPage.offsetWidth,
      height: reportPage.offsetHeight,
    };

    if (!reportElement) return;

    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: "a4",
    });

    pdf.addFileToVFS("Roboto-Regular.ttf", base64FontRegular);
    pdf.addFileToVFS("Roboto-Bold.ttf", base64FontBold);
    pdf.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    pdf.addFont("Roboto-Bold.ttf", "Roboto", "bold");

    pdf.setFont("Roboto", "normal");

    pdf.html(reportElement, {
      callback: function (pdf) {
        const pageCount = pdf.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setFont("Roboto", "normal");
        pdf.setFontSize(10);

        for (let i = 1; i <= pageCount; i++) {
          if (i > 2) {
            pdf.setPage(i);
            const text = `${i - 2}`;
            const textWidth = pdf.getTextWidth(text);
            const xPos = pageWidth - textWidth - 20; // Sağ alt köşe için konumlandırma
            const yPos = pageHeight - 20; // Alt kısma yerleştirme
            pdf.text(text, xPos, yPos);
          }
        }

        pdf.save("FAS-Rapor.pdf");
      },
      width: pageSize.width,
      windowWidth: pageSize.width,
      html2canvas: {
        scale: 0.46,
        useCORS: true,
      },
      margin: [50, 40, 50, 40],
      autoPaging: "text",
    });
  }
  async function createWord() {
    const reportElement = document.querySelector("#report");
    if (!reportElement) return;

    const clonedElement = reportElement.cloneNode(true) as Element;

    clonedElement.querySelectorAll("img").forEach((img) => img.remove());

    const htmlContent = clonedElement.outerHTML;

    const wordDocument = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>FAS Rapor</title>
        <style>
          body { font-family: 'Roboto', sans-serif; font-size: 12px; }
          h1 { font-size: 2.25rem; line-height: 2.75rem; }
          h2 { font-size: 1.875rem; line-height: 2.25rem; }
          h3 { font-size: 1.5rem; line-height: 1.75rem; }
          h4 { font-size: 1.3125rem; line-height: 1.6rem; }
          h5 { font-size: 1.125rem; line-height: 1.6rem; }
          h6 { font-size: 1rem; line-height: 1.2rem; }
          .seperator24 { height: 24px; background-color: white; }
          .seperator48 { height: 48px; background-color: white; }
          .text-center { text-align: center; }
          .text-right { text-align: right !important; }
          .data-table { width: 100%; border-collapse: collapse; }
          .data-table th, .data-table td {
            padding-left: 4px;
            padding-right: 4px;
            border: 1px solid #ddd;
          }
          .data-table th { text-align: left; font-weight: bold; }
          .data-table td { text-align: left; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>`;

    const blob = new Blob(["\ufeff", wordDocument], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "FAS-Rapor.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Box>
      <Stepper
        activeStep={activeStep}
        sx={{
          flexWrap: { xs: "wrap", sm: "nowrap" },
          width: "100%",
          justifyContent: "center",
          mb: 3,
        }}
      >
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">İsteğe Bağlı</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel
                {...labelProps}
                onClick={() => handleStepClick(label)}
                sx={{
                  cursor: "pointer !important",
                  "& .MuiStepLabel-label": {
                    fontSize: theme.typography.h6,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <>
        {activeStep == 0 && (
          <Grid container mb={3}>
            <Grid item xs={12} sm={12} lg={12}>
              <Box bgcolor={"warning.light"} textAlign="center">
                <CardContent
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    height: "120px",
                  }}
                >
                  <Grid container>
                    <Grid item xs={12} md={4} lg={4} mb={mdDown ? 3 : 0}>
                      <Typography
                        variant="subtitle1"
                        height={"100%"}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={mdDown ? "center" : "start"}
                      >
                        Lütfen Bir Görüş Belirtin:
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={8} lg={8}>
                      <CustomSelect
                        labelId="raporGorusu"
                        id="raporGorusu"
                        size="small"
                        value={raporGorusu}
                        onChange={handleChangeRaporGorusu}
                        height={"36px"}
                        sx={{ width: "100%" }}
                      >
                        <MenuItem value={"OlumluGorus"}>Olumlu Görüş</MenuItem>
                        <MenuItem value={"OlumsuzGorus"}>
                          Olumsuz Görüş
                        </MenuItem>
                        <MenuItem value={"SartliGorus"}>
                          Sınırlı Olumlu Görüş (Şartlı Görüş)
                        </MenuItem>
                        <MenuItem value={"GorusBildirmektenKacinma"}>
                          Görüş Bildirmekten Kaçınma
                        </MenuItem>
                      </CustomSelect>
                    </Grid>
                  </Grid>
                </CardContent>
              </Box>
              {raporGorusu == "OlumluGorus" && (
                <Grid item xs={12} sm={12} lg={12}>
                  <Grid container spacing={3} marginY={3}>
                    <Grid item xs={12} sm={12} lg={12}>
                      <Typography variant="h6" px={"8px"}>
                        Kilit Denetim Konuları
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"info.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={ticariAlacaklar}
                                onChange={handleChangeTicariAlacaklar}
                                color="info"
                              />
                            }
                            label="Ticari Alacaklar"
                            labelPlacement="top"
                            sx={{ color: "info.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"success.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={stoklar}
                                onChange={handleChangeStoklar}
                                color="success"
                              />
                            }
                            label="Stoklar"
                            labelPlacement="top"
                            sx={{ color: "success.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"error.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={maddiDuranVarliklar}
                                onChange={handleChangeMaddiDuranVarliklar}
                                color="error"
                              />
                            }
                            label="Maddi Duran Varlıklar"
                            labelPlacement="top"
                            sx={{ color: "error.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"warning.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={hasilat}
                                onChange={handleChangeHasilat}
                                color="warning"
                              />
                            }
                            label="Hasılat"
                            labelPlacement="top"
                            sx={{ color: "warning.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"info.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={ticariBorclar}
                                onChange={handleChangeTicariBorclar}
                                color="info"
                              />
                            }
                            label="Ticari Borçlar"
                            labelPlacement="top"
                            sx={{ color: "info.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"success.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={nakitVeNakitBenzerleri}
                                onChange={handleChangeNakitVeNakitBenzerleri}
                                color="success"
                              />
                            }
                            label="Nakit Ve Nakit Benzerleri"
                            labelPlacement="top"
                            sx={{ color: "success.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"error.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={satislarinMaliyeti}
                                onChange={handleChangeSatislarinMaliyeti}
                                color="error"
                              />
                            }
                            label="Satışların Maliyeti"
                            labelPlacement="top"
                            sx={{ color: "error.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"warning.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={satislar}
                                onChange={handleChangeSatislar}
                                color="warning"
                              />
                            }
                            label="Satışlar"
                            labelPlacement="top"
                            sx={{ color: "warning.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"info.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={enflasyonMuhasebesi}
                                onChange={handleChangeEnflasyonMuhasebesi}
                                color="info"
                              />
                            }
                            label="Enflasyon Muhasebesi"
                            labelPlacement="top"
                            sx={{ color: "info.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={2.4} lg={2.4}>
                      <Box bgcolor={"success.light"} textAlign="center">
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "120px",
                          }}
                        >
                          <FormControlLabel
                            control={
                              <CustomSwitch
                                checked={diger}
                                onChange={handleChangeDiger}
                                color="success"
                              />
                            }
                            label="Diğer"
                            labelPlacement="top"
                            sx={{ color: "success.main" }}
                          />
                        </CardContent>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
            {veriler.map((veri) => (
              <Grid
                key={veri.id}
                item
                xs={12}
                lg={12}
                mt="20px"
                onClick={() => handleCardClick(veri)}
              >
                <RaporGorusCard title={`${veri.baslik}`} />
              </Grid>
            ))}
          </Grid>
        )}
        {activeStep == 1 && (
          <Grid container spacing={3} mb={3} justifyContent={"center"}>
            <Grid item xs={12} sm={12} lg={12}>
              <Box bgcolor={"success.light"} textAlign="center">
                <CardContent
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "120px",
                  }}
                >
                  <FormControlLabel
                    control={
                      <CustomSwitch
                        checked={detayHesaplar}
                        onChange={handleChangeDetayHesaplar}
                        color="success"
                      />
                    }
                    label="Detay Hesaplar"
                    labelPlacement="top"
                    sx={{ color: "success.main" }}
                  />
                </CardContent>
              </Box>
            </Grid>
          </Grid>
        )}
        {activeStep == 2 && (
          <Grid container spacing={3} mb={3} wrap="wrap">
            <Grid item xs={12} sm={6} lg={6}>
              <Box bgcolor={"warning.light"} textAlign="center">
                <CardContent
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "180px",
                  }}
                >
                  <Grid container>
                    <Grid item xs={12} md={6} lg={6} mb={mdDown ? 3 : 0}>
                      <Typography
                        variant="subtitle1"
                        height={"100%"}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={mdDown ? "center" : "start"}
                      >
                        Kapak İçin Arka Plan Resmi Yükle
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                      <CustomSelect
                        labelId="resim"
                        id="resim"
                        size="small"
                        value={kapak}
                        onChange={handleChangeKapak}
                        height={"36px"}
                        fullWidth
                      >
                        <MenuItem value={"ResimSec"}>Resim Seç</MenuItem>
                        <MenuItem value={"Resim1"}>Resim 1</MenuItem>
                        <MenuItem value={"Resim2"}>Resim 2</MenuItem>
                        <MenuItem value={"Resim3"}>Resim 3</MenuItem>
                      </CustomSelect>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="upload-button"
                        type="file"
                        onChange={handleKapakImageChange}
                      />
                      <label htmlFor="upload-button">
                        <Button
                          size="medium"
                          variant="outlined"
                          color="primary"
                          component="span"
                        >
                          Resim Seç
                        </Button>
                      </label>
                    </Grid>
                  </Grid>
                </CardContent>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Box bgcolor={"warning.light"} textAlign="center">
                <CardContent
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "180px",
                  }}
                >
                  <Grid container>
                    <Grid item xs={4} md={4} lg={4} mb={mdDown ? 3 : 0}>
                      <Typography
                        variant="subtitle1"
                        height={"100%"}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={mdDown ? "center" : "start"}
                      >
                        Seçilen Resim:
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={8}
                      md={8}
                      lg={8}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      {kapakImage && (
                        <Box
                          sx={{
                            width: "113px", // A4 genişliğinin ölçeklenmiş hali
                            height: "160px", // A4 yüksekliğinin ölçeklenmiş hali
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={kapakImage}
                            alt="Arka Plan"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                            }}
                          />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Box bgcolor={"info.light"} textAlign="center">
                <CardContent
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "180px",
                  }}
                >
                  <Grid container justifyContent={"space-between"}>
                    <Grid item xs={12} md={6} lg={6} mb={mdDown ? 3 : 0}>
                      <Typography
                        variant="subtitle1"
                        height={"100%"}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={mdDown ? "center" : "start"}
                      >
                        Kapak İçin Firma Logosu Yükle
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="upload-button2"
                        type="file"
                        onChange={handleFirmaLogoImageChange}
                      />
                      <label htmlFor="upload-button2">
                        <Button
                          size="medium"
                          variant="outlined"
                          color="primary"
                          component="span"
                        >
                          Logo Seç
                        </Button>
                      </label>
                    </Grid>
                  </Grid>
                </CardContent>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Box bgcolor={"info.light"} textAlign="center">
                <CardContent
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "180px",
                  }}
                >
                  <Grid container>
                    <Grid item xs={4} md={4} lg={4} mb={mdDown ? 3 : 0}>
                      <Typography
                        variant="subtitle1"
                        height={"100%"}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={mdDown ? "center" : "start"}
                      >
                        Seçilen Logo:
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={8}
                      md={8}
                      lg={8}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      {firmaLogoImage && (
                        <Box
                          sx={{
                            width: "174px",
                            height: "100px",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={firmaLogoImage}
                            alt="Logo"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                            }}
                          />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Box>
            </Grid>
            {firmaLogoImage && (
              <>
                <Grid item xs={12} sm={6} lg={6}>
                  <Box bgcolor={"info.light"} textAlign="center">
                    <CardContent
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "180px",
                      }}
                    >
                      <Grid container justifyContent={"space-between"}>
                        <Grid item xs={12} md={6} lg={6} mb={mdDown ? 3 : 0}>
                          <Typography
                            variant="subtitle1"
                            height={"100%"}
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={mdDown ? "center" : "start"}
                          >
                            Firma Logosu Dikey Konum
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={3} lg={3}>
                          <CustomSelect
                            labelId="dikeyKonum"
                            id="dikeyKonum"
                            size="small"
                            value={dikeyKonum}
                            onChange={handleChangeDikeyKonum}
                            height={"36px"}
                            fullWidth
                          >
                            <MenuItem value={"Ust"}>Üst</MenuItem>
                            <MenuItem value={"Alt"}>Alt</MenuItem>
                          </CustomSelect>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Box bgcolor={"info.light"} textAlign="center">
                    <CardContent
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "180px",
                      }}
                    >
                      <Grid container justifyContent={"space-between"}>
                        <Grid item xs={12} md={6} lg={6} mb={mdDown ? 3 : 0}>
                          <Typography
                            variant="subtitle1"
                            height={"100%"}
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={mdDown ? "center" : "start"}
                          >
                            Firma Logosu Yatay Konum
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={3} lg={3}>
                          <CustomSelect
                            labelId="yatayKonum"
                            id="yatayKonum"
                            size="small"
                            value={yatayKonum}
                            onChange={handleChangeYatayKonum}
                            height={"36px"}
                            fullWidth
                          >
                            <MenuItem value={"Sol"}>Sol</MenuItem>
                            <MenuItem value={"Orta"}>Orta</MenuItem>
                            <MenuItem value={"Sag"}>Sağ</MenuItem>
                          </CustomSelect>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        )}
        {activeStep == 3 && !smDown && (
          <Grid container spacing={3} mb={3} wrap="wrap">
            <Grid
              item
              xs={12}
              sm={12}
              lg={12}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Button
                type="button"
                size="medium"
                variant="outlined"
                color="primary"
                startIcon={<IconFileTypePdf width={18} />}
                onClick={createPDF}
                sx={{ marginRight: 3 }}
              >
                Pdf Olarak İndir
              </Button>
              <Button
                type="button"
                size="medium"
                variant="outlined"
                color="primary"
                startIcon={<IconFileTypeDoc width={18} />}
                onClick={createWord}
              >
                Word Olarak İndir
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              lg={12}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              {user.denetimTuru == "Bobi" ? (
                <Rapor
                  kapakImage={kapakImage || ""}
                  firmaLogoImage={firmaLogoImage || ""}
                  dikeyKonum={dikeyKonum}
                  yatayKonum={yatayKonum}
                  fdt={fdtData}
                  kzt={kztdata}
                  nat={natData}
                  ozktCari={ozkDataCari}
                  ozktOnceki={ozkDataOnceki}
                  ozkDikeyCari={ozkDikeyDataCari}
                  ozkDikeyOnceki={ozkDikeyDataOnceki}
                  ozkYatayCari={ozkYatayDataCari}
                  ozkYatayOnceki={ozkYatayDataOnceki}
                  dipnotVeriler={dipnotVeriler}
                  gorusVeriler={veriler}
                  detayHesaplar={detayHesaplar}
                />
              ) : user.denetimTuru == "Tfrs" ? (
                <RaporTfrs
                  kapakImage={kapakImage || ""}
                  firmaLogoImage={firmaLogoImage || ""}
                  dikeyKonum={dikeyKonum}
                  yatayKonum={yatayKonum}
                  fdt={fdtData}
                  kzt={kztdata}
                  nat={natData}
                  ozktCari={ozkDataCari}
                  ozktOnceki={ozkDataOnceki}
                  ozkDikeyCari={ozkDikeyDataCari}
                  ozkDikeyOnceki={ozkDikeyDataOnceki}
                  ozkYatayCari={ozkYatayDataCari}
                  ozkYatayOnceki={ozkYatayDataOnceki}
                  dipnotVeriler={dipnotVeriler}
                  gorusVeriler={veriler}
                  detayHesaplar={detayHesaplar}
                />
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        )}
        <Box sx={{ display: "flex", flexDirection: "row", px: 1 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Önceki
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          {isStepOptional(activeStep) && (
            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
              Atla
            </Button>
          )}
          {activeStep === 2 ? (
            <Button onClick={handleNext}>Rapor Oluştur</Button>
          ) : (
            activeStep !== 3 && <Button onClick={handleNext}>Sonraki</Button>
          )}
        </Box>
        {isPopUpOpen && (
          <PopUpComponent
            isPopUpOpen={isPopUpOpen}
            gorusVeriler={gorusVeriler}
            handleUpdate={handleUpdate}
            handleClose={handleClosePopUp}
            setGorusVeriler={setGorusVeriler}
          />
        )}
      </>
    </Box>
  );
};

export default BagimsizDenetciRaporuStepper;

interface PopUpProps {
  isPopUpOpen: boolean;
  gorusVeriler: Veri[];
  handleUpdate: () => void;
  handleClose: () => void;
  setGorusVeriler: (x: Veri[]) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  isPopUpOpen,
  gorusVeriler,
  handleUpdate,
  handleClose,
  setGorusVeriler,
}) => {
  return (
    <Dialog fullWidth maxWidth={"md"} open={isPopUpOpen} onClose={handleClose}>
      {isPopUpOpen && (
        <>
          <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Typography variant="h4" py={1} px={3}>
                {gorusVeriler[0].baslik}
              </Typography>

              <IconButton size="small" onClick={handleClose}>
                <IconX size="18" />
              </IconButton>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            {gorusVeriler.map((veri) => (
              <Box key={veri.id} px={3} pt={3}>
                <RaporGorusEditor
                  id={veri.id}
                  text={veri.text}
                  gorusVeriler={gorusVeriler}
                  setGorusVeriler={setGorusVeriler}
                />
              </Box>
            ))}
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
            <Button
              variant="outlined"
              color="success"
              onClick={handleUpdate}
              sx={{ width: "20%" }}
            >
              Kaydet
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              sx={{ width: "20%" }}
            >
              Vazgeç
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
