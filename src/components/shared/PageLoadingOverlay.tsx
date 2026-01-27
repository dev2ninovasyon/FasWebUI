"use client";
import React from "react";
import { Box, Skeleton, Grid, Stack, Fade, useTheme } from "@mui/material";
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
                    p: 3,
                }}
            >
                {/* Header/Breadcrumb Skeleton */}
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="30%" height={40} animation="wave" sx={{ mb: 1, borderRadius: 1 }} />
                    <Skeleton variant="text" width="20%" height={24} animation="wave" sx={{ borderRadius: 1 }} />
                </Box>

                <Grid container spacing={3}>
                    {/* Top Stats/Cards Skeleton */}
                    {[1, 2, 3, 4].map((item) => (
                        <Grid
                            key={item}
                            size={{
                                xs: 12,
                                sm: 6,
                                lg: 3
                            }}>
                            <Box sx={{
                                p: 3,
                                borderRadius: (theme.shape.borderRadius as number) / 5 || 2,
                                border: `1px solid ${theme.palette.divider}`,
                                backgroundColor: theme.palette.background.paper,
                                display: "flex",
                                alignItems: "center",
                                gap: 2
                            }}>
                                <Skeleton variant="circular" width={48} height={48} animation="wave" />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="60%" height={20} animation="wave" />
                                    <Skeleton variant="text" width="40%" height={28} animation="wave" />
                                </Box>
                            </Box>
                        </Grid>
                    ))}

                    {/* Main Content Area Skeleton */}
                    <Grid size={12}>
                        <Box sx={{
                            p: 3,
                            borderRadius: (theme.shape.borderRadius as number) / 5 || 2,
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.background.paper,
                            minHeight: 400
                        }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Skeleton variant="rectangular" width={200} height={36} animation="wave" sx={{ borderRadius: 1 }} />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Skeleton variant="circular" width={32} height={32} animation="wave" />
                                        <Skeleton variant="circular" width={32} height={32} animation="wave" />
                                    </Box>
                                </Box>

                                {/* Table-like Skeleton */}
                                <Skeleton variant="rectangular" width="100%" height={40} animation="wave" sx={{ borderRadius: 1 }} />
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                        <Skeleton variant="rectangular" sx={{ flex: 2, height: 32, borderRadius: 1 }} animation="wave" />
                                        <Skeleton variant="rectangular" sx={{ flex: 1, height: 32, borderRadius: 1 }} animation="wave" />
                                        <Skeleton variant="rectangular" sx={{ flex: 1, height: 32, borderRadius: 1 }} animation="wave" />
                                        <Skeleton variant="rectangular" sx={{ flex: 1, height: 32, borderRadius: 1 }} animation="wave" />
                                    </Box>
                                ))}

                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Skeleton variant="rectangular" width={120} height={40} animation="wave" sx={{ borderRadius: 1 }} />
                                </Box>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
}
