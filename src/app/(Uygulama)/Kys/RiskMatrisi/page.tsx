import React from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Typography, Box, Divider } from "@mui/material";
import KysRiskMatrixEditor from "@/app/(Uygulama)/components/Kys/KysRiskMatrixEditor";
import KysBelgeEditor from "@/app/(Uygulama)/components/Kys/KysBelgeEditor";

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

// Mapping of document titles to formKodu
const documentMapping: Record<string, { formKodu: string; title: string }> = {
    "3.1": { formKodu: "UstYonetimPolitikaBeyani", title: "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı" },
    "3.2": { formKodu: "SorumluluklarinVerilmesi", title: "3.2 Sorumlulukların Verilmesi" },
    "1.1": { formKodu: "BelgelendirmePolitikasi", title: "1.1 Belgelendirme Politikası Beyanı" },
    "1.2": { formKodu: "KaliteYonetimSistemiEsas", title: "1.2 Kalite Yönetim Sistemi 'Esas' Belgesi" },
    "1.3": { formKodu: "DenetimSirketininYapisi", title: "1.3 Denetim Şirketinin Yapısı" },
    "7.5": { formKodu: "ProfesyonelPerformans", title: "7.5 Profesyonel Çalışanların Performansının Değerlendirilmesi" },
    "7.6": { formKodu: "IdariPerformans", title: "7.6 İdari Çalışanların Performansının Gözden Geçirilmesi" },
    "9.2": { formKodu: "IzlemeDuzeltme", title: "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" },
};

// Documents to display (extracted from risk matrix actions)
const relatedDocuments = [
    documentMapping["3.1"],
    documentMapping["3.2"],
    documentMapping["1.1"],
    documentMapping["1.2"],
    documentMapping["1.3"],
    documentMapping["7.5"],
    documentMapping["7.6"],
    documentMapping["9.2"],
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="Üst Yönetim ve Liderlik Yapısı - Risk Matrisi"
            description="Üst Yönetim ve Liderlik Yapısı Risk Matrisi ve İlgili Belgeler"
        >
            <Breadcrumb title="Risk Matrisi" items={BCrumb} />

            <Box sx={{ mt: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600 }}>
                    1 ÜST YÖNETİM VE LİDERLİK YAPISI - RİSK MATRİSİ
                </Typography>

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Örnek Risk Matrisi: Kalite Yönetimi
                </Typography>

                {/* Editable Risk Matrix */}
                <KysRiskMatrixEditor kategoriKodu="UstYonetim" />

                <Divider sx={{ my: 4 }} />

                {/* Related Documents - Read Only */}
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    İlgili Belgeler
                </Typography>

                {relatedDocuments.map((doc, index) => (
                    <Box key={index} sx={{ mb: 4 }} id={doc.formKodu}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            {doc.title}
                        </Typography>
                        <KysBelgeEditor formKodu={doc.formKodu} readOnly={true} />
                    </Box>
                ))}
            </Box>
        </PageContainer>
    );
};

export default Page;
