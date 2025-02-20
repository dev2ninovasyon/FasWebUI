"use client";

import InfoAlertCart from "@/app/(Uygulama)/components/Alerts/InfoAlertCart";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import IliskiliTaraflarMizanForm from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/IliskiliTaraflarMizanForm";
import IliskiliTaraflarMizanTable from "@/app/(Uygulama)/components/Musteri/IliskiliTaraflar/IliskiliTaraflarMizanTable";
import { Grid } from "@mui/material";
import { useEffect, useState } from "react";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/IliskiliTaraflar",
    title: "İlişkili Taraflar",
  },
  {
    to: "/Musteri/IliskiliTaraflar/MizandanIliskiliTarafTanimla",
    title: "Mizandan İlişkili Taraf Tanımla",
  },
];

const Page = () => {
  const [hesapNo, setHesapNo] = useState("");
  const [verileriGetirTiklandimi, setVerileriGetirTiklandimi] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [openCartAlert, setOpenCartAlert] = useState(false);

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
      title="Mizandan İlişkili Taraf Tanımla"
      description="this is Mizandan İlişkili Taraf Tanımla"
    >
      <Breadcrumb title="Mizandan İlişkili Taraf Tanımla" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={12}>
          <IliskiliTaraflarMizanForm
            hesapNo={hesapNo}
            setHesapNo={setHesapNo}
            setVerileriGetirTiklandimi={setVerileriGetirTiklandimi}
          />
        </Grid>
        <Grid item xs={12} lg={12}>
          <IliskiliTaraflarMizanTable
            hesapNo={hesapNo}
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
