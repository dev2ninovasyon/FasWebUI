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
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
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

interface KysRiskMatrixEditorProps {
    kategoriKodu: string;
    readOnly?: boolean;
}

const KysRiskMatrixEditor: React.FC<KysRiskMatrixEditorProps> = ({
    kategoriKodu,
    readOnly = false,
}) => {
    const router = useRouter();
    const user = useSelector((state: AppState) => state.userReducer);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [matrisId, setMatrisId] = useState<number | null>(null);
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
            try {
                const parsedData = JSON.parse(data.matrisJson);
                setTableData(parsedData);
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
        if (!user.token || !matrisId) return;

        setSaving(true);
        await updateKysRiskMatrisi(user.token, matrisId, tableData);
        setSaving(false);
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

    const handleLinkClick = (link: string) => {
        router.push(link);
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
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <Tooltip title="Kaydet">
                        <IconButton
                            onClick={handleSave}
                            disabled={saving}
                            color="primary"
                            size="large"
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
                                                    <li key={idx} style={{ marginBottom: 8 }}>
                                                        {renderEditableCell(
                                                            item,
                                                            (val) => handleCellEdit(rowIndex, "objective", val, idx)
                                                        )}
                                                    </li>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </TableCell>

                                {/* Örnek Kalite Riskleri Column */}
                                <TableCell sx={{ verticalAlign: "top", border: "1px solid #e0e0e0", p: 2 }}>
                                    {row.risks.map((risk, riskIndex) => (
                                        <Box key={riskIndex} sx={{ mb: riskIndex < row.risks.length - 1 ? 2 : 0 }}>
                                            {renderEditableCell(
                                                risk.text,
                                                (val) => handleCellEdit(rowIndex, "risks", val, riskIndex)
                                            )}
                                        </Box>
                                    ))}
                                </TableCell>

                                {/* Risklere Karşı Yapılacak Örnek İşler Column */}
                                <TableCell sx={{ verticalAlign: "top", border: "1px solid #e0e0e0", p: 2 }}>
                                    {row.actions.map((action, actionIndex) => (
                                        <Box key={actionIndex} sx={{ mb: actionIndex < row.actions.length - 1 ? 1 : 0 }}>
                                            {action.link ? (
                                                <MuiLink
                                                    component="button"
                                                    variant="body2"
                                                    onClick={() => handleLinkClick(action.link!)}
                                                    sx={{
                                                        textAlign: "left",
                                                        cursor: "pointer",
                                                        textDecoration: "none",
                                                        color: "#d32f2f",
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
                                    ))}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default KysRiskMatrixEditor;
