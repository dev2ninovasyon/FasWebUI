"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Grid } from "@mui/material";
import EDefterIncelemeForm from "@/app/(Uygulama)/components/Veri/EDefterInceleme/EDefterIncelemeForm";
import { useEffect, useState } from "react";
import EDefterInceleme from "./EDefterInceleme";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";

const BCrumb = [
  {
    to: "/Veri",
    title: "Veri",
  },
  {
    to: "/Veri/EDefterInceleme",
    title: "E-Defter İnceleme",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [hesapNo, setHesapNo] = useState("");
  const [baslangicTarihi, setBaslangicTarihi] = useState(`${user.yil}-01-01`);
  const [bitisTarihi, setBitisTarihi] = useState(`${user.yil}-12-31`);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [verileriGetirTiklandimi, setVerileriGetirTiklandimi] = useState(false);

  useEffect(() => {
    if (verileriGetirTiklandimi) {
      setIsAlertOpen(true);
      setOpenCartAlert(true);
    } else {
      setIsAlertOpen(false);
      setOpenCartAlert(false);
    }
  }, [verileriGetirTiklandimi]);

  return (
    <PageContainer
      title="E-Defter İnceleme"
      description="this is E-Defter İnceleme"
    >
      <Breadcrumb title="E-Defter İnceleme" items={BCrumb} />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={12}>
          <EDefterIncelemeForm
            hesapNo={hesapNo}
            baslangicTarihi={baslangicTarihi}
            bitisTarihi={bitisTarihi}
            setHesapNo={setHesapNo}
            setBaslangicTarihi={setBaslangicTarihi}
            setBitisTarihi={setBitisTarihi}
            setVerileriGetirTiklandimi={setVerileriGetirTiklandimi}
          />
        </Grid>
      </Grid>

      <Grid container marginTop={3}>
        <Grid item xs={12} lg={12}>
          <EDefterInceleme
            hesapNo={hesapNo}
            baslangicTarihi={baslangicTarihi}
            bitisTarihi={bitisTarihi}
            verileriGetirTiklandimi={verileriGetirTiklandimi}
            setVerileriGetirTiklandimi={setVerileriGetirTiklandimi}
          />
        </Grid>
      </Grid>
      {isAlertOpen ? (
        <InfoAlertCart
          openCartAlert={openCartAlert}
          setOpenCartAlert={setOpenCartAlert}
        />
      ) : (
        <></>
      )}
    </PageContainer>
  );
};

export default Page;
