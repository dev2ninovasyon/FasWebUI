"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DenetimDosyaTransferTable from "@/app/(Uygulama)/components/DigerIslemler/VeriAktarma/DenetimDosyaTransferTable";
import DenetimDosyaTransferForm from "@/app/(Uygulama)/components/DigerIslemler/VeriAktarma/DenetimDosyaTransferForm";
import { useState } from "react";
import ProtectedRoute from "@/app/ProtectedRoute";

const BCrumb = [
  {
    to: "/DenetimDosya",
    title: "Denetim Dosya",
  },
  {
    to: "/DenetimDosya/VeriAktarma",
    title: "Veri Aktarma",
  },
];

const Page = () => {
  const [kaynakId, setKaynakId] = useState(0);
  const [hedefId, setHedefId] = useState(0);
  const [kaynakYil, setKaynakYil] = useState(0);
  const [hedefYil, setHedefYil] = useState(0);

  const [kaynakDenetimTuru, setKaynakDenetimTuru] = useState("");

  const [verileriAktarTiklandimi, setVerileriAktarTiklandimi] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <PageContainer title="Veri Aktarma" description="this is Veri Aktarma">
        <Breadcrumb title="Veri Aktarma" items={BCrumb} />
        <Grid container>
          <Grid item xs={12} lg={12} mb={3}>
            <DenetimDosyaTransferForm
              kaynakId={kaynakId}
              hedefId={hedefId}
              kaynakYil={kaynakYil}
              hedefYil={hedefYil}
              kaynakDenetimTuru={kaynakDenetimTuru}
              setKaynakId={setKaynakId}
              setHedefId={setHedefId}
              setKaynakYil={setKaynakYil}
              setHedefYil={setHedefYil}
              setKaynakDenetimTuru={setKaynakDenetimTuru}
              setVerileriAktarTiklandimi={setVerileriAktarTiklandimi}
            />
          </Grid>
          {kaynakId !== 0 &&
            hedefId !== 0 &&
            kaynakYil !== 0 &&
            hedefYil !== 0 && (
              <Grid item xs={12} lg={12} mb={3}>
                <DenetimDosyaTransferTable
                  kaynakId={kaynakId}
                  hedefId={hedefId}
                  kaynakYil={kaynakYil}
                  hedefYil={hedefYil}
                  kaynakDenetimTuru={kaynakDenetimTuru}
                  setKaynakId={setKaynakId}
                  setHedefId={setHedefId}
                  setKaynakYil={setKaynakYil}
                  setHedefYil={setHedefYil}
                  verileriAktarTiklandimi={verileriAktarTiklandimi}
                  setVerileriAktarTiklandimi={setVerileriAktarTiklandimi}
                />
              </Grid>
            )}
        </Grid>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default Page;
