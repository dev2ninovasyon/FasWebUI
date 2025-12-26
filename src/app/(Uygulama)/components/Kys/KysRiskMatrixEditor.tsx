"use client";

import React, { useEffect, useState, useCallback } from "react";
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
    RiskMatrixData,
    RiskMatrixRow,
    RiskItem,
    RiskAction
} from "@/api/Kys/KysRiskMatrisi";
import { enqueueSnackbar } from "notistack";
import { v4 as uuidv4 } from 'uuid';
import KysRelatedDocumentsPopup from "./KysRelatedDocumentsPopup";
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [matrisId, setMatrisId] = useState<number | null>(null);
    const [baslik, setBaslik] = useState<string>("");
    const [tableData, setTableData] = useState<RiskMatrixData>({ rows: [] });

    // Dialog States
    const [openObjectiveDialog, setOpenObjectiveDialog] = useState(false);
    const [openRiskDialog, setOpenRiskDialog] = useState(false); // Renamed from openRisksDialog

    // Indices to track what we are editing
    const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null);
    const [currentRiskIndex, setCurrentRiskIndex] = useState<number | null>(null);

    // Temp State for Editing
    const [editingRow, setEditingRow] = useState<RiskMatrixRow | null>(null); // For Objective Dialog

    // For Risk Dialog (Single Risk Editing)
    const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);

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
                console.error("JSON parse error:", e);
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
            console.error("Auto-save error:", error);
            enqueueSnackbar("Kaydetme hatası.", { variant: "error" });
        } finally {
            setSaving(false);
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

    // --- Dialog Open Handlers ---

    // 1. Objective Dialog
    const handleOpenObjectiveDialog = (rowIndex: number) => {
        if (readOnly) return;
        setCurrentRowIndex(rowIndex);
        const row = JSON.parse(JSON.stringify(tableData.rows[rowIndex]));

        // MERGE LOGIC: Combine Title + Items into Title
        if (row.objective.items && row.objective.items.length > 0) {
            row.objective.title = row.objective.title + "\n\n" + row.objective.items.join("\n");
            row.objective.items = []; // Clear items as they are now in title
        }

        setEditingRow(row);
        setOpenObjectiveDialog(true);
    };

    const saveObjectiveChanges = () => {
        if (currentRowIndex !== null && editingRow) {
            const newData = { ...tableData };
            newData.rows[currentRowIndex].objective = editingRow.objective;
            setTableData(newData);
            setOpenObjectiveDialog(false);
            setEditingRow(null);

            saveDataToBackend(newData);
        }
    };

    // 2. Risk Dialog (New: Single Risk Editing)
    const handleOpenRiskDialog = (rowIndex: number, riskIndex: number | null = null) => {
        if (readOnly) return;
        setCurrentRowIndex(rowIndex);
        setCurrentRiskIndex(riskIndex); // If null, we are adding a NEW risk

        if (riskIndex !== null) {
            // Edit existing
            const riskToEdit = tableData.rows[rowIndex].risks[riskIndex];
            setEditingRisk(JSON.parse(JSON.stringify(riskToEdit)));
        } else {
            // New Risk
            setEditingRisk({
                id: uuidv4(),
                text: "",
                actions: []
            });
        }
        setOpenRiskDialog(true);
    };

    const saveRiskChanges = () => {
        if (currentRowIndex !== null && editingRisk) {
            const newData = { ...tableData };
            const row = newData.rows[currentRowIndex];

            if (currentRiskIndex !== null) {
                // Update Existing
                row.risks[currentRiskIndex] = editingRisk;
            } else {
                // Add New
                if (!row.risks) row.risks = [];
                row.risks.push(editingRisk);
            }

            setTableData(newData);
            setOpenRiskDialog(false);
            setEditingRisk(null);
            setCurrentRiskIndex(null);

            saveDataToBackend(newData);
        }
    };

    const deleteRisk = () => {
        if (confirm("Bu riski silmek istediğinize emin misiniz?")) {
            if (currentRowIndex !== null && currentRiskIndex !== null) {
                const newData = { ...tableData };
                newData.rows[currentRowIndex].risks.splice(currentRiskIndex, 1);
                setTableData(newData);
                setOpenRiskDialog(false);
                setEditingRisk(null);
                setCurrentRiskIndex(null);

                saveDataToBackend(newData);
            }
        }
    }


    // Risk Dialog Helpers (Work on `editingRisk` state) - NO CHANGE needed here, they just edit temp state.

    const updateRiskText = (val: string) => {
        if (!editingRisk) return;
        setEditingRisk({ ...editingRisk, text: val });
    };

    const addAction = () => {
        if (!editingRisk) return;
        const newActions = [...(editingRisk.actions || [])];
        newActions.push({ id: uuidv4(), text: "" });
        setEditingRisk({ ...editingRisk, actions: newActions });
    };

    const removeAction = (idx: number) => {
        if (!editingRisk) return;
        const newActions = [...(editingRisk.actions || [])];
        newActions.splice(idx, 1);
        setEditingRisk({ ...editingRisk, actions: newActions });
    };

    const updateActionText = (idx: number, val: string) => {
        if (!editingRisk) return;
        const newActions = [...(editingRisk.actions || [])];
        newActions[idx].text = val;
        setEditingRisk({ ...editingRisk, actions: newActions });
    };


    // ... (previous helper functions)

    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

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
                            <TableCell sx={{ fontWeight: "bold", color: "text.primary", width: "35%", borderRight: 1, borderBottom: 1, borderColor: "divider" }}>Kalite Hedefleri</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "text.primary", width: "30%", borderRight: 1, borderBottom: 1, borderColor: "divider" }}>Örnek Kalite Riskleri</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "text.primary", width: "35%", borderBottom: 1, borderColor: "divider" }}>Risklere Karşı Yapılacak Örnek İşler</TableCell>
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
                                                borderRight: 1,
                                                borderBottom: 1,
                                                borderColor: "divider",
                                                bgcolor: "background.default"
                                            }}
                                        >
                                            <Box
                                                onClick={() => handleOpenObjectiveDialog(rowIndex)}
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

                                        {/* RISK & ACTION CELL 0 (Make sure we handle if risks array is empty) */}
                                        {riskCount > 0 ? (
                                            <>
                                                <TableCell
                                                    sx={{ verticalAlign: "top", p: 1.5, borderRight: 1, borderBottom: 1, borderColor: "divider", cursor: "pointer" }}
                                                    onClick={() => handleOpenRiskDialog(rowIndex, 0)}
                                                >
                                                    <Typography variant="body2">{row.risks[0].text}</Typography>
                                                </TableCell>
                                                <TableCell
                                                    sx={{ verticalAlign: "top", p: 1.5, borderBottom: 1, borderColor: "divider" }}
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
                                                                            color: "primary.main"
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
                                                sx={{ p: 1, bgcolor: "action.hover", cursor: "pointer", verticalAlign: "middle", borderBottom: 1, borderColor: "divider" }}
                                                onClick={() => handleOpenRiskDialog(rowIndex, null)} // Add New
                                            >
                                                <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", fontWeight: "bold" }}>
                                                    [Varsa ilave riskleri ekleyin]
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
                                                    sx={{ verticalAlign: "top", p: 1.5, borderRight: 1, borderBottom: 1, borderColor: "divider", cursor: "pointer" }}
                                                    onClick={() => handleOpenRiskDialog(rowIndex, actualIndex)}
                                                >
                                                    <Typography variant="body2">{risk.text}</Typography>
                                                </TableCell>
                                                <TableCell
                                                    sx={{ verticalAlign: "top", p: 1.5, borderBottom: 1, borderColor: "divider" }}
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
                                                                            color: "primary.main"
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
                                                sx={{ p: 1, bgcolor: "action.hover", cursor: "pointer", borderBottom: 1, borderColor: "divider" }}
                                                onClick={() => handleOpenRiskDialog(rowIndex, null)} // Add New
                                            >
                                                <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", fontWeight: "bold" }}>
                                                    [Varsa ilave riskleri ekleyin]
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

            {/* --- OBJECTIVE EDIT DIALOG --- */}
            <Dialog open={openObjectiveDialog} onClose={() => setOpenObjectiveDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Hedef Düzenle</DialogTitle>
                <DialogContent dividers>
                    {editingRow && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <TextField
                                label="Hedef ve Detayları"
                                fullWidth
                                multiline
                                minRows={4}
                                maxRows={10}
                                value={editingRow.objective.title || ""}
                                onChange={(e) => setEditingRow({
                                    ...editingRow,
                                    objective: { ...editingRow.objective, title: e.target.value }
                                })}
                                helperText="Tüm hedef açıklamasını ve maddelerini bu alana giriniz."
                            />
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
                                setOpenObjectiveDialog(false);
                            }
                        }}
                    >
                        Sil
                    </Button>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button onClick={() => setOpenObjectiveDialog(false)}>İptal</Button>
                        <Button onClick={saveObjectiveChanges} variant="contained" color="primary">Tamam</Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* --- RISK & ACTION SINGLE EDIT DIALOG --- */}
            <Dialog open={openRiskDialog} onClose={() => setOpenRiskDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{currentRiskIndex !== null ? "Risk Düzenle" : "Yeni Risk Ekle"}</DialogTitle>
                <DialogContent dividers>
                    {editingRisk && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {/* Risk Text */}
                            <TextField
                                label="Risk Tanımı"
                                fullWidth
                                multiline
                                rows={2}
                                value={editingRisk.text}
                                onChange={(e) => updateRiskText(e.target.value)}
                                placeholder="Risk açıklamasını giriniz..."
                            />

                            {/* Actions List */}
                            <Box sx={{ pl: 2, borderLeft: 4, borderColor: "divider" }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: "text.primary" }}>
                                    Bu Riske Karşı Yapılacak İşler
                                </Typography>

                                {editingRisk.actions?.map((action, idx) => (
                                    <Box key={action.id || idx} sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "center" }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="İşlem tanımı..."
                                            value={action.text}
                                            onChange={(e) => updateActionText(idx, e.target.value)}
                                        />
                                        <IconButton onClick={() => removeAction(idx)} color="error" size="small">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Button
                                    startIcon={<AddIcon />}
                                    size="small"
                                    variant="outlined"
                                    onClick={addAction}
                                    sx={{ mt: 1 }}
                                >
                                    İş Ekle
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
                    {currentRiskIndex !== null ? (
                        <Button startIcon={<DeleteIcon />} color="error" onClick={deleteRisk}>
                            Riski Sil
                        </Button>
                    ) : (
                        <Box />
                    )}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button onClick={() => setOpenRiskDialog(false)}>İptal</Button>
                        <Button onClick={saveRiskChanges} variant="contained" color="primary">Kaydet</Button>
                    </Box>
                </DialogActions>
            </Dialog>


            {/* --- RELEVANT DOCUMENTS LIST BELOW MATRIX --- */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}>
                    İlgili Dokümanlar
                </Typography>
                {(() => {
                    const section = riskMatrixSections.find(s => s.kategoriKodu === kategoriKodu);
                    if (!section || !section.documents) return <Typography>Bu bölüm için tanımlı doküman bulunamadı.</Typography>;

                    // Sort documents by key (e.g. "1.1", "1.2", "3.1")
                    const sortedDocuments = [...section.documents].sort((a, b) => {
                        // Simple string comparison works for "1.1", "1.2" but better safe with numeric parts if needed.
                        // For now, strict string comparison is usually sufficient for "X.Y" format unless X > 9.
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
                                    {doc.type === 1 && <KysCalismaKagidiShow formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 2 && <KysEditorShow formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 3 && <KysCalismaKagidiUcSutunluShow formKodu={doc.formKodu} alanAdi={doc.title} />}
                                    {doc.type === 4 && <KysBelgeShow formKodu={doc.formKodu} />}
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
                    onClose={() => setSelectedDoc(null)}
                />
            )}
        </Box>
    );
};

export default KysRiskMatrixEditor;
