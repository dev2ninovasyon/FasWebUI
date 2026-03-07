"use client";
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, useTheme, Alert } from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

// components
import AuthLogin from "./authForms/AuthLogin";
import PageContainer from "../(Uygulama)/components/Container/PageContainer";
import Logo from "../(Uygulama)/components/Layout/Shared/Logo/Logo";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const slides = [
    {
        image: "/login-assets/login-bg-2.png",
        title: "Kapsamlı Denetim Yönetimi",
        description: "Tüm finansal denetim süreçlerinizi tek bir platformda yönetin. Kalite standartlarına uygun, izlenebilir denetim raporları oluşturun."
    },
    {
        image: "/login-assets/login-bg-3.png",
        title: "Gelişmiş Veri Analizi",
        description: "Güçlü analitik araçlar ile finansal verilerinizi derinlemesine inceleyin. Akıllı raporlama sistemi ile anlamlı içgörüler elde edin."
    },
    {
        image: "/login-assets/login-bg-4.png",
        title: "Ekip İşbirliği ve Görev Yönetimi",
        description: "Denetim ekibinizle gerçek zamanlı işbirliği yapın. Görev atama, ilerleme takibi ve dokümantasyon yönetimi tek bir arayüzde."
    },
    {
        image: "/login-assets/login-bg-5.png",
        title: "Kalite Yönetim Sistemi (KYS)",
        description: "ISO standartlarına uygun kalite yönetim süreçlerinizi dijitalleştirin. Belge yönetimi, risk analizi ve sürekli iyileştirme."
    },
    {
        image: "/login-assets/login-bg-no-person-1.png",
        title: "Sürdürülebilirlik Raporlaması",
        description: "Çevresel, sosyal ve kurumsal yönetim (ESG) metriklerinizi izleyin. Sürdürülebilirlik hedeflerinizi raporlayın ve değerlendirin."
    }
];

