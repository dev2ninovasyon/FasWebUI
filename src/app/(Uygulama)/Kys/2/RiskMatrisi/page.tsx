"use client";
import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box, Divider } from "@mui/material";
import dynamic from "next/dynamic";
import { KYS_PATH_TO_FORM_KODU } from "@/api/Kys/KysRiskMatrixConstants";
const KysRiskMatrixEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysRiskMatrixEditor"), { ssr: false });
const KysRelatedDocumentsPopup = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysRelatedDocumentsPopup"), { ssr: false });


const BCrumb = [
    {
        to: "/Kys",
        title: "KYS",
    },
    {
        to: "/Kys/2",
        title: "KYS-2",
    },
    {
        to: "/Kys/2/RiskMatrisi",
        title: "Risk Matrisi",
    },
];

// Documents to display
const relatedDocumentKeys = ["4.1", "4.2", "4.3", "5.2", "5.4", "6.3", "6.4", "7.7", "7.9", "9.5"];

const Page: React.FC = () => {
    const [selectedDoc, setSelectedDoc] = React.useState<string | null>(null);

    const handleLinkClick = (link: string) => {
        if (KYS_PATH_TO_FORM_KODU[link]) {
            setSelectedDoc(KYS_PATH_TO_FORM_KODU[link]);
            return;
        }

        let target = link;
        if (link.includes("/")) {
            const parts = link.split("/");
            target = parts[parts.length - 1];
        }

        setSelectedDoc(target);
    };

    return (
        <PageContainer
            title="Etik Hükümler - Risk Matrisi"
            description="Etik Hükümler Risk Matrisi ve İlgili Belgeler"
        >
            <Breadcrumb title="Risk Matrisi" items={BCrumb} />

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Örnek Risk Matrisi: Kalite Yönetimi
                </Typography>

                {/* Editable Risk Matrix */}
                <KysRiskMatrixEditor
                    kategoriKodu="EtikHukumler"
                    onLinkClick={handleLinkClick}
                />

                <Divider sx={{ my: 4 }} />

                {/* Interactive Related Documents Popup */}
                <KysRelatedDocumentsPopup
                    documentKeys={relatedDocumentKeys}
                    selectedKey={selectedDoc}
                    onClose={() => setSelectedDoc(null)}
                />
            </Box>
        </PageContainer>
    );
};

export default Page;
