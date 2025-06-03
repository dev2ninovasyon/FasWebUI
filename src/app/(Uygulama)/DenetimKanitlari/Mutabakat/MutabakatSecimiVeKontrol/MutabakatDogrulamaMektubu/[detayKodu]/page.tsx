"use client";

import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { getMutabakatDogrulamaMektubu } from "@/api/DenetimKanitlari/DenetimKanitlari";
import { usePathname } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import dynamic from "next/dynamic";

const CustomEditorWVeri = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditorWVeri"),
  { ssr: false }
);

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Mutabakat",
    title: "Mutabakat",
  },
  {
    to: "/DenetimKanitlari/Mutabakat/MutabakatSecimiVeKontrol",
    title: "Mutabakat Seçimi Ve Kontrol",
  },
  {
    to: "/DenetimKanitlari/Mutabakat/MutabakatSecimiVeKontrol/MutabakatDogrulamaMektubu",
    title: "Mutabakat Doğrulama Mektubu",
  },
];

interface Veri {
  id: number;
  metin: string;
}

const controller = "MutabakatDogrulamaMektubu";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("MutabakatDogrulamaMektubu") + 1;
  const pathDetayKodu = segments[idIndex];

  const [veriler, setVeriler] = useState<Veri>();

  const fetchData = async () => {
    try {
      const mutabakatDogrulamaMektubuVerileri =
        await getMutabakatDogrulamaMektubu(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          pathDetayKodu || ""
        );
      if (mutabakatDogrulamaMektubuVerileri) {
        const newVeri = {
          id: mutabakatDogrulamaMektubuVerileri.id,
          metin: mutabakatDogrulamaMektubuVerileri.metin,
        };
        setVeriler(newVeri);
      } else {
        console.warn("No data found");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <PageContainer
      title="Mutabakat Doğrulama Mektubu"
      description="this is Mutabakat Doğrulama Mektubu"
    >
      <Breadcrumb title="Mutabakat Doğrulama Mektubu" items={BCrumb} />
      <Grid container spacing={3}>
        {veriler && (
          <Grid item xs={12} lg={12}>
            <CustomEditorWVeri controller={controller} veri={veriler} />
          </Grid>
        )}
      </Grid>
    </PageContainer>
  );
};

export default Page;
