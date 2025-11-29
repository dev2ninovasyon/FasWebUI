"use client";
import { Grid, Box } from "@mui/material";
import Image from "next/image";

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
                {/* Left Side - 70% with Random Image */}
                <Grid
                    item
                    xs={12}
                    lg={9.6} // 80% of 12 columns is 9.6
                    sx={{
                        flexBasis: { lg: "70% !important" },
                        maxWidth: { lg: "70% !important" },
                        display: { xs: "none", lg: "block" },
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {imagePath && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                overflow: "hidden",
                            }}
                        >
                            <Image
                                src={imagePath}
                                alt="Login background"
                                fill
                                priority
                                quality={95}
                                sizes="70vw"
                                style={{
                                    objectFit: "cover",
                                    objectPosition: "center",
                                }}
                            />
                        </Box>
                    )}
                </Grid>

                {/* Right Side - 30% Login Form */}
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
