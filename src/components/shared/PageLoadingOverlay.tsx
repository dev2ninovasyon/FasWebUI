"use client";
import React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Fade from "@mui/material/Fade";
import { useTheme } from "@mui/material/styles";
import { useLoading } from "@/contexts/LoadingContext";

export default function PageLoadingOverlay() {
    const { isLoading } = useLoading();
    const theme = useTheme();

    if (!isLoading) return null;

    return (
        <Fade in={isLoading} timeout={150}>
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    minHeight: "calc(100vh - 170px)",
                    backgroundColor: theme.palette.background.default,
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 1000,
                    pointerEvents: "auto",
                    opacity: 0.95,
                }}
            >
                {/* Content skeleton */}
                <Box sx={{ p: 3, flex: 1 }}>
                    <Skeleton variant="text" width="40%" height={40} animation="wave" sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={120} animation="wave" sx={{ mb: 2 }} />
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Skeleton variant="rectangular" height={100} sx={{ flex: 1 }} animation="wave" />
                        <Skeleton variant="rectangular" height={100} sx={{ flex: 1 }} animation="wave" />
                        <Skeleton variant="rectangular" height={100} sx={{ flex: 1 }} animation="wave" />
                    </Box>
                    <Skeleton variant="rectangular" height={200} animation="wave" sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={150} animation="wave" />
                </Box>
            </Box>
        </Fade>
    );
}
