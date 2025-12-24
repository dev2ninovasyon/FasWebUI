"use client";

import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box, Divider, Tabs, Tab } from "@mui/material";
import dynamic from "next/dynamic";

const KysRiskMatrixEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysRiskMatrixEditor"), { ssr: false });
const KysBelgeShow = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysBelgeShow"), { ssr: false });
const KysCalismaKagidiShow = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysCalismaKagidiShow"), { ssr: false });
const KysCalismaKagidiUcSutunluShow = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysCalismaKagidiUcSutunluShow"), { ssr: false });
const KysEditorShow = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditorShow"), { ssr: false });
const KysRiskMatrixExport = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysRiskMatrixExport"), { ssr: false });

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

import { documentMapping, riskMatrixSections as sections } from "@/api/Kys/KysRiskMatrixConstants";

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

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
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
                        <KysRiskMatrixEditor kategoriKodu={section.kategoriKodu} />

                        <Divider sx={{ my: 4 }} />

                        {/* Related Documents - Read Only */}
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                            İlgili Belgeler
                        </Typography>

                        {section.documents.map((docKey, docIndex) => {
                            const doc = documentMapping[docKey];
                            if (!doc) return null;
                            return (
                                <Box key={docIndex} sx={{ mb: 4 }} id={doc.formKodu}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        {doc.title}
                                    </Typography>
                                    {doc.type === 1 && <KysCalismaKagidiShow formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 2 && <KysEditorShow formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 3 && <KysCalismaKagidiUcSutunluShow formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 4 && <KysBelgeShow formKodu={doc.formKodu} />}
                                </Box>
                            );
                        })}
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
