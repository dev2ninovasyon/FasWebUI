"use client";

import React from "react";
import "@/lib/handsontableSetup";
import { HotTable } from "@handsontable/react";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "handsontable/dist/handsontable.full.min.css";
import { plus } from "@/utils/theme/Typography";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Box, Grid, Typography, useTheme, Alert } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getVergiVarligiTumDetay } from "@/api/Hesaplamalar/Hesaplamalar";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

const VergiVarlikKontrol: React.FC = () => {
    const hotTableComponent = useRef<any>(null);

    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const dispatch = useDispatch();
    const theme = useTheme();

    const [rowCount, setRowCount] = useState(0);
    const [fetchedData, setFetchedData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStyles = async () => {
            dispatch(setCollapse(true));
            if (customizer.activeMode === "dark") {
                await import(
                    "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableDark.css"
                );
            } else {
                await import(
                    "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableLight.css"
                );
            }
        };
        loadStyles();
    }, [customizer.activeMode]);

    const colHeaders = [
        "Kebir Kodu",
        "Hesap Adı",
        "Geçici Fark Varlık",
        "Geçici Fark Yükümlülük",
        "Ertelenen Vergi Varlığı",
        "Ertelenen Vergi Yükümlülüğü",
    ];

    const columns = [
        { type: "numeric", className: "htLeft", readOnly: true },
        { type: "text", className: "htLeft", readOnly: true },
        { type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight", readOnly: true },
        { type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight", readOnly: true },
        { type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight", readOnly: true },
        { type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight", readOnly: true },
    ];

    const afterGetColHeader = (col: any, TH: any) => {
        TH.style.height = "50px";
        let div = TH.querySelector("div");
        if (!div) { div = document.createElement("div"); TH.appendChild(div); }
        div.style.whiteSpace = "normal";
        div.style.wordWrap = "break-word";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.height = "100%";
        div.style.position = "relative";
        TH.style.fontFamily = plus.style.fontFamily;
        TH.style.fontWeight = 500;
        TH.style.fontSize = "0.875rem";
        TH.style.lineHeight = "1.334rem";
        TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
        TH.style.backgroundColor = theme.palette.primary.light;
        TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
        let span = div.querySelector("span.colHeader");
        if (span) {
            span.style.paddingRight = "25px";
        }
    };

    const afterGetRowHeader = (row: any, TH: any) => {
        let div = TH.querySelector("div");
        if (div) {
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.justifyContent = "center";
            div.style.height = "100%";
        }
        TH.style.fontFamily = plus.style.fontFamily;
        TH.style.fontWeight = 500;
        TH.style.fontSize = "0.875rem";
        TH.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
        TH.style.backgroundColor = theme.palette.primary.light;
        TH.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
    };

    const afterRenderer = (TD: any, row: any, col: any, prop: any, value: any, cellProperties: any) => {
        TD.style.fontFamily = plus.style.fontFamily;
        TD.style.fontSize = "0.875rem";
        TD.style.fontWeight = 500;
        TD.style.color = customizer.activeMode === "dark" ? "#ffffff" : "#2A3547";
        if (row % 2 === 0) {
            TD.style.backgroundColor = customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
            TD.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
        } else {
            TD.style.backgroundColor = customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
            TD.style.borderColor = customizer.activeMode === "dark" ? "#10141c" : "#cccccc";
            TD.style.borderRightColor = customizer.activeMode === "dark" ? "#171c23" : "#ffffff";
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getVergiVarligiTumDetay(
                user.denetciId || 0,
                user.yil || 0,
                user.denetlenenId || 0
            );

            if (res && Array.isArray(res)) {
                const rows = res.map((item: any) => [
                    item.kebirKodu,
                    item.hesapAdi,
                    item.geciciFarkVarlik || 0,
                    item.geciciFarkYukumluluk || 0,
                    item.ertelenenVergiVarligi || 0,
                    item.ertelenenVergiYukumlulugu || 0,
                ]);
                setFetchedData(rows);
                setRowCount(rows.length);
            } else {
                setFetchedData([]);
                setRowCount(0);
            }
        } catch (error) {
            console.error("fetchData error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetlenenId, user.yil]);

    const handleDownload = () => {
        const hotTableInstance = hotTableComponent.current.hotInstance;
        const data = hotTableInstance.getData();
        const headers = hotTableInstance.getColHeader();
        const fullData = [headers, ...data];

        async function createExcelFile() {
            const { default: ExcelJS } = await import("exceljs");
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("ErtelenmisVergiKontrol");
            fullData.forEach((row: any) => worksheet.addRow(row));
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
            headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1a6786" } };
            worksheet.columns.forEach(col => col.width = 25);
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `ErtelenmisVergi_Kontrol_${user.yil}.xlsx`);
        }
        createExcelFile();
    };

    return (
        <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <Alert severity="info" sx={{ py: 0 }}>
                    Gelen satır sayısı: <strong>{rowCount}</strong>
                </Alert>
            </Box>

            {loading ? (
                <Typography>Yükleniyor...</Typography>
            ) : (
                <HotTable
                    ref={hotTableComponent}
                    data={fetchedData}
                    colHeaders={colHeaders}
                    columns={columns}
                    stretchH="all"
                    manualColumnResize={true}
                    rowHeaders={true}
                    height="500px"
                    rowHeights={35}
                    licenseKey="non-commercial-and-evaluation"
                    afterGetColHeader={afterGetColHeader}
                    afterGetRowHeader={afterGetRowHeader}
                    afterRenderer={afterRenderer}
                    columnSorting={true}
                    filters={true}
                    dropdownMenu={true}
                    contextMenu={["alignment", "copy"]}
                />
            )}

            <Grid container marginTop={2} justifyContent="flex-end">
                <Grid
                    size={{
                        xs: 12,
                        lg: 2
                    }}
                    sx={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                    <ExceleAktarButton handleDownload={handleDownload} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default VergiVarlikKontrol;
