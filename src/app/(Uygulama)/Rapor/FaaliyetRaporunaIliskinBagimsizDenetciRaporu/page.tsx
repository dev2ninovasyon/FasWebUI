"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import dynamic from "next/dynamic";
import {
  Button,
  Fab,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { useEffect, useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  deleteAllCalismaKagidiVerileri,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { IconExclamationMark } from "@tabler/icons-react";
import { getGorevAtamalariByDenetlenenIdYil } from "@/api/Sozlesme/DenetimKadrosuAtama";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";

const CustomEditorWVeri = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditorWVeri"),
  { ssr: false }
);

const BCrumb = [
  {
    to: "/Rapor",
    title: "Rapor",
  },
  {
    to: "/Rapor/FaaliyetRaporunaIliskinBagimsizDenetciRaporu",
    title: "Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu",
  },
];

interface Veri {
  id: number;
  metin: string;
}

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [sozlesmeTarihi, setSozlesmeTarihi] = useState<string>("");

  const [tempSozlesmeTarihi, setTempSozlesmeTarihi] = useState(sozlesmeTarihi);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [rows, setRows] = useState([]);

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const controller = "FaaliyetRaporunaIliskinBagimsizDenetciRaporu"


  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllCalismaKagidiVerileri(
        controller || "",
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (result) {
        fetchData();
      } else {
        console.error("Çalışma Kağıdı Verileri silme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const sozlesmeVerileri =
        await getCalismaKagidiVerileriByDenetciDenetlenenYil(
          controller,
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );
      if (sozlesmeVerileri?.length > 0) {
        setTempSozlesmeTarihi(
          sozlesmeVerileri[0].sozlesmeTarihi?.split("T")[0] || ""
        );
        setSozlesmeTarihi(
          sozlesmeVerileri[0].sozlesmeTarihi?.split("T")[0] || ""
        );

        const newVeri = sozlesmeVerileri.map((veri: any) => ({
          id: veri.id,
          metin: veri.metin,
        }));
        setVeriler(newVeri);
console.log(newVeri)

      } else {
        console.warn("No data found");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData2 = async () => {
    try {
      const denetimKadrosuVerileri = await getGorevAtamalariByDenetlenenIdYil(
        user.token || "",
        user.denetlenenId || 0,
        user.yil || 0
      );
      const newRows = denetimKadrosuVerileri.map((veri: any) => ({
        kullaniciAdi: veri.kullaniciAdi,
        unvanAdi: veri.unvanAdi,
        asilYedek: veri.asilYedek,
        calismaSaati: veri.calismaSaati,
        saatBasiUcreti: veri.saatBasiUcreti,
        denetimUcreti: veri.denetimUcreti,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchData2();
  }, []);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleDeleteAll();
      setIsClickedVarsayilanaDon(false);
    }
  }, [isClickedVarsayilanaDon]);

 
  return (
    <>
      <Breadcrumb title="Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu" items={BCrumb}>
        <>
          <Grid
            container
            sx={{
              width: "95%",
              height: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid
              item
              xs={12}
              md={12}
              lg={12}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
                 <Button
                size="medium"
                variant="outlined"
                color="primary"
                disabled={isClickedVarsayilanaDon}
                onClick={() => setIsClickedVarsayilanaDon(true)}
                sx={{ width: "100%" }}
              >
                <Typography
                  variant="body1"
                  sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                >
                  Varsayılana Dön
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </>
      </Breadcrumb>
      <PageContainer
        title="Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu"
        description="this is Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu"
      >
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={12}
            lg={12}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <CustomFormLabel
              htmlFor="sozlesmeTarihi"
              sx={{
                mt: 0,
                mb: { xs: "-10px", sm: 0 },
                mr: 2,
                whiteSpace: "nowrap",
              }}
            >
              <Typography variant="subtitle1">Sözleşme Tarihi:</Typography>
            </CustomFormLabel>
            <CustomTextField
              id="sozlesmeTarihi"
              type="date"
              value={tempSozlesmeTarihi}
              onChange={(e: any) => setTempSozlesmeTarihi(e.target.value)}
              onBlur={() => setSozlesmeTarihi(tempSozlesmeTarihi)}
            />
            <Tooltip title="Sözleşme Tarihi Girmeyi Unutmayınız">
              <Fab color="warning" size="small" sx={{ marginLeft: 2 }}>
                <IconExclamationMark width={18.25} height={18.25} />
              </Fab>
            </Tooltip>
          </Grid>
    
            <Grid item xs={12} sm={12} lg={12}>
              <CustomEditorWVeri
                controller={controller}
                veri={veriler[0]}
                sozlesmeTarihi={sozlesmeTarihi}
              />
            </Grid>
          
          
        </Grid>
      </PageContainer>
      {user.rol?.includes("KaliteKontrolSorumluDenetci") ||
      user.rol?.includes("SorumluDenetci") ||
      user.rol?.includes("Denetci") ||
      user.rol?.includes("DenetciYardimcisi") ? (
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
          }}
        >
          <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
            <BelgeKontrolCard
              fetch={() => {}}
              hazirlayan="Denetçi - Yardımcı Denetçi"
              controller={controller}
            ></BelgeKontrolCard>
          </Grid>
          <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
            <BelgeKontrolCard
              fetch={() => {}}
              onaylayan="Sorumlu Denetçi"
              controller={controller}
            ></BelgeKontrolCard>
          </Grid>
          <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
            <BelgeKontrolCard
              fetch={() => {}}
              kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
              controller={controller}
            ></BelgeKontrolCard>
          </Grid>
        </Grid>
      ) : (
        <></>
      )}
      <Grid
        container
        sx={{
          width: "95%",
          margin: "0 auto",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Grid item xs={12} lg={12} mt={5}>
          <IslemlerCard controller={controller} />
        </Grid>
      </Grid>
    </>
  );
};

export default Page;
