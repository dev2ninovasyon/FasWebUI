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
        to: "/Kys/2",
        title: "KYS-2",
    },
    {
        to: "/Kys/2/RiskMatrisi",
        title: "Risk Matrisi",
    },
];

// Mapping of document titles to formKodu
const documentMapping: Record<string, { formKodu: string; title: string }> = {
    "4.1": { formKodu: "EtikHukumlerPolitika", title: "4.1 Etik Hükümler Politikası Beyanı" },
    "4.2": { formKodu: "YillikBagimsizlikTaahhut", title: "4.2 Yıllık Bağımsızlık Taahhüdü" },
    "4.3": { formKodu: "BagimsizlikSorunCozum", title: "4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu" },
    "5.2": { formKodu: "EtikMusteriArastirma", title: "5.2 Müşteri Araştırma Soruları" },
    "5.4": { formKodu: "EtikMektubu", title: "5.4 Etik Mektubu" },
    "6.3": { formKodu: "UzmanCalismalari", title: "6.3 Uzman Çalışmalarının Kullanılması" },
    "6.4": { formKodu: "DisUzmanKontrol", title: "6.4 Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi" },
    "7.7": { formKodu: "EgitimGelisim", title: "7.7 Eğitim ve Gelişim Kayıtları" },
    "7.9": { formKodu: "YeniHizmetSaglayici", title: "7.9 Yeni Hizmet Sağlayıcı Talep Formu" },
    "9.5": { formKodu: "MusteriSikayetKaydi", title: "9.5 Müşteri Şikâyet Kaydı" },
};

// Documents to display (extracted from risk matrix actions)
const relatedDocuments = [
    documentMapping["4.1"],
    documentMapping["4.2"],
    documentMapping["4.3"],
    documentMapping["5.2"],
    documentMapping["5.4"],
    documentMapping["6.3"],
    documentMapping["6.4"],
    documentMapping["7.7"],
    documentMapping["7.9"],
    documentMapping["9.5"],
];

const Page: React.FC = () => {
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
                <KysRiskMatrixEditor kategoriKodu="EtikHukumler" />

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
