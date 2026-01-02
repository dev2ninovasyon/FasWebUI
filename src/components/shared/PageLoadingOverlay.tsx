"use client";
import React from "react";
import { Box, Backdrop, Skeleton, Stack } from "@mui/material";
import { useLoading } from "@/contexts/LoadingContext";

export default function PageLoadingOverlay() {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <Backdrop
            open={isLoading}
            sx={{
                zIndex: 9999,
                backgroundColor: 'rgba(255, 255, 255, 0.3)', // Daha şeffaf
                backdropFilter: 'blur(10px)', // Güçlü flu efekti
                WebkitBackdropFilter: 'blur(10px)',
            }}
        >
            <Box sx={{ width: '80%', maxWidth: 800 }}>
                <Stack spacing={2}>
                    <Skeleton variant="text" sx={{ fontSize: '3rem', width: '40%', bgcolor: 'rgba(0,0,0,0.08)' }} />
                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1, bgcolor: 'rgba(0,0,0,0.05)' }} />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Skeleton variant="rounded" width="100%" height={200} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }} />
                        <Skeleton variant="rounded" width="100%" height={200} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }} />
                    </Box>
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1, bgcolor: 'rgba(0,0,0,0.03)' }} />
                </Stack>
            </Box>
        </Backdrop>
    );
}