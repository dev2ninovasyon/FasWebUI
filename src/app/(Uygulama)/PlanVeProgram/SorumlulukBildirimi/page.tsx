"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box, Grid } from "@mui/material";
import { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import dynamic from "next/dynamic";
import PersonelBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import SorumlulukBildirimiLayout from "./SorumlulukBildirimiLayout";

const CustomEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditor"),
  { ssr: false }
);

const controller = "SorumlulukBildirimi";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [personelId, setPersonelId] = useState(user.id);
  const [personelAdi, setPersonelAdi] = useState(user.kullaniciAdi);

  return (
    <SorumlulukBildirimiLayout>
      <PageContainer
        title="Sorumluluk Bildirimi"
        description="this is Sorumluluk Bildirimi"
      >
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
        <Box>
          <CustomEditor controller={controller} personelId={personelId || 0} />
        </Box>
      </PageContainer>
    </SorumlulukBildirimiLayout>
  );
};

export default Page;