export default function LoginPageClient() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const router = useRouter();
    const user = useSelector((state: AppState) => state.userReducer);

    // Random start slide
    const [currentSlide, setCurrentSlide] = useState(() => Math.floor(Math.random() * slides.length));

    const [logoutReason, setLogoutReason] = useState<string | null>(null);

    // Eğer kullanıcı zaten giriş yapmışsa (token varsa), ana sayfaya yönlendir
    useEffect(() => {
        if (user?.token) {
            router.push("/Anasayfa");
        }

        // Logout nedenini oku ve sil
        if (typeof window !== "undefined") {
            const reason = window.sessionStorage.getItem("fas_logout_reason");
            if (reason) {
                setLogoutReason(reason);
                window.sessionStorage.removeItem("fas_logout_reason");
            }
        }
    }, [user?.token, router]);

    useEffect(() => {
        router.prefetch("/Anasayfa");
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [router]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const panelBgColor = isDark ? "rgba(17, 24, 39, 0.95)" : "#ffffff";
    const cardBgColor = isDark ? "rgba(0, 0, 0, 0.70)" : "rgba(255, 255, 255, 0.90)";

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey="6Ld2CyEsAAAAALNU5rSOM_Q2RAWkQ2RADbsS5NQW"
            scriptProps={{
                async: true,
                defer: true,
                appendTo: "head",
                nonce: undefined,
            }}
        >

            <PageContainer title="Giriş" description="Giriş Yap">
                <Box
                    sx={{
                        display: "flex",
                        height: "100vh",
                        overflow: "hidden",
                        flexDirection: { xs: "column-reverse", lg: "row" }
                    }}
                >
                    {/* Left Side - Login Form (30%) */}
                    <Box
                        sx={{
                            flex: { xs: 2, lg: 3 },
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            p: { xs: 3, sm: 4, lg: 6 },
                            backgroundColor: panelBgColor,
                            position: "relative",
                            zIndex: 10,
                            minHeight: { xs: "auto", lg: "100vh" }
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                maxWidth: "420px",
                            }}
                        >
                            {/* Logo & Brand */}
                            <Box display="flex" alignItems="center" justifyContent="flex-start" mb={5}>
                                <Logo />
                            </Box>

                            {/* Welcome Header */}
                            <Box mb={4}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        color: isDark ? "#fff" : "#0f172a",
                                        mb: 1
                                    }}
                                >
                                    Hoş Geldiniz
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: isDark ? "rgba(255,255,255,0.7)" : "#64748b",
                                        fontSize: "16px",
                                        mb: 3
                                    }}
                                >
                                    Devam etmek için lütfen giriş yapın.
                                </Typography>

                                {logoutReason && (
                                    <Alert
                                        severity={logoutReason === "manual" ? "info" : "warning"}
                                        variant="filled"
                                        sx={{
                                            mb: 3,
                                            borderRadius: 2,
                                            fontWeight: 500,
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                        }}
                                    >
                                        {logoutReason === "inactivity" && "30 dakikadır işlem yapılmadığı için güvenlik amacıyla oturumunuz sonlandırıldı. Lütfen tekrar giriş yapınız."}
                                        {logoutReason === "timeout" && "Oturum süreniz dolduğu için yeniden giriş yapmanız gerekiyor."}
                                        {logoutReason === "server_expired" && "Oturumunuzun süresi sunucu tarafında doldu. Lütfen tekrar giriş yapın."}
                                        {logoutReason === "manual" && "Başarıyla çıkış yapıldı."}
                                    </Alert>
                                )}
                            </Box>

                            {/* Login Form */}
                            <AuthLogin />
                        </Box>
                    </Box>

                    {/* Right Side - Image Slider (70%) */}
                    <Box
                        sx={{
                            flex: { xs: 1, lg: 7 },
                            position: "relative",
                            overflow: "hidden",
                            minHeight: { xs: "300px", lg: "100vh" },
                            backgroundColor: "#0f172a"
                        }}
                    >
                        {/* Slides */}
                        {slides.map((slide, index) => (
                            <Box
                                key={index}
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    opacity: currentSlide === index ? 1 : 0,
                                    transition: "opacity 1s ease-in-out",
                                    "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        background: "linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2))",
                                        zIndex: 1
                                    }
                                }}
                            >
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    priority={index === currentSlide}
                                    quality={95}
                                    sizes="70vw"
                                    style={{
                                        objectFit: "cover",
                                        objectPosition: "center"
                                    }}
                                />

                                {/* Slide Content */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: { xs: 30, sm: 40, lg: 60 },
                                        left: { xs: 20, sm: 40, lg: 60 },
                                        right: { xs: 20, sm: 40 },
                                        color: "white",
                                        zIndex: 2,
                                        maxWidth: "600px",
                                        opacity: currentSlide === index ? 1 : 0,
                                        transform: currentSlide === index ? "translateY(0)" : "translateY(20px)",
                                        transition: "all 0.8s ease 0.3s"
                                    }}
                                >
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontSize: { xs: "28px", sm: "36px", lg: "48px" },
                                            fontWeight: 800,
                                            mb: 2,
                                            lineHeight: 1.1,
                                            textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"
                                        }}
                                    >
                                        {slide.title}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: { xs: "14px", sm: "16px", lg: "18px" },
                                            lineHeight: 1.6,
                                            textShadow: "0 1px 5px rgba(0, 0, 0, 0.3)",
                                            opacity: 0.9
                                        }}
                                    >
                                        {slide.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}

                        {/* Indicators */}
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: { xs: 20, lg: 40 },
                                right: { xs: 20, lg: 40 },
                                display: "flex",
                                gap: 1.25,
                                zIndex: 20
                            }}
                        >
                            {slides.map((_, index) => (
                                <Box
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: "50%",
                                        backgroundColor: currentSlide === index
                                            ? "white"
                                            : "rgba(255, 255, 255, 0.3)",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        transform: currentSlide === index ? "scale(1.2)" : "scale(1)",
                                        "&:hover": {
                                            backgroundColor: currentSlide === index
                                                ? "white"
                                                : "rgba(255, 255, 255, 0.5)"
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </PageContainer>
        </GoogleReCaptchaProvider>
    );
}
