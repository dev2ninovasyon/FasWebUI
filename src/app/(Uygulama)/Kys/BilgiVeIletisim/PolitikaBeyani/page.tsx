import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KysCalismaKagidi from "@/app/(Uygulama)/components/Kys/KysCalismaKagidi";


import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/BilgiVeIletisim", title: "8. Bilgi ve İletişim" },
    { to: "/Kys/BilgiVeIletisim/PolitikaBeyani", title: "8.1 Bilgi ve İletişim Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="Bilgi ve İletişim Politikası Beyanı (8.1)"
            description="Bilgi ve İletişim Politikası Beyanı (8.1)"
        >
            <Breadcrumb title="Bilgi ve İletişim Politikası Beyanı (8.1)" items={BCrumb}>
        <EkBelgeYukleButton formKodu="KysBilgiVeIletisimPolitikasi" />
      </Breadcrumb>
            <KysCalismaKagidi formKodu="KysBilgiVeIletisimPolitikasi" alanAdi="Bilgi ve İletişim Politikası Beyanı (8.1)" />
        </PageContainer>
    );
};

export default Page;
