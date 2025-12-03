"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Link as MuiLink,
    Box,
} from "@mui/material";
import { useRouter } from "next/navigation";

export interface RiskMatrixRow {
    objective: {
        letter: string;
        title?: string;
        items?: string[];
    };
    risks: Array<{ text: string }>;
    actions: Array<{ text: string; link?: string }>;
}

export interface RiskMatrixData {
    rows: RiskMatrixRow[];
}

interface KysRiskMatrixTableProps {
    data: RiskMatrixData;
    editable?: boolean;
    onDataChange?: (data: RiskMatrixData) => void;
}

const KysRiskMatrixTable: React.FC<KysRiskMatrixTableProps> = ({
    data,
    editable = false,
    onDataChange,
}) => {
    const router = useRouter();
    const [tableData, setTableData] = useState<RiskMatrixData>(data);

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
        if (onDataChange) {
            onDataChange(newData);
        }
    };

    const handleLinkClick = (link: string) => {
        router.push(link);
    };

    const renderEditableCell = (
        content: string,
        onBlur: (value: string) => void,
        isHtml: boolean = false
    ) => {
        if (!editable) {
            return isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
                content
            );
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
                }}
            >
                {content}
            </div>
        );
    };

    return (
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
                                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                        ({row.objective.letter})
                                        {row.objective.title && (
                                            <span style={{ marginLeft: 4 }}>
                                                {renderEditableCell(
                                                    row.objective.title,
                                                    (val) => handleCellEdit(rowIndex, "objective", val, -1)
                                                )}
                                            </span>
                                        )}
                                    </Typography>
                                    {row.objective.items && (
                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
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
    );
};

export default KysRiskMatrixTable;
