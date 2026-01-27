"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import dynamic from "next/dynamic";
import { documentMapping } from "@/api/Kys/KysRiskMatrixConstants";
import { useDispatch } from "@/store/hooks";
import { setCollapse } from "@/store/customizer/CustomizerSlice";

const KysBelgeEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysBelgeEditor"), { ssr: false });
const KysCalismaKagidi = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysCalismaKagidi"), { ssr: false });
const KysCalismaKagidiUcSutunlu = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysCalismaKagidiUcSutunlu"), { ssr: false });
const KysEditor = dynamic(() => import("@/app/(Uygulama)/components/Kys/KysEditor"), { ssr: false });

interface KysRelatedDocumentsPopupProps {
    documentKeys: string[];
    selectedKey?: string | null;
    onClose?: () => void;
}

const KysRelatedDocumentsPopup: React.FC<KysRelatedDocumentsPopupProps> = ({ documentKeys, selectedKey, onClose }) => {
    const dispatch = useDispatch();
    const [userForceExpanded, setUserForceExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    React.useEffect(() => {
        if (selectedKey) {
            // Find the index of the document with this formKodu or key
            const index = documentKeys.findIndex(k => k === selectedKey || documentMapping[k]?.formKodu === selectedKey);
            if (index !== -1) {
                setActiveTab(index);
                setUserForceExpanded(true);
                dispatch(setCollapse(true)); // Auto-collapse sidebar when document opens
            }
        } else {
            setUserForceExpanded(false);
        }
    }, [selectedKey, documentKeys, dispatch]);

    const expanded = userForceExpanded;

    React.useEffect(() => {
        if (expanded) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [expanded]);

    if (!documentKeys || documentKeys.length === 0) return null;

    const currentDocKey = documentKeys[activeTab];
    const doc = documentMapping[currentDocKey];

    return (
        <Fade in={expanded} unmountOnExit>
            <Box
                sx={{
                    position: "fixed",
                    top: "55%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "calc(100% - 320px)",
                    maxWidth: "1500px",
                    height: "85vh",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Paper
                    elevation={15}
                    sx={{
                        height: "100%",
                        borderRadius: 4,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "#0f172a"
                                : "#f8fafc",
                        boxShadow: (theme) => theme.shadows[10],
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            height: "56px",
                            minHeight: "56px",
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            position: "relative",
                            justifyContent: "space-between",
                            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
                        }}
                    >
                        {/* Center: Document Title */}
                        <Box sx={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "70%",
                            textAlign: "center"
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                                {doc ? doc.title : "İlgili Belge"}
                            </Typography>
                        </Box>

                        {/* Right: Actions */}
                        <Box sx={{ ml: "auto" }}>
                            <IconButton
                                size="medium"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUserForceExpanded(false);
                                    if (onClose) onClose();
                                }}
                                sx={{
                                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                                    "&:hover": { bgcolor: "error.main", color: "white" },
                                    width: 36,
                                    height: 36
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Content Area */}
                    <Box sx={{ flexGrow: 1, p: 0.5, overflowY: "auto", bgcolor: "background.default" }}>
                        {doc ? (
                            <Box sx={{ maxWidth: "1200px", mx: "auto", p: 2 }}>


                                <Box sx={{ bgcolor: "background.paper", borderRadius: 2 }}>
                                    {doc.type === 1 && <KysCalismaKagidi formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 2 && <KysEditor formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 3 && <KysCalismaKagidiUcSutunlu formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 4 && <KysBelgeEditor formKodu={doc.formKodu} baslik={doc.title} />}
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "text.secondary" }}>
                                <Typography>Lütfen bir belge seçin.</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Fade>
    );
};

export default KysRelatedDocumentsPopup;
