import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

const BCrumb = [
    { to: "/Kys", title: "KYS" },
    { to: "/Kys/EtikHukumler", title: "4. Etik Hükümler" },
    { to: "/Kys/EtikHukumler/PolitikaBeyani", title: "4.1 Etik Hükümler Politikası Beyanı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="4.1 Etik Hükümler Politikası Beyanı"
            description="4.1 Etik Hükümler Politikası Beyanı"
        >
            <Breadcrumb title="4.1 Etik Hükümler Politikası Beyanı" items={BCrumb} />
            <KysBelgeEditor formKodu="EtikHukumlerPolitikaBeyani" />
        </PageContainer>
    );
};

export default Page;
