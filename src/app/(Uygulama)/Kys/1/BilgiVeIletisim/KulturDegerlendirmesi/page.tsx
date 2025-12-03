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
        to: "/Kys/1/BilgiVeIletisim/KulturDegerlendirmesi",
        title: "Kültür Değerlendirmesi – Bilgi ve İletişim (3.6)",
    },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="Kültür Değerlendirmesi – Bilgi ve İletişim (3.6)"
            description="Kültür Değerlendirmesi – Bilgi ve İletişim (3.6)"
        >
            <Breadcrumb title="Kültür Değerlendirmesi – Bilgi ve İletişim (3.6)" items={BCrumb} />
            <KysBelgeEditor formKodu="BilgiVeIletisimKulturDegerlendirmesi" />
        </PageContainer>
    );
};

export default Page;
