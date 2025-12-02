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

// Document mappings for Üst Yönetim
const ustYonetimDocs = [
    { formKodu: "UstYonetimPolitikaBeyani", title: "3.1 Üst Yönetim ve Liderlik Yapısı Politikası Beyanı" },
    { formKodu: "SorumluluklarinVerilmesi", title: "3.2 Sorumlulukların Verilmesi" },
    { formKodu: "BelgelendirmePolitikasi", title: "1.1 Belgelendirme Politikası Beyanı" },
    { formKodu: "KaliteYonetimSistemiEsas", title: "1.2 Kalite Yönetim Sistemi 'Esas' Belgesi" },
    { formKodu: "DenetimSirketininYapisi", title: "1.3 Denetim Şirketinin Yapısı" },
    { formKodu: "ProfesyonelPerformans", title: "7.5 Profesyonel Çalışanların Performansının Değerlendirilmesi" },
    { formKodu: "IdariPerformans", title: "7.6 İdari Çalışanların Performansının Gözden Geçirilmesi" },
    { formKodu: "IzlemeDuzeltme", title: "9.2 İzleme ve Düzeltme Süreci Politikası Beyanı" },
];

// Document mappings for Etik Hükümler
const etikHukumlerDocs = [
    { formKodu: "EtikHukumlerPolitika", title: "4.1 Etik Hükümler Politikası Beyanı" },
    { formKodu: "YillikBagimsizlikTaahhut", title: "4.2 Yıllık Bağımsızlık Taahhüdü" },
    { formKodu: "BagimsizlikSorunCozum", title: "4.3 Bağımsızlıkla İlgili Sorunları Çözüme Kavuşturma Formu" },
    { formKodu: "EtikMusteriArastirma", title: "5.2 Müşteri Araştırma Soruları" },
    { formKodu: "EtikMektubu", title: "5.4 Etik Mektubu" },
    { formKodu: "UzmanCalismalari", title: "6.3 Uzman Çalışmalarının Kullanılması" },
    { formKodu: "DisUzmanKontrol", title: "6.4 Dış Uzmanların Kullanılmasına İlişkin Kontrol Listesi" },
    { formKodu: "EgitimGelisim", title: "7.7 Eğitim ve Gelişim Kayıtları" },
    { formKodu: "YeniHizmetSaglayici", title: "7.9 Yeni Hizmet Sağlayıcı Talep Formu" },
    { formKodu: "MusteriSikayetKaydi", title: "9.5 Müşteri Şikâyet Kaydı" },
];

const Page: React.FC = () => {
    return (
        <PageContainer
            title="KYS Risk Matrisi"
            description="Tüm KYS Risk Matrisleri ve İlgili Belgeler"
        >
            <Breadcrumb title="Risk Matrisi" items={BCrumb} />

            <Box sx={{ mt: 3 }}>
                {/* 1. ÜST YÖNETİM VE LİDERLİK YAPISI */}
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

                {ustYonetimDocs.map((doc, index) => (
                    <Box key={index} sx={{ mb: 4 }} id={doc.formKodu}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            {doc.title}
                        </Typography>
                        <KysBelgeEditor formKodu={doc.formKodu} readOnly={true} />
                    </Box>
                ))}

                <Divider sx={{ my: 6, borderWidth: 2 }} />

                {/* 2. ETİK HÜKÜMLER */}
                <Typography variant="h4" sx={{ mb: 3, color: "#1976d2", fontWeight: 600, mt: 4 }}>
                    2 ETİK HÜKÜMLER - RİSK MATRİSİ
                </Typography>

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

                {etikHukumlerDocs.map((doc, index) => (
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
