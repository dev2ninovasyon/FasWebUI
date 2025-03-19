"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import KullaniciBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/KullaniciBoxAutoComplete";
import { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import DenetciYillikTaahutnameLayout from "./DenetciYillikTaahutnameLayout";
import dynamic from "next/dynamic";

const CustomEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditor"),
  { ssr: false }
);

const controller = "YillikTaahhutname";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [personelId, setPersonelId] = useState(user.id);
  const [personelAdi, setPersonelAdi] = useState(user.kullaniciAdi);

  return (
    <DenetciYillikTaahutnameLayout>
      <PageContainer
        title="Denetçi Yıllık Taahhütname"
        description="this is Denetçi Yıllık Taahhütname"
      >
        <Grid container>
          <Grid item xs={12} mb={3}>
            <KullaniciBoxAutocomplete
              initialValue={user.kullaniciAdi}
              onSelect={(selectedPersonelAdi) =>
                setPersonelAdi(selectedPersonelAdi)
              }
              onSelectId={(selectedPersonelId) =>
                setPersonelId(selectedPersonelId)
              }
            />
          </Grid>
        </Grid>
        <ParentCard title={`${personelAdi} Yıllık Taahhütname`}>
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
    </DenetciYillikTaahutnameLayout>
  );
};

export default Page;
