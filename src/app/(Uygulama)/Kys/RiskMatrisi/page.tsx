"use client";

import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box, Divider, Tabs, Tab } from "@mui/material";
import dynamic from "next/dynamic";

import { documentMapping, riskMatrixSections as sections, KYS_PATH_TO_FORM_KODU } from "@/api/Kys/KysRiskMatrixConstants";
const KysRiskMatrixEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysRiskMatrixEditor"), { ssr: false });
const KysBelgeShow = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysBelgeShow"), { ssr: false });
const KysCalismaKagidiShow = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysCalismaKagidiShow"), { ssr: false });
const KysCalismaKagidiUcSutunluShow = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysCalismaKagidiUcSutunluShow"), { ssr: false });
const KysEditorShow = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditorShow"), { ssr: false });
const KysRiskMatrixExport = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysRiskMatrixExport"), { ssr: false });
const KysRelatedDocumentsPopup = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysRelatedDocumentsPopup"), { ssr: false });

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}


const BCrumb = [
    {
        to: "/Kys",
        title: "KYS",
    },
    {
        to: "/Kys/RiskMatrisi",
        title: "Risk Matrisi",
    },
];


const Page: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState(0);
    const [selectedDoc, setSelectedDoc] = React.useState<string | null>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSelectedDoc(null);
    };

    const handleLinkClick = (link: string) => {
        // First check if the path matches our KYS mapping
        if (KYS_PATH_TO_FORM_KODU[link]) {
            setSelectedDoc(KYS_PATH_TO_FORM_KODU[link]);
            return;
        }

        // Fallback to extraction if not found in mapping
        let target = link;
        if (link.includes("/")) {
            const parts = link.split("/");
            target = parts[parts.length - 1];
        }

        setSelectedDoc(target);
    };

    return (
        <PageContainer
            title="Kalite Yönetim Sistemi - Risk Matrisi"
            description="KYS Risk Matrisi ve İlgili Belgeler"
        >
            <Breadcrumb title="Risk Matrisi" items={BCrumb} />

            <Box sx={{ mt: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="Risk Matrisi Bölümleri">
                        {sections.map((section, index) => (
                            <Tab key={index} label={section.label} id={`simple-tab-${index}`} />
                        ))}
                        <Tab label="7. Dışa Aktar" id={`simple-tab-export`} />
                    </Tabs>
                </Box>

                {sections.map((section, index) => (
                    <CustomTabPanel key={index} value={activeTab} index={index}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            {section.title}
                        </Typography>

                        {/* Editable Risk Matrix */}
                        <KysRiskMatrixEditor
                            kategoriKodu={section.kategoriKodu}
                            onLinkClick={handleLinkClick}
                        />

                        <Divider sx={{ my: 4 }} />

                        {/* Interactive Related Documents Popup */}
                        <KysRelatedDocumentsPopup
                            documentKeys={section.documents}
                            selectedKey={selectedDoc}
                            onClose={() => setSelectedDoc(null)}
                        />
                    </CustomTabPanel>
                ))}

                <CustomTabPanel value={activeTab} index={sections.length}>
                    <KysRiskMatrixExport />
                </CustomTabPanel>
            </Box>
        </PageContainer>
    );
};

export default Page;
