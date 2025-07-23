"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import dynamic from "next/dynamic";
import PersonelBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import GorevTebligiLayout from "./GorevTebligiLayout";

const CustomEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditor"),
  { ssr: false }
);

const controller = "GorevTebligi";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [personelId, setPersonelId] = useState(user.id);
  const [personelAdi, setPersonelAdi] = useState(user.kullaniciAdi);

  return (
    <GorevTebligiLayout>
      <PageContainer title="Görev Tebliği" description="this is Görev Tebliği">
        <Grid container>
          <Grid item xs={12} mb={3}>
            <PersonelBoxAutocomplete
              initialValue={user.kullaniciAdi}
              tip={"Hepsi"}
              onSelectAdi={(selectedPersonelAdi) =>
                setPersonelAdi(selectedPersonelAdi)
              }
              onSelectId={(selectedPersonelId) =>
                setPersonelId(selectedPersonelId)
              }
            />
          </Grid>
        </Grid>
        <ParentCard title={`${personelAdi} Görev Tebliği`}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CustomEditor
                controller={controller}
                personelId={personelId || 0}
              />
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
    </GorevTebligiLayout>
  );
};

export default Page;
