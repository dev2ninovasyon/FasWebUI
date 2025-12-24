// src/app/(Uygulama)/components/Dashboards/DriverTour.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { driver, type DriveStep, type Config as DriverConfig } from "driver.js";
import "driver.js/dist/driver.css";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface DriverTourProps {
    run: boolean;       // true ise tur başlasın
    onClose: () => void; // tur bittiğinde / kapandığında çağrılacak
}

const DriverTour: React.FC<DriverTourProps> = ({ run, onClose }) => {
    const user = useSelector((state: AppState) => state.userReducer);

    const steps: DriveStep[] = useMemo(() => {

        const firmaAdi = user.denetlenenFirmaAdi || "Seçili şirket";

        const s: DriveStep[] = [];

        // Intro
        s.push({
            element: "null",
            popover: {
                title: `${firmaAdi} için denetim menü rehberi`,
                description:
                    `${firmaAdi} için aktif denetim süreci başlatıldı. ` +
                    "Bu rehber, sol taraftaki menü gruplarını sırayla tanıtarak hangi modülden hangi işlevlere ulaşabileceğinizi gösterir.",
                side: "bottom",
                align: "center",
                showButtons: ["next", "close"],
                doneBtnText: "Bitir",
                nextBtnText: "İleri",
                prevBtnText: "Geri",
            },
            disableActiveInteraction: false,
        });

        // Sidebar genel
        s.push({
            element: ".sidebarNav",
            popover: {
                title: "Menü alanı",
                description:
                    "Sol tarafta gördüğünüz bu alan, tüm denetim modüllerinin yer aldığı ana menüdür. Şimdi başlıca modül gruplarını tek tek gösterelim.",
                side: "right",
                align: "center",
                showButtons: ["next", "previous", "close"],
            },
            disableActiveInteraction: false,
        });

        // VERİ
        s.push({
            element: '.sidebarNav [data-tour-id="/Veri"]',
            popover: {
                title: "VERİ – Veri Girişi Modülü",
                description:
                    "Veri Girişi modülü, denetim sürecinin temelini oluşturan tüm veri toplama ve kayıt işlemlerini kapsar. Mizan, e-defter, fatura ve beyannameler gibi verileri buradan sisteme yüklersiniz.",
                side: "right",
                align: "center",
                showButtons: ["next", "previous", "close"],
            },
            disableActiveInteraction: true,
        });

        // MÜŞTERİ BELGELERİ
        s.push({
            element: '.sidebarNav [data-tour-id="/MusteriBelgeleri"]',
            popover: {
                title: "MÜŞTERİ BELGELERİ – Belgelerin Arşivlenmesi",
                description:
                    "Müşteri Belgeleri modülü, müşteriye ait sözleşme, yazışma, ek doküman ve diğer belgelerin dijital olarak saklandığı alandır.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        // HESAPLAMALAR
        s.push({
            element: '.sidebarNav [data-tour-id="/Hesaplamalar"]',
            popover: {
                title: "HESAPLAMALAR – Finansal ve Denetim Hesaplamaları",
                description:
                    "Hesaplamalar modülü; önemlilik ve örneklem, kıdem tazminatı, reeskont, kredi, kur farkı, yaşlandırma ve benzeri teknik hesaplama araçlarını içerir.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        // DÖNÜŞÜM
        s.push({
            element: '.sidebarNav [data-tour-id="/Donusum"]',
            popover: {
                title: "DÖNÜŞÜM – VUK’tan BOBİ/TFRS’ye Geçiş",
                description:
                    "Dönüşüm modülü; VUK kayıtlarının BOBİ FRS veya TFRS gibi standartlara dönüştürüldüğü, dönüşüm fişlerinin oluşturulduğu ve kontrol edildiği bölümdür.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        // PLAN VE PROGRAM
        s.push({
            element: '.sidebarNav [data-tour-id="/PlanVeProgram"]',
            popover: {
                title: "PLAN VE PROGRAM – Stratejik Planlama",
                description:
                    "Planlama modülü, denetim sürecinin stratejik planlamasını ve organizasyonunu içerir. Denetim programı, görev atamaları, risk değerlendirmeleri ve denetim stratejisini bu bölümden yönetirsiniz.",
                side: "right",
                align: "center",
                showButtons: ["next", "previous", "close"],
            },
            disableActiveInteraction: true,
        });

        //DENETİM KANITLARI
        s.push({
            element: '.sidebarNav [data-tour-id="/DenetimKanitlari"]',
            popover: {
                title: "DENETİM KANITLARI – Çalışma Kağıtları",
                description:
                    "Denetim Kanıtları modülü; tüm çalışma kağıtlarınızı, test sonuçlarını, mutabakatları, analitik incelemeleri ve diğer denetim kanıtlarını kaydettiğiniz ana bölümdür.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        //GENEL KURUL
        s.push({
            element: '.sidebarNav [data-tour-id="/GenelKurul"]',
            popover: {
                title: "GENEL KURUL – Toplantı ve İzleme Belgeleri",
                description:
                    "Genel Kurul modülü; genel kurul toplantısı görevlendirme, katılım, denetim çalışması izleme ve faaliyet raporuna ilişkin belgelerin üretildiği alandır.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        //RAPOR
        s.push({
            element: '.sidebarNav [data-tour-id="/Rapor"]',
            popover: {
                title: "RAPOR – Bağımsız Denetçi Raporları",
                description:
                    "Rapor modülü; bağımsız denetçi raporu, dipnotlar ve faaliyet raporuna ilişkin denetçi raporlarının hazırlandığı ve yönetildiği bölümdür.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        //DENETİM DOSYA
        s.push({
            element: '.sidebarNav [data-tour-id="/DenetimDosya"]',
            popover: {
                title: "DENETİM DOSYA – Çalışma Dosyası Kurgusu",
                description:
                    "Denetim Dosya modülü; denetim metodolojisi dokümanları ve tüm çalışma kağıtlarının yazdırma/arsiv dosyası kurgusunun izlendiği bölümdür.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        //KYS
        s.push({
            element: '.sidebarNav [data-tour-id="/Kys"]',
            popover: {
                title: "KYS – Kalite Yönetim Sistemi",
                description:
                    "KYS modülü; KGK KYS standardına uygun olarak kalite politikaları, risk değerlendirme süreci ve izleme-düzeltme faaliyetlerine ilişkin belgeleri içerir.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        //SÜRDÜRÜLEBİLİRLİK
        s.push({
            element: '.sidebarNav [data-tour-id="/Surdurulebilirlik"]',
            popover: {
                title: "SÜRDÜRÜLEBİLİRLİK – ESG Bilgi Formları",
                description:
                    "Sürdürülebilirlik modülü; çevresel, sosyal ve yönetişim (ESG) kapsamındaki genel bilgiler, çevresel etkiler, sosyal sorumluluk ve kurumsal yönetişim formlarını içerir.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        // ENFLASYON
        s.push({
            element: '.sidebarNav [data-tour-id="/Enflasyon"]',
            popover: {
                title: "ENFLASYON – Enflasyon Düzeltmesi Modülü",
                description:
                    "Enflasyon modülü; düzeltme katsayıları, reel olmayan finansman maliyeti, stok ve duran varlık düzeltmeleri ile enflasyonlu finansal tabloların oluşturulmasını sağlar.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        // KONSOLİDASYON
        s.push({
            element: '.sidebarNav [data-tour-id="/Konsolidasyon"]',
            popover: {
                title: "KONSOLİDASYON – Birleştirilmiş Finansal Tablolar",
                description:
                    "Konsolidasyon modülü; grup şirketlerinin mizanın birleştirilmesi, eliminasyon fişleri ve konsolide finansal tabloların oluşturulması süreçlerini yönetir.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        // DİĞER İŞLEMLER
        s.push({
            element: '.sidebarNav [data-tour-id="/DigerIslemler"]',
            popover: {
                title: "DİĞER İŞLEMLER – Arşiv ve Genel Ayarlar",
                description:
                    "Diğer İşlemler menüsü; arşiv, denetçi firma bilgileri, üyelik bilgileri ve veri aktarma gibi genel yönetim fonksiyonlarını içerir.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next", "close"],
            },
            disableActiveInteraction: true,
        });

        // KULLANIM KILAVUZU (son adım)
        s.push({
            element: '.sidebarNav [data-tour-id="/KullanimKilavuzu"]',
            popover: {
                title: "KULLANIM KILAVUZU – Yardım ve Dökümantasyon",
                description:
                    "Kullanım Kılavuzu; uygulamayı kullanırken ihtiyaç duyacağınız açıklamalar, ekran anlatımları ve yardım dokümanlarına ulaşmanızı sağlar. Rehber burada sona eriyor.",
                side: "right",
                align: "center",
                showButtons: ["previous", "next"],
                doneBtnText: "Tamamla",
            } as any,
            disableActiveInteraction: true,
        });

        return s;
    }, [user.denetlenenId, user.denetlenenFirmaAdi]);

    useEffect(() => {
        // Tur çalışmayacak durumlar
        if (!run) return;
        if (!steps || steps.length === 0) return;

        let tourCompleted = false;

        // Her run=true olduğunda YENİ bir driver instance oluştur
        const config: DriverConfig = {
            steps,
            animate: true,
            smoothScroll: true,
            overlayColor: "rgba(0,0,0,0.85)",
            overlayOpacity: 0.85,
            allowClose: true,
            overlayClickBehavior: "close",
            stagePadding: 8,
            stageRadius: 8,
            popoverOffset: 20,
            showProgress: true,
            nextBtnText: "İleri",
            prevBtnText: "Geri",
            doneBtnText: "Tamamla",
            onPopoverRender: (popover: any, { config, state }: any) => {
                // Son adımdayız ve "Tamamla" butonuna basıldığında
                const isLastStep = state.activeIndex === steps.length - 1;
                if (isLastStep) {
                    const doneBtn = popover.wrapper.querySelector('.driver-popover-close-btn');
                    if (doneBtn) {
                        doneBtn.addEventListener('click', () => {
                            tourCompleted = true;
                        });
                    }
                }
            },
            onDestroyStarted: () => {
                // Tur tamamlandıysa veya kapatıldıysa callback'i çağır
                onClose();
            },
            onCloseClick: () => {
                onClose();
            },
        };

        const driverObj = driver(config);
        driverObj.drive();

        // Component unmount olduğunda veya run false'a döndüğünde temizle
        return () => {
            driverObj.destroy();
        };
    }, [run, steps, onClose]);

    return null;
};

export default DriverTour;
