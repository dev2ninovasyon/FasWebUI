import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    {
        to: "/Kys",
        title: "KYS",
    },
    {
        to: "/Kys/1",
        title: "KYS-1",
    },
    {
        to: "/Kys/1/BilgiVeIletisim",
        title: "Bilgi ve İletişim",
    },
    {
        to: "/Kys/1/BilgiVeIletisim/PolitikaBeyani",
        title: "Bilgi ve İletişim Politikası Beyanı (8.1)",
    },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="Bilgi ve İletişim Politikası Beyanı (8.1)"
            description="Bilgi ve İletişim Politikası Beyanı (8.1)"
        >
            <Breadcrumb title="Bilgi ve İletişim Politikası Beyanı (8.1)" items={BCrumb} />
            <KysBelgeEditor formKodu="BilgiVeIletisimPolitikaBeyani" />
        </PageContainer>
    );
};

export default Page;
