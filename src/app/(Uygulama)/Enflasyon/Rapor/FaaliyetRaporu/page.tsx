"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import React from "react";
import { Grid } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ProtectedPage from "@/app/ProtectedPage";
import EnflasyonIframe from "@/app/(Uygulama)/components/Enflasyon/EnflasyonIframe";

const BCrumb = [
    {
        to: "/Enflasyon",
        title: "Enflasyon",
    },
    {
        to: "/Enflasyon/Rapor",
        title: "Denetçi Raporu",
    },
    {
        to: "/Enflasyon/Rapor/FaaliyetRaporu",
        title: "Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu",
    },
];

const Page: React.FC = () => {
    const user = useSelector((state: AppState) => state.userReducer);

    return (
        <ProtectedPage allowed={user?.enflasyonmu || false}>
            <PageContainer
                title="Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu"
                description="this is Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu"
            >
                <Breadcrumb title="Faaliyet Raporuna İlişkin Bağımsız Denetçi Raporu" items={BCrumb} />
                <Grid container spacing={3} sx={{ height: "calc(100vh - 225px)", overflow: "hidden" }}>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            lg: 12
                        }} sx={{ height: "100%", position: "relative" }}>
                        <EnflasyonIframe url="/EnflasyonDuzeltmesi/FaaliyetRaporunaIliskinBagimsizDenetciRaporu" />
                    </Grid>
                </Grid>
            </PageContainer>
        </ProtectedPage>
    );
};

export default Page;
