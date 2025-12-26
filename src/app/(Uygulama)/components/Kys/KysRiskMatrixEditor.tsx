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
    Link as MuiLink,
    Box,
    CircularProgress,
    IconButton,
    Tooltip,
    Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getKysRiskMatrisi,
    updateKysRiskMatrisi,
    createKysRiskMatrisi,
    RiskMatrixData,
    RiskMatrixRow,
} from "@/api/Kys/KysRiskMatrisi";
import { enqueueSnackbar } from "notistack";

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

    const handleSave = async () => {
        if (!user.token || matrisId === null) {
            enqueueSnackbar("Kaydedilecek geçerli bir matris bulunamadı.", { variant: "warning" });
            return;
        }

        setSaving(true);
        try {
            const result = await updateKysRiskMatrisi(user.token, matrisId, kategoriKodu, tableData, baslik);
            if (result) {
                enqueueSnackbar("Risk matrisi başarıyla kaydedildi.", { variant: "success" });
            } else {
                enqueueSnackbar("Kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", { variant: "error" });
            }
        } catch (error) {
            console.error("Save error:", error);
            enqueueSnackbar("Bağlantı hatası oluştu.", { variant: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleCellEdit = (
        rowIndex: number,
        column: "objective" | "risks" | "actions",
        value: string,
        subIndex?: number
    ) => {
        const newData = { ...tableData };
        const row = newData.rows[rowIndex];

        if (column === "objective") {
            if (subIndex !== undefined && row.objective.items) {
                row.objective.items[subIndex] = value;
            } else if (subIndex === -1) {
                row.objective.title = value;
            }
        } else if (column === "risks" && subIndex !== undefined) {
            row.risks[subIndex].text = value;
        } else if (column === "actions" && subIndex !== undefined) {
            row.actions[subIndex].text = value;
        }

        setTableData(newData);
    };

    const addRow = () => {
        const newData = { ...tableData };
        // Determine the next letter
        const lastLetter = newData.rows.length > 0 ? newData.rows[newData.rows.length - 1].objective.letter : "";
        let nextLetter = "a";
        if (lastLetter) {
            const charCode = lastLetter.charCodeAt(0);
            nextLetter = String.fromCharCode(charCode + 1);
        }

        const newRow: RiskMatrixRow = {
            objective: {
                letter: nextLetter,
                title: "Yeni Kalite Hedefi",
                items: []
            },
            risks: [],
            actions: []
        };

        newData.rows.push(newRow);
        setTableData(newData);
    };

    const deleteRow = (rowIndex: number) => {
        const newData = { ...tableData };
        newData.rows.splice(rowIndex, 1);
        // Re-calculate letters
        newData.rows.forEach((row, idx) => {
            row.objective.letter = String.fromCharCode(97 + idx); // 97 is 'a'
        });
        setTableData(newData);
    };

    const addSubItem = (rowIndex: number, type: "objective" | "risks" | "actions") => {
        const newData = { ...tableData };
        const row = newData.rows[rowIndex];
        if (type === "objective") {
            if (!row.objective.items) row.objective.items = [];
            row.objective.items.push("Yeni Madde");
        } else if (type === "risks") {
            row.risks.push({ text: "Yeni Risk" });
        } else if (type === "actions") {
            row.actions.push({ text: "Yeni İş" });
        }
        setTableData(newData);
    };

    const removeSubItem = (rowIndex: number, type: "objective" | "risks" | "actions", subIndex: number) => {
        const newData = { ...tableData };
        const row = newData.rows[rowIndex];
        if (type === "objective" && row.objective.items) {
            row.objective.items.splice(subIndex, 1);
        } else if (type === "risks") {
            row.risks.splice(subIndex, 1);
        } else if (type === "actions") {
            row.actions.splice(subIndex, 1);
        }
        setTableData(newData);
    };

    const handleLinkClick = (link: string) => {
        if (onLinkClick) {
            onLinkClick(link);
        } else {
            enqueueSnackbar("İlgili döküman açılıyor...", { variant: "info" });
            router.push(link);
        }
    };

    const renderEditableCell = (content: string, onBlur: (value: string) => void) => {
        if (readOnly) {
            return content;
        }

        return (
            <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onBlur(e.currentTarget.textContent || "")}
                style={{
                    outline: "none",
                    minHeight: "20px",
                    cursor: "text",
                    padding: "2px",
                }}
            >
                {content}
            </div>
        );
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
            {!readOnly && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 1 }}>

                    <Tooltip title="Kaydet">
                        <IconButton
                            onClick={handleSave}
                            disabled={saving}
                            color="primary"
                        >
                            {saving ? <CircularProgress size={24} /> : <SaveIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            <TableContainer component={Paper} elevation={0}>
                <Table sx={{ border: "1px solid #e0e0e0" }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#1976d2" }}>
                            <TableCell
                                sx={{
                                    color: "white",
                                    fontWeight: 600,
                                    width: "33%",
                                    border: "1px solid white",
                                }}
                            >
                                Kalite Hedefleri
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: "white",
                                    fontWeight: 600,
                                    width: "33%",
                                    border: "1px solid white",
                                }}
                            >
                                Örnek Kalite Riskleri
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: "white",
                                    fontWeight: 600,
                                    width: "34%",
                                    border: "1px solid white",
                                }}
                            >
                                Risklere Karşı Yapılacak Örnek İşler
                            </TableCell>
                            {!readOnly && (
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: 600,
                                        width: "50px",
                                        border: "1px solid white",
                                        textAlign: "center"
                                    }}
                                >
                                    İşlem
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {/* Kalite Hedefleri Column */}
                                <TableCell sx={{ verticalAlign: "top", border: "1px solid #e0e0e0", p: 2 }}>
                                    <Box>
                                        <strong>({row.objective.letter})</strong>
                                        {row.objective.title && (
                                            <span style={{ marginLeft: 4 }}>
                                                {renderEditableCell(
                                                    row.objective.title,
                                                    (val) => handleCellEdit(rowIndex, "objective", val, -1)
                                                )}
                                            </span>
                                        )}
                                        {row.objective.items && (
                                            <Box component="ul" sx={{ pl: 2, m: 0, mt: 1 }}>
                                                {row.objective.items.map((item, idx) => (
                                                    <li key={idx} style={{ marginBottom: 8, position: "relative" }}>
                                                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                {renderEditableCell(
                                                                    item,
                                                                    (val) => handleCellEdit(rowIndex, "objective", val, idx)
                                                                )}
                                                            </Box>
                                                            {!readOnly && (
                                                                <IconButton size="small" onClick={() => removeSubItem(rowIndex, "objective", idx)} sx={{ ml: 0.5 }}>
                                                                    <RemoveCircleOutlineIcon fontSize="inherit" color="error" />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    </li>
                                                ))}
                                                {!readOnly && (
                                                    <Button
                                                        size="small"
                                                        startIcon={<AddCircleOutlineIcon />}
                                                        onClick={() => addSubItem(rowIndex, "objective")}
                                                        sx={{ textTransform: "none", fontSize: "0.75rem", mt: 1 }}
                                                    >
                                                        Madde Ekle
                                                    </Button>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </TableCell>

                                {/* Örnek Kalite Riskleri Column */}
                                <TableCell sx={{ verticalAlign: "top", border: "1px solid #e0e0e0", p: 2 }}>
                                    {row.risks.map((risk, riskIndex) => (
                                        <Box key={riskIndex} sx={{ mb: riskIndex < row.risks.length - 1 ? 2 : 0, display: "flex", alignItems: "flex-start" }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                {renderEditableCell(
                                                    risk.text,
                                                    (val) => handleCellEdit(rowIndex, "risks", val, riskIndex)
                                                )}
                                            </Box>
                                            {!readOnly && (
                                                <IconButton size="small" onClick={() => removeSubItem(rowIndex, "risks", riskIndex)} sx={{ ml: 0.5 }}>
                                                    <RemoveCircleOutlineIcon fontSize="inherit" color="error" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}
                                    {!readOnly && (
                                        <Button
                                            size="small"
                                            startIcon={<AddCircleOutlineIcon />}
                                            onClick={() => addSubItem(rowIndex, "risks")}
                                            sx={{ textTransform: "none", fontSize: "0.75rem", mt: 1 }}
                                        >
                                            Risk Ekle
                                        </Button>
                                    )}
                                </TableCell>

                                {/* Risklere Karşı Yapılacak Örnek İşler Column */}
                                <TableCell sx={{ verticalAlign: "top", border: "1px solid #e0e0e0", p: 2 }}>
                                    {row.actions.map((action, actionIndex) => (
                                        <Box key={actionIndex} sx={{ mb: actionIndex < row.actions.length - 1 ? 1 : 0, display: "flex", alignItems: "flex-start" }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                {action.link ? (
                                                    <MuiLink
                                                        component="button"
                                                        variant="body2"
                                                        onClick={() => handleLinkClick(action.link!)}
                                                        sx={{
                                                            textAlign: "left",
                                                            cursor: "pointer",
                                                            textDecoration: "none",
                                                            color: "primary.main",
                                                            "&:hover": {
                                                                textDecoration: "underline",
                                                            },
                                                        }}
                                                    >
                                                        {action.text}
                                                    </MuiLink>
                                                ) : (
                                                    renderEditableCell(
                                                        action.text,
                                                        (val) => handleCellEdit(rowIndex, "actions", val, actionIndex)
                                                    )
                                                )}
                                            </Box>
                                            {!readOnly && (
                                                <IconButton size="small" onClick={() => removeSubItem(rowIndex, "actions", actionIndex)} sx={{ ml: 0.5 }}>
                                                    <RemoveCircleOutlineIcon fontSize="inherit" color="error" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}
                                    {/*
                                          {!readOnly && (
                                        <Button
                                            size="small"
                                            startIcon={<AddCircleOutlineIcon />}
                                            onClick={() => addSubItem(rowIndex, "actions")}
                                            sx={{ textTransform: "none", fontSize: "0.75rem", mt: 1 }}
                                        >
                                            İş Ekle
                                        </Button>
                                    )} */}
                                </TableCell>
                                {!readOnly && (
                                    <TableCell sx={{ verticalAlign: "middle", border: "1px solid #e0e0e0", p: 1, textAlign: "center" }}>
                                        <IconButton size="small" onClick={() => deleteRow(rowIndex)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default KysRiskMatrixEditor;
