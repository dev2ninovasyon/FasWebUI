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
        to: "/Kys/EtikHukumler",
        title: "Etik Hükümler",
    },
    {
        to: "/Kys/EtikHukumler/YillikBagimsizlikTaahhudu",
        title: "4.2 Yıllık Bağımsızlık Taahhüdü",
    },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="4.2 Yıllık Bağımsızlık Taahhüdü"
            description="4.2 Yıllık Bağımsızlık Taahhüdü"
        >
            <Breadcrumb title="4.2 Yıllık Bağımsızlık Taahhüdü" items={BCrumb} />
            <KysBelgeEditor formKodu="YillikBagimsizlikTaahhudu" />
        </PageContainer>
    );
};

export default Page;
