import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/BilgiVeIletisim", title: "8. Bilgi ve İletişim" },
    { to: "/Kys/BilgiVeIletisim/KulturDegerlendirmesi", title: "8.2 Kültür Değerlendirmesi – Kalite" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="Kültür Değerlendirmesi – Bilgi ve İletişim (3.6)"
            description="Kültür Değerlendirmesi – Bilgi ve İletişim (3.6)"
        >
            <Breadcrumb title="Kültür Değerlendirmesi – Bilgi ve İletişim (3.6)" items={BCrumb} />
            <KysCalismaKagidi formKodu="BilgiVeIletisimKulturDegerlendirmesi" alanAdi="8.2 Kültür Değerlendirmesi – Bilgi ve İletişim (3.6)" />
        </PageContainer>
    );
};

export default Page;
