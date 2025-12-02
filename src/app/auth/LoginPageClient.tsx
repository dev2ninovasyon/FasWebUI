"use client";
import { Grid, Box, useTheme } from "@mui/material";
import Image from "next/image";

// components
import AuthLogin from "./authForms/AuthLogin";
import PageContainer from "../(Uygulama)/components/Container/PageContainer";
import Logo from "../(Uygulama)/components/Layout/Shared/Logo/Logo";
import { useEffect, useRef, useState } from "react";

interface LoginPageClientProps {
    imagePath: string;
}

export default function LoginPageClient({ imagePath }: LoginPageClientProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const cardBgColor = isDark
        ? "rgba(0, 0, 0, 0.70)"
        : "rgba(255, 255, 255, 0.90)";
    const cardTextColor = isDark ? "#ffffff" : "#111111";
    const panelBgColor = isDark
        ? "transparent"
        : theme.palette.background.paper;
    
    return (
        <PageContainer title="Giriş" description="Giriş Yap">
            <Box sx={{position: "relative", height:"100vh", overflow: "hidden"}}>
                {imagePath && (
                    <Box
                        sx={{
                            display:{xs: "block", lg:"none"},
                            position:"absolute",
                            inset:0,
                            zIndex:0,
                        }}
                    >
                    <Image
                        src={imagePath}
                        alt="Login Background"
                        fill
                        priority
                        quality={95}
                        sizes="100vw"
                        style={{
                                objectFit: "cover",
                                objectPosition: "center",
                                opacity: 0.80, 
                                filter: "blur(1px)",
                            }}
                    />
                    </Box>
                )}
            
            <Grid container sx={{ 
                height: "100vh", position: "relative", zIndex: 1, }}>
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
                        borderRadius:0,
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
                                borderRadius:0,
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
                        // Büyük ekranda beyaz panel, küçük ekranda transparan
                        backgroundColor: {xs:"transparent", lg: panelBgColor},
                        boxShadow: "0px 7px 30px 0px rgba(90, 114, 123, 0.11)",
                        position: "relative",
                        overflow: "hidden",
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        "&:hover": {
                            boxShadow: {
                                xs: "none",
                                lg: "0px 16px 40px rgba(90, 114, 123, 0.25)",
                            },
                            transform: { lg: "translateY(-4px)" },         
                        },
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
                                borderRadius:0,
                            }}
                        >
                            <Image
                            src={imagePath}
                            alt="Login background Faint"
                            fill
                            priority
                            quality={95}
                            sizes="30vw"
                            style={{
                                objectFit: "cover",
                                objectPosition: "center",
                                opacity: 0.80, 
                                filter: "blur(25px)",
                            }}
                            
                        />
                        </Box>
                    )}
                
                    <Box
                        width="100%"
                        maxWidth="400px"
                        sx={{
                            p: 4,
                            borderRadius: "20px",
                            backgroundColor: cardBgColor, // Fallback/Base
                            backdropFilter: "blur(10px)", // Glass effect if supported
                            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
                            //mobil-küçük ekran arka planı
                            position:"relative",
                            zIndex: 1,
                            transition: "transform 0.25s ease, box-shadow 0.25s ease",
                            "&:hover": {
                                boxShadow: "0 14px 40px rgba(0, 0, 0, 0.25)",
                                transform: "translateY(-3px)",
                        },
                        
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                            <Logo />
                        </Box>
                        <AuthLogin />
                    </Box>
                </Grid>
            </Grid>
            </Box>
        </PageContainer>
    );
}
