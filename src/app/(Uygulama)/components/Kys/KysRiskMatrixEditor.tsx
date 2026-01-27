"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CircularProgress,
    IconButton,
    Tooltip,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    Link as MuiLink,
    Autocomplete,
    Divider,
    useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getKysRiskMatrisi,
    updateKysRiskMatrisi,
    generateKysRiskMatrisiFullData,
    RiskMatrixData,
    RiskMatrixRow,
    RiskItem,
    RiskAction
} from "@/api/Kys/KysRiskMatrisi";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import BoltIcon from "@mui/icons-material/Bolt";
import { enqueueSnackbar } from "notistack";
import { v4 as uuidv4 } from 'uuid';
import KysRelatedDocumentsPopup from "./KysRelatedDocumentsPopup";
import { FloatingButtonCalismaKagitlari } from "../CalismaKagitlari/FloatingButtonCalismaKagitlari";
import { documentMapping, KYS_PATH_TO_FORM_KODU, riskMatrixSections } from "@/api/Kys/KysRiskMatrixConstants";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dynamic from 'next/dynamic';

const KysBelgeShow = dynamic(() => import("./KysBelgeShow"), { ssr: false });
const KysCalismaKagidiShow = dynamic(() => import("./KysCalismaKagidiShow"), { ssr: false });
const KysCalismaKagidiUcSutunluShow = dynamic(() => import("./KysCalismaKagidiUcSutunluShow"), { ssr: false });
const KysEditorShow = dynamic(() => import("./KysEditorShow"), { ssr: false });

interface KysRiskMatrixEditorProps {
    kategoriKodu: string;
    readOnly?: boolean;
    onLinkClick?: (link: string) => void;
}

