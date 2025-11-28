"use client";
import { Grid, Box } from "@mui/material";

// components
import AuthLogin from "./authForms/AuthLogin";
import PageContainer from "../(Uygulama)/components/Container/PageContainer";
import Logo from "../(Uygulama)/components/Layout/Shared/Logo/Logo";

interface LoginPageClientProps {
    imagePath: string;
}

export default function LoginPageClient({ imagePath }: LoginPageClientProps) {
    return (
        <PageContainer title="Giriş" description="Giriş Yap">
            <Grid container sx={{ height: "100vh", overflow: "hidden" }}>
                {/* Left Side - 80% with Random Image */}
                <Grid
                    item
                    xs={12}
                    lg={9.6} // 80% of 12 columns is 9.6
                    sx={{
                        flexBasis: { lg: "70% !important" },
                        maxWidth: { lg: "70% !important" },
                        display: { xs: "none", lg: "block" },
                        backgroundImage: imagePath ? `url(${imagePath})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        transition: "background-image 0.5s ease-in-out",
                    }}
                />

                {/* Right Side - 20% Login Form */}
                <Grid
                    item
                    xs={12}
                    lg={2.4} // 20% of 12 columns is 2.4
                    sx={{
                        flexBasis: { lg: "30% !important" },
                        maxWidth: { lg: "30% !important" },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        p: 4,
                        backgroundColor: "background.paper",
                        boxShadow: "0px 7px 30px 0px rgba(90, 114, 123, 0.11)",
                        zIndex: 1,
                    }}
                >
                    <Box
                        width="100%"
                        maxWidth="400px"
                        sx={{
                            p: 4,
                            borderRadius: "20px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)", // Fallback/Base
                            backdropFilter: "blur(10px)", // Glass effect if supported
                            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                            <Logo />
                        </Box>
                        <AuthLogin />
                    </Box>
                </Grid>
            </Grid>
        </PageContainer>
    );
}
