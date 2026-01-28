"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import { Grid } from "@mui/material";
import KullaniciSozlesmeSaatleriLayout from "./KullaniciSozlesmeSaatleriLayout";
import KullaniciSozlesmeSaatleriTable from "@/app/(Uygulama)/components/Kullanici/KullaniciSozlesmeSaatleri/KullaniciSozlesmeSaatleriTable";
import KullaniciBoxAutocomplete from "@/app/(Uygulama)/components/Sozlesme/DenetimKadrosuAtama/AutoCompleteBox/KullaniciBoxAutoComplete";
import { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import NoUsersAlert from "@/app/(Uygulama)/components/Alerts/NoUsersAlert";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [personelId, setPersonelId] = useState(user.id);
  const [personelAdi, setPersonelAdi] = useState(user.kullaniciAdi);
  const [showNoUsersAlert, setShowNoUsersAlert] = useState(false);

  return (
    <KullaniciSozlesmeSaatleriLayout>
      <PageContainer
        title="Kullanıcı Sözleşme Saatleri"
        description="this is Kullanıcı Sözleşme Saatleri"
      >
        <Grid container>
          <Grid mb={3} size={12}>
            <KullaniciBoxAutocomplete
              initialValue={user.kullaniciAdi}
              onSelectAdi={(selectedPersonelAdi) =>
                setPersonelAdi(selectedPersonelAdi)
              }
              onSelectId={(selectedPersonelId) =>
                setPersonelId(selectedPersonelId)
              }
              onEmptyUsers={() => setShowNoUsersAlert(true)}
            />
          </Grid>
        </Grid>
        <ParentCard title={`${personelAdi} Sözleşme Saatleri`}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <KullaniciSozlesmeSaatleriTable personelId={personelId || 0} />
            </Grid>
          </Grid>
        </ParentCard>
      </PageContainer>
      <NoUsersAlert
        open={showNoUsersAlert}
        onClose={() => setShowNoUsersAlert(false)}
      />
    </KullaniciSozlesmeSaatleriLayout>
  );
};

export default Page;