const KysRiskMatrixEditor: React.FC<KysRiskMatrixEditorProps> = ({
    kategoriKodu,
    readOnly = false,
    onLinkClick,
}) => {
    const router = useRouter();
    const user = useSelector((state: AppState) => state.userReducer);
    const theme = useTheme();
    const customizer = useSelector((state: AppState) => state.customizer);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [matrisId, setMatrisId] = useState<number | null>(null);
    const [baslik, setBaslik] = useState<string>("");
    const [tableData, setTableData] = useState<RiskMatrixData>({ rows: [] });

    // Dialog States
    const [openRowDialog, setOpenRowDialog] = useState(false);
    const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null);
    const [editingRowData, setEditingRowData] = useState<RiskMatrixRow | null>(null);

    // AI & Document States
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiDismissed, setAiDismissed] = useState(false);
    const [isAiHovered, setIsAiHovered] = useState(false);
    const [aiLoaded, setAiLoaded] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [docRefreshKey, setDocRefreshKey] = useState<number>(0);

    // Focus tracking for AI
    const [focusedField, setFocusedField] = useState<{
        type: 'objective' | 'risk';
        index?: number;
    } | null>(null);
    const [isAiButtonHovered, setIsAiButtonHovered] = useState(false);
    const aiButtonRef = useRef<HTMLDivElement>(null);
    const isInteractingWithAi = useRef(false);

    const isMatrixEmpty = useCallback(() => {
        if (!tableData?.rows || tableData.rows.length === 0) return true;
        return tableData.rows.every(row => !row.risks || row.risks.length === 0);
    }, [tableData]);

    const fetchData = useCallback(async () => {
        if (!user.token) return;

        setLoading(true);
        const data = await getKysRiskMatrisi(
            user.token,
            kategoriKodu,
            user.denetciId,
            user.denetlenenId,
            user.yil
        );

        if (data) {
            setMatrisId(data.id);
            setBaslik(data.baslik || "");
            try {
                if (data.matrisJson && data.matrisJson !== "{}") {
                    const parsedData = JSON.parse(data.matrisJson);
                    setTableData(parsedData);
                }
            } catch (e) {
                console.log("JSON parse error:", e);
            }
        }
        setLoading(false);
    }, [user.token, user.denetciId, user.denetlenenId, user.yil, kategoriKodu]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Helper for Persisting Data ---
    const saveDataToBackend = async (newData: RiskMatrixData) => {
        if (!user.token) return;

        setSaving(true);
        try {
            // If we have an ID, update. If not, create? 
            // In this specific scenario, we rely on seeded data, so matrisId should exist. 
            // If it doesn't, we might need to handle create, but let's prioritize update for now as user said "seed data exists".
            if (matrisId) {
                const result = await updateKysRiskMatrisi(user.token, matrisId, kategoriKodu, newData, baslik);
                if (result) {
                    enqueueSnackbar("Değişiklikler kaydedildi.", { variant: "success", autoHideDuration: 2000 });
                } else {
                    enqueueSnackbar("Kaydedilirken hata oluştu.", { variant: "error" });
                }
            } else {
                // Handle Create Case if needed (though rare with seeding)
                const result = await import("@/api/Kys/KysRiskMatrisi").then(m => m.createKysRiskMatrisi(
                    user.token!,
                    kategoriKodu,
                    baslik || "Yeni Risk Matrisi",
                    newData,
                    user.denetciId,
                    user.denetlenenId,
                    user.yil
                ));
                if (result) {
                    setMatrisId(result.id);
                    enqueueSnackbar("Yeni matris oluşturuldu ve kaydedildi.", { variant: "success" });
                }
            }
        } catch (error) {
            console.log("Auto-save error:", error);
            enqueueSnackbar("Kaydetme hatası.", { variant: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateFullData = async () => {
        if (!user.token || !user.denetciId || !user.denetlenenId || !user.yil) return;

        setIsGenerating(true);
        try {
            const result = await generateKysRiskMatrisiFullData(
                user.token,
                kategoriKodu,
                user.denetciId,
                user.denetlenenId,
                user.yil
            );

            if (result) {
                setMatrisId(result.id);
                setBaslik(result.baslik || "");
                if (result.matrisJson) {
                    setTableData(JSON.parse(result.matrisJson));
                }
                enqueueSnackbar("Riskler ve İşler başarıyla oluşturuldu!", { variant: "success" });
                setAiDismissed(true); // Hide assistant after generation
            } else {
                enqueueSnackbar("Veriler oluşturulurken bir hata oluştu.", { variant: "error" });
            }
        } catch (error) {
            console.log("AI Generation error:", error);
            enqueueSnackbar("AI servis hatası.", { variant: "error" });
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Row Management (Objective Level) ---
    const addObjectiveRow = () => {
        const newData = { ...tableData };
        // Determine the next letter
        const lastLetter = newData.rows.length > 0 ? newData.rows[newData.rows.length - 1].objective.letter : "";
        let nextLetter = "a";
        if (lastLetter && lastLetter.length === 1) {
            const charCode = lastLetter.charCodeAt(0);
            nextLetter = String.fromCharCode(charCode + 1);
        } else if (lastLetter) {
            nextLetter = lastLetter + "x";
        }

        const newRow: RiskMatrixRow = {
            objective: {
                letter: nextLetter,
                title: "Yeni Kalite Hedefi",
                items: []
            },
            risks: [
                { id: uuidv4(), text: "Yeni Risk", actions: [] }
            ]
        };

        if (!newData.rows) newData.rows = [];
        newData.rows.push(newRow);

        setTableData(newData);
        saveDataToBackend(newData);
    };

    const deleteObjectiveRow = (rowIndex: number) => {
        if (!confirm("Bu hedefi ve tüm risklerini silmek istediğinize emin misiniz?")) return;
        const newData = { ...tableData };
        newData.rows.splice(rowIndex, 1);

        // Re-assign letters? Optional but good for consistency
        newData.rows.forEach((row, idx) => {
            // Basic re-lettering logic (a, b, c...)
            row.objective.letter = String.fromCharCode(97 + idx); // 97 is 'a'
        });

        setTableData(newData);
        saveDataToBackend(newData);
    };

    // --- Unified Row Dialog Handler ---
    const handleOpenRowDialog = (rowIndex: number) => {
        if (readOnly) return;
        setCurrentRowIndex(rowIndex);
        const row = JSON.parse(JSON.stringify(tableData.rows[rowIndex]));

        // MERGE LOGIC: Combine Title + Items into Title
        if (row.objective.items && row.objective.items.length > 0) {
            row.objective.title = row.objective.title + "\n\n" + row.objective.items.join("\n");
            row.objective.items = [];
        }

        setEditingRowData(row);
        setOpenRowDialog(true);
    };

    const saveRowChanges = () => {
        if (currentRowIndex !== null && editingRowData) {
            const newData = { ...tableData };
            newData.rows[currentRowIndex] = editingRowData;
            setTableData(newData);
            setOpenRowDialog(false);
            setEditingRowData(null);
            setFocusedField(null);
            saveDataToBackend(newData);
        }
    };

    // Helper functions for editing row data
    const updateObjectiveTitle = (val: string) => {
        if (!editingRowData) return;
        setEditingRowData({
            ...editingRowData,
            objective: { ...editingRowData.objective, title: val }
        });
    };

    const addRisk = () => {
        if (!editingRowData) return;
        const newRisks = [...(editingRowData.risks || [])];
        newRisks.push({ id: uuidv4(), text: "", actions: [] });
        setEditingRowData({ ...editingRowData, risks: newRisks });
    };

    const removeRisk = (riskIdx: number) => {
        if (!editingRowData) return;
        const newRisks = [...(editingRowData.risks || [])];
        newRisks.splice(riskIdx, 1);
        setEditingRowData({ ...editingRowData, risks: newRisks });
    };

    const updateRiskText = (riskIdx: number, val: string) => {
        if (!editingRowData) return;
        const newRisks = [...(editingRowData.risks || [])];
        newRisks[riskIdx].text = val;
        setEditingRowData({ ...editingRowData, risks: newRisks });
    };

    const addActionToRisk = (riskIdx: number) => {
        if (!editingRowData) return;
        const newRisks = [...(editingRowData.risks || [])];
        const newActions = [...(newRisks[riskIdx].actions || [])];
        newActions.push({ id: uuidv4(), text: "" });
        newRisks[riskIdx].actions = newActions;
        setEditingRowData({ ...editingRowData, risks: newRisks });
    };

    const removeActionFromRisk = (riskIdx: number, actionIdx: number) => {
        if (!editingRowData) return;
        const newRisks = [...(editingRowData.risks || [])];
        const newActions = [...(newRisks[riskIdx].actions || [])];
        newActions.splice(actionIdx, 1);
        newRisks[riskIdx].actions = newActions;
        setEditingRowData({ ...editingRowData, risks: newRisks });
    };

    const updateActionText = (riskIdx: number, actionIdx: number, docKey: string) => {
        if (!editingRowData) return;
        const newRisks = [...(editingRowData.risks || [])];
        const newActions = [...(newRisks[riskIdx].actions || [])];

        // Get document info from mapping
        const doc = documentMapping[docKey];
        if (doc) {
            newActions[actionIdx].text = `${docKey} ${doc.title}`;
            newActions[actionIdx].link = docKey; // Store the doc key for later use
        }

        newRisks[riskIdx].actions = newActions;
        setEditingRowData({ ...editingRowData, risks: newRisks });
    };


    // ... (previous helper functions)


    const getDocKey = (action: { link?: string; text: string }): string | null => {
        // 1. Try to extract "X.Y" from text (most reliable for labeled items)
        const match = action.text.match(/^(\d+\.\d+)\s/);
        if (match && documentMapping[match[1]]) {
            return match[1];
        }

        // 2. Try from Link if it exists
        if (action.link) {
            // If link is literally "X.Y" (unlikely but possible cleanup)
            if (documentMapping[action.link]) return action.link;

            // Map URL path to FormKodu
            const formKodu = KYS_PATH_TO_FORM_KODU[action.link];
            if (formKodu) {
                // Find the key (X.Y) that corresponds to this FormKodu
                const foundKey = Object.keys(documentMapping).find(k => documentMapping[k].formKodu === formKodu);
                if (foundKey) return foundKey;
            }
        }

        return null;
    };

    const handleActionClick = (e: React.MouseEvent, docKey: string) => {
        e.stopPropagation();
        setSelectedDoc(docKey);
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer component={Paper} elevation={3} sx={{ border: 1, borderColor: "divider" }}>
                <Table sx={{ minWidth: 800 }} size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                            <TableCell sx={{
                                fontWeight: "bold",
                                color: "text.primary",
                                width: "35%",
                                borderRight: "1px solid",
                                borderBottom: "1px solid",
                                borderColor: "rgba(224, 224, 224, 1)"
                            }}>
                                Kalite Hedefleri
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "text.primary", width: "30%", borderRight: "1px solid", borderBottom: "1px solid", borderColor: "rgba(224, 224, 224, 1)" }}>Kalite Riskleri</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "text.primary", width: "35%", borderBottom: "1px solid", borderColor: "rgba(224, 224, 224, 1)" }}>Risklere Karşı Yapılacak İşler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.rows.map((row, rowIndex) => {
                            const riskCount = row.risks?.length || 0;
                            // Effective rows = Risks + 1 (for the "Add Risk" placeholder row)
                            const totalSpan = riskCount + 1;

                            return (
                                <React.Fragment key={rowIndex}>
                                    {/* FIRST ROW OF THE GROUP */}
                                    <TableRow hover>
                                        {/* OBJECTIVE CELL (Spans all risks + footer) */}
                                        <TableCell
                                            rowSpan={totalSpan}
                                            sx={{
                                                verticalAlign: "top",
                                                p: 2,
                                                borderRight: "1px solid",
                                                borderBottom: "1px solid",
                                                borderColor: "rgba(224, 224, 224, 1)",
                                                bgcolor: "background.default"
                                            }}
                                        >
                                            <Box
                                                onClick={() => handleOpenRowDialog(rowIndex)}
                                                sx={{ cursor: readOnly ? "default" : "pointer", height: "100%" }}
                                            >
                                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: "text.primary" }}>
                                                    ({row.objective.letter}) {row.objective.title || "Başlık Yok"}
                                                </Typography>
                                                {row.objective.items && row.objective.items.length > 0 && (
                                                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem" }}>
                                                        {row.objective.items.map((item, i) => (
                                                            <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {!readOnly && (
                                                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography variant="caption" color="text.secondary">Düzenle</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>

                                        {/* RISK & ACTION CELL 0 */}
                                        {riskCount > 0 ? (
                                            <>
                                                <TableCell
                                                    sx={{
                                                        verticalAlign: "top",
                                                        p: 1.5,
                                                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                                                        borderBottom: "1px solid rgba(224, 224, 224, 1)",
                                                        cursor: "pointer"
                                                    }}
                                                    onClick={() => handleOpenRowDialog(rowIndex)}
                                                >
                                                    <Typography variant="body2">{row.risks[0].text}</Typography>
                                                </TableCell>
                                                <TableCell
                                                    sx={{ verticalAlign: "top", p: 1.5, borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                                                >
                                                    {row.risks[0].actions?.map((act, idx) => {
                                                        const docKey = getDocKey(act);
                                                        return (
                                                            <Box key={idx} sx={{ mb: 0.5 }}>
                                                                {docKey ? (
                                                                    <MuiLink
                                                                        component="button"
                                                                        variant="body2"
                                                                        onClick={(e) => handleActionClick(e, docKey)}
                                                                        sx={{
                                                                            textAlign: "left",
                                                                            verticalAlign: "top",
                                                                            textDecoration: "underline",
                                                                            color: "primary.main",
                                                                            cursor: "pointer",
                                                                            fontWeight: 500,
                                                                            transition: "all 0.2s ease",
                                                                            "&:hover": {
                                                                                color: "primary.dark",
                                                                                backgroundColor: "action.hover",
                                                                                textDecoration: "underline",
                                                                                transform: "translateX(2px)"
                                                                            }
                                                                        }}
                                                                    >
                                                                        {act.text}
                                                                    </MuiLink>
                                                                ) : (
                                                                    <Typography variant="body2">
                                                                        {act.text}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </TableCell>
                                            </>
                                        ) : (
                                            <TableCell
                                                colSpan={2}
                                                sx={{ p: 1.5, bgcolor: "action.hover", cursor: "pointer", verticalAlign: "middle", borderBottom: "1px solid", borderColor: "rgba(224, 224, 224, 1)" }}
                                                onClick={() => handleOpenRowDialog(rowIndex)}
                                            >
                                                <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", fontWeight: "bold", textAlign: "center", opacity: 0.5 }}>
                                                    â€“
                                                </Typography>
                                            </TableCell>
                                        )}
                                    </TableRow>

                                    {/* MIDDLE ROWS (Risk 1 to N-1) */}
                                    {row.risks.slice(1).map((risk, idx) => {
                                        const actualIndex = idx + 1; // since we skipped 0
                                        return (
                                            <TableRow key={`${rowIndex}-${actualIndex}`} hover>
                                                <TableCell
                                                    sx={{
                                                        verticalAlign: "top",
                                                        p: 1.5,
                                                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                                                        borderBottom: "1px solid rgba(224, 224, 224, 1)",
                                                        cursor: "pointer"
                                                    }}
                                                    onClick={() => handleOpenRowDialog(rowIndex)}
                                                >
                                                    <Typography variant="body2">{risk.text}</Typography>
                                                </TableCell>
                                                <TableCell
                                                    sx={{ verticalAlign: "top", p: 1.5, borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                                                >
                                                    {risk.actions?.map((act, actIdx) => {
                                                        const docKey = getDocKey(act);
                                                        return (
                                                            <Box key={actIdx} sx={{ mb: 0.5 }}>
                                                                {docKey ? (
                                                                    <MuiLink
                                                                        component="button"
                                                                        variant="body2"
                                                                        onClick={(e) => handleActionClick(e, docKey)}
                                                                        sx={{
                                                                            textAlign: "left",
                                                                            verticalAlign: "top",
                                                                            textDecoration: "underline",
                                                                            color: "primary.main",
                                                                            cursor: "pointer",
                                                                            fontWeight: 500,
                                                                            transition: "all 0.2s ease",
                                                                            "&:hover": {
                                                                                color: "primary.dark",
                                                                                backgroundColor: "action.hover",
                                                                                textDecoration: "underline",
                                                                                transform: "translateX(2px)"
                                                                            }
                                                                        }}
                                                                    >
                                                                        {act.text}
                                                                    </MuiLink>
                                                                ) : (
                                                                    <Typography variant="body2">
                                                                        {act.text}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}

                                    {/* FOOTER ROW ("Add Risk") */}
                                    {riskCount === 0 ? (
                                        null
                                    ) : (
                                        <TableRow hover>
                                            <TableCell
                                                colSpan={2}
                                                sx={{ p: 1.5, bgcolor: "action.hover", cursor: "pointer", borderBottom: "1px solid", borderColor: "rgba(224, 224, 224, 1)" }}
                                                onClick={() => handleOpenRowDialog(rowIndex)}
                                            >
                                                <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", fontWeight: "bold", textAlign: "center", opacity: 0.5 }}>
                                                    â€“
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            {!readOnly && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={addObjectiveRow}>
                        Yeni Hedef Ekle
                    </Button>
                </Box>
            )}
            {/* --- UNIFIED ROW EDIT DIALOG --- */}
            <Dialog open={openRowDialog} onClose={() => {
                setOpenRowDialog(false);
                setFocusedField(null);
            }} maxWidth="lg" fullWidth>
                <DialogTitle>Satır Düzenle</DialogTitle>
                <DialogContent dividers>
                    {editingRowData && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {/* SECTION 1: Kalite Hedefi */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}>
                                    Kalite Hedefi
                                </Typography>
                                <TextField
                                    id="ai-field-objective"
                                    label="Hedef ve Detayları"
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    maxRows={8}
                                    value={editingRowData.objective.title || ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateObjectiveTitle(e.target.value)}
                                    onFocus={() => setFocusedField({ type: 'objective' })}
                                    onBlur={(e: React.FocusEvent) => {
                                        setTimeout(() => {
                                            if (isInteractingWithAi.current) return;
                                            if (!document.activeElement?.id?.startsWith("ai-field-")) {
                                                setFocusedField(null);
                                            }
                                        }, 200);
                                    }}
                                    helperText="Tüm hedef açıklamasını ve maddelerini bu alana giriniz."
                                />
                            </Box>

                            {/* SECTION 2: Riskler ve İşler */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}>
                                    Riskler ve İşler
                                </Typography>

                                {editingRowData.risks?.map((risk, riskIdx) => (
                                    <Box
                                        key={risk.id || riskIdx}
                                        sx={{
                                            mb: 3,
                                            p: 2,
                                            border: 1,
                                            borderColor: "divider",
                                            borderRadius: 1,
                                            bgcolor: "background.default"
                                        }}
                                    >
                                        {/* Risk Header */}
                                        <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "flex-start" }}>
                                            <TextField
                                                id={`ai-field-risk-${riskIdx}`}
                                                label={`Risk ${riskIdx + 1}`}
                                                fullWidth
                                                multiline
                                                rows={2}
                                                value={risk.text}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRiskText(riskIdx, e.target.value)}
                                                onFocus={() => setFocusedField({ type: 'risk', index: riskIdx })}
                                                onBlur={(e: React.FocusEvent) => {
                                                    setTimeout(() => {
                                                        if (isInteractingWithAi.current) return;
                                                        if (!document.activeElement?.id?.startsWith("ai-field-")) {
                                                            setFocusedField(null);
                                                        }
                                                    }, 200);
                                                }}
                                                placeholder="Risk açıklamasını giriniz..."
                                            />
                                            <IconButton
                                                onClick={() => removeRisk(riskIdx)}
                                                color="error"
                                                size="small"
                                                sx={{ mt: 1 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>

                                        {/* Actions for this Risk */}
                                        <Box sx={{ pl: 2, borderLeft: 4, borderColor: "divider" }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1.5, color: "text.secondary" }}>
                                                Bu Riske Karşı Yapılacak İşler
                                            </Typography>

                                            {risk.actions?.map((action, actionIdx) => {
                                                // Get available documents for this category
                                                const section = riskMatrixSections.find(s => s.kategoriKodu === kategoriKodu);
                                                const availableDocs = section?.documents || [];
                                                const docOptions = availableDocs.map(key => ({
                                                    key,
                                                    label: documentMapping[key]?.title || key
                                                }));

                                                // Extract current doc key from action link or text
                                                let currentDocKey = "";

                                                // Skip if link is just "#" (legacy data)
                                                if (action.link && action.link !== "#") {
                                                    currentDocKey = action.link;
                                                }
                                                // Try to extract from text
                                                else if (action.text) {
                                                    // Try multiple patterns to extract doc key
                                                    const patterns = [
                                                        /^(\d+\.\d+)\s/,           // "1.1 Title"
                                                        /^(\d+\.\d+)-/,            // "1.1-Title"  
                                                        /(\d+\.\d+)/               // anywhere in text
                                                    ];

                                                    for (const pattern of patterns) {
                                                        const match = action.text.match(pattern);
                                                        if (match && match[1]) {
                                                            currentDocKey = match[1];
                                                            break;
                                                        }
                                                    }
                                                }

                                                return (
                                                    <Box key={action.id || actionIdx} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                                                        <Autocomplete
                                                            size="small"
                                                            fullWidth
                                                            options={docOptions}
                                                            value={docOptions.find(opt => opt.key === currentDocKey) || null}
                                                            onChange={(e, newValue) => {
                                                                if (newValue) {
                                                                    updateActionText(riskIdx, actionIdx, newValue.key);
                                                                }
                                                            }}
                                                            getOptionLabel={(option) => option.label}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    placeholder="Doküman seçiniz..."
                                                                />
                                                            )}
                                                        />
                                                        <IconButton
                                                            onClick={() => removeActionFromRisk(riskIdx, actionIdx)}
                                                            color="error"
                                                            size="small"
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                );
                                            })}

                                            <Button
                                                startIcon={<AddIcon />}
                                                size="small"
                                                variant="outlined"
                                                onClick={() => addActionToRisk(riskIdx)}
                                                sx={{ mt: 1 }}
                                            >
                                                İş Ekle
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}

                                <Button
                                    startIcon={<AddIcon />}
                                    variant="outlined"
                                    onClick={addRisk}
                                    sx={{ mt: 1 }}
                                >
                                    Risk Ekle
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
                    <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => {
                            if (currentRowIndex !== null) {
                                deleteObjectiveRow(currentRowIndex);
                                setOpenRowDialog(false);
                            }
                        }}
                    >
                        Satırı Sil
                    </Button>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button onClick={() => setOpenRowDialog(false)}>İptal</Button>
                        <Button onClick={saveRowChanges} variant="contained" color="primary">Kaydet</Button>
                    </Box>
                </DialogActions>

                {/* Fas AI Integration in Dialog */}
                {openRowDialog && focusedField && (
                    <Box
                        ref={aiButtonRef}
                        onMouseDown={() => { isInteractingWithAi.current = true; }}
                        onMouseUp={() => { setTimeout(() => { isInteractingWithAi.current = false; }, 300); }}
                    >
                        <FloatingButtonCalismaKagitlari
                            isHovered={isAiButtonHovered}
                            setIsHovered={setIsAiButtonHovered}
                            control={true}
                            text={
                                focusedField.type === 'objective'
                                    ? editingRowData?.objective?.title || ""
                                    : (focusedField.index !== undefined ? editingRowData?.risks[focusedField.index]?.text : "")
                            }
                            handleClick={() => { }}
                            handleSetSelectedText={(newText) => {
                                if (focusedField.type === 'objective') {
                                    updateObjectiveTitle(newText);
                                    setTimeout(() => document.getElementById("ai-field-objective")?.focus(), 100);
                                } else if (focusedField.type === 'risk' && focusedField.index !== undefined) {
                                    updateRiskText(focusedField.index, newText);
                                    const idx = focusedField.index;
                                    setTimeout(() => document.getElementById(`ai-field-risk-${idx}`)?.focus(), 100);
                                }
                            }}
                        />
                    </Box>
                )}
            </Dialog>
            {/* --- RELEVANT DOCUMENTS LIST BELOW MATRIX --- */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}>
                    İlgili Dokümanlar
                </Typography>
                {(() => {
                    const section = riskMatrixSections.find(s => s.kategoriKodu === kategoriKodu);
                    if (!section || !section.documents) return null;

                    // 1. Extract unique document keys referenced in the table
                    const referencedDocKeys = new Set<string>();
                    tableData.rows.forEach(row => {
                        row.risks?.forEach(risk => {
                            risk.actions?.forEach(action => {
                                const docKey = getDocKey(action);
                                if (docKey) referencedDocKeys.add(docKey);
                            });
                        });
                    });

                    // 2. Filter section documents by those referenced
                    const filteredDocuments = section.documents.filter(docKey => referencedDocKeys.has(docKey));

                    if (filteredDocuments.length === 0) return null;

                    // 3. Sort filtered documents by key
                    const sortedDocuments = [...filteredDocuments].sort((a, b) => {
                        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
                    });

                    return sortedDocuments.map((docKey, index) => {
                        const doc = documentMapping[docKey];
                        if (!doc) return null;

                        return (
                            <Accordion key={docKey} sx={{ mb: 1, border: 1, borderColor: 'divider', boxShadow: 'none' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight="medium">
                                        {doc.title}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 2, bgcolor: "background.default" }}>
                                    {/* Render appropriate component based on type - USING SHOW COMPONENTS */}
                                    {doc.type === 1 && <KysCalismaKagidiShow key={`${docKey}-${docRefreshKey}`} formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 2 && <KysEditorShow key={`${docKey}-${docRefreshKey}`} formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 3 && <KysCalismaKagidiUcSutunluShow key={`${docKey}-${docRefreshKey}`} formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 4 && <KysBelgeShow key={`${docKey}-${docRefreshKey}`} formKodu={doc.formKodu} />}
                                </AccordionDetails>
                            </Accordion>
                        );
                    });
                })()}
            </Box>
            {/* Document Popup (Still active for quick links) */}
            {selectedDoc && (
                <KysRelatedDocumentsPopup
                    documentKeys={[selectedDoc]}
                    selectedKey={selectedDoc}
                    onClose={() => {
                        setSelectedDoc(null);
                        setDocRefreshKey(prev => prev + 1);
                    }}
                />
            )}
            {/* FAS AI ASSISTANT - Standard Design */}
            {!readOnly && isMatrixEmpty() && !aiDismissed && (
                <Box
                    sx={{
                        position: "fixed",
                        bottom: 12,
                        right: 24,
                        zIndex: 1000,
                        cursor: "pointer",
                        opacity: aiLoaded ? 1 : 0,
                        transition: "opacity 0.3s",
                        display: "flex",
                        alignItems: "center",
                    }}
                    onMouseEnter={() => setIsAiHovered(true)}
                    onMouseLeave={() => setIsAiHovered(false)}
                >
                    <Box sx={{ position: "relative", zIndex: 1001 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                animation: "float 2s linear infinite",
                                "@keyframes float": { "50%": { transform: "translateY(-4px)" } },
                                width: 72,
                                position: "absolute",
                                top: -30,
                                left: 0,
                            }}
                        >
                            <Typography
                                align="center"
                                variant="caption"
                                fontWeight="bold"
                                color={theme.palette.mode === "dark" ? "common.white" : "common.black"}
                                sx={{
                                    bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                                    px: 1,
                                    borderRadius: 1,
                                    boxShadow: 1
                                }}
                            >
                                Fas AI
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 72,
                                height: 72,
                                backgroundColor: "white",
                                borderRadius: "100%",
                                overflow: "hidden",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                border: "2px solid",
                                borderColor: "primary.main",
                                position: "relative",
                                animation: "pulse 2s infinite",
                                "@keyframes pulse": {
                                    "0%": { boxShadow: "0 0 0 0 rgba(0, 123, 255, 0.4)" },
                                    "70%": { boxShadow: "0 0 0 15px rgba(0, 123, 255, 0)" },
                                    "100%": { boxShadow: "0 0 0 0 rgba(0, 123, 255, 0)" }
                                }
                            }}
                        >
                            <iframe
                                src="https://widget.galichat.com/chat/6691wb9cakfml2mjro2x19"
                                scrolling="no"
                                style={{
                                    pointerEvents: "none",
                                    border: 0,
                                    width: 63,
                                    height: 63,
                                    backgroundColor: "transparent"
                                }}
                                onLoad={() => setAiLoaded(true)}
                            />
                        </Box>
                    </Box>

                    <Paper
                        elevation={4}
                        sx={{
                            display: "flex",
                            alignItems: "start",
                            justifyContent: isAiHovered ? "start" : "center",
                            flexDirection: "column",
                            width: isAiHovered ? 450 : 56,
                            height: isAiHovered ? 120 : 72,
                            borderRadius: "28px",
                            transition: "all 0.3s ease-in-out",
                            overflow: "hidden",
                            padding: isAiHovered ? "0 16px" : 0,
                            ml: -4, // Overlap with the circle
                            pl: isAiHovered ? 6 : 0,
                            zIndex: 1000,
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
                            border: isAiHovered ? "1px solid" : "none",
                            borderColor: "primary.main",
                            boxShadow: isAiHovered ? 4 : 0,
                            opacity: isAiHovered ? 1 : 0,
                            pointerEvents: isAiHovered ? "auto" : "none",
                        }}
                    >
                        {isAiHovered && (
                            <Box sx={{ py: 2, px: 1, width: '100%' }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1.5, color: "text.primary" }}>
                                    Verileri senin için oluşturmamı ister misin?
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerateFullData();
                                        }}
                                        disabled={isGenerating}
                                        startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <BoltIcon />}
                                        sx={{ borderRadius: "18px", textTransform: "none" }}
                                    >
                                        {isGenerating ? "Oluşturuluyor..." : "Evet, Oluştur"}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setAiDismissed(true);
                                        }}
                                        sx={{ borderRadius: "18px", textTransform: "none" }}
                                    >
                                        Hayır, Teşekkürler
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Box>
            )}
        </Box >
    );
};

export default KysRiskMatrixEditor;
