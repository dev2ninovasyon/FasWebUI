"use client";

import "@/lib/handsontableSetup";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Box, Grid, Typography, useTheme, Alert, Card, CardContent, IconButton, Snackbar } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { getVergiVarligiTumDetay } from "@/api/Hesaplamalar/Hesaplamalar";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";

numbro.registerLanguage(trTR);
numbro.setLanguage("tr-TR");

interface Props {
    hesaplaTiklandimi: boolean;
}

const ErtelenmisVergiHesabiDetayTable: React.FC<Props> = ({ hesaplaTiklandimi }) => {
    const hotTableComponent = useRef<any>(null);

    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const dispatch = useDispatch();
    const theme = useTheme();

    const [rowCount, setRowCount] = useState(0);
    const [fetchedData, setFetchedData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [noDataOpen, setNoDataOpen] = useState(false);

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
        "Hesaplandı mı?"
    ];

    const columns = [
        { type: "numeric", className: "htLeft", readOnly: true },
        { type: "text", className: "htLeft", readOnly: true },
        { type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight", readOnly: true },
        { type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight", readOnly: true },
        { type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight", readOnly: true },
        { type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, className: "htRight", readOnly: true },
        { type: "checkbox", className: "htCenter", readOnly: true },
    ];




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
                    item.hesaplandimi || false
                ]);
                setFetchedData(rows);
                setRowCount(rows.length);
                setNoDataOpen(rows.length === 0);
            } else {
                setFetchedData([]);
                setRowCount(0);
                setNoDataOpen(true);
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

    useEffect(() => {
        if (!hesaplaTiklandimi) {
            fetchData();
        }
    }, [hesaplaTiklandimi]);

    const handleDownload = () => {
        const hotTableInstance = hotTableComponent.current.hotInstance;
        const data = hotTableInstance.getData();
        const headers = hotTableInstance.getColHeader();
        const fullData = [headers, ...data];
        async function createExcelFile() {
            const { default: ExcelJS } = await import("exceljs");
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("ErtelenmisVergiDetay");
            fullData.forEach((row: any) => worksheet.addRow(row));
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
            headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1a6786" } };
            worksheet.columns.forEach(col => col.width = 25);
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `ErtelenmisVergiDetay_${user.yil}.xlsx`);
        }
        createExcelFile();
    };

    return (
        <Card sx={{ mt: 3, mb: 3 }}>
            <CardContent>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h5" color="primary">
                        Taşınan Kayıtlar (Detay)
                    </Typography>
                    <Alert severity="info" sx={{ py: 0 }}>
                        Gelen satır sayısı: <strong>{rowCount}</strong>
                    </Alert>
                </Box>
                {loading ? (
                    <Typography>Yükleniyor...</Typography>
                ) : (
                    <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
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
                        columnSorting={true}
                        filters={true}
                        dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]}
                        contextMenu={["alignment", "copy"]}
                    />
                )}
                <Grid container marginTop={2} justifyContent="flex-end">
                    <Grid size={{ xs: 12, lg: 2 }}>
                        <ExceleAktarButton handleDownload={handleDownload} />
                    </Grid>
                </Grid>
            </CardContent>
            <Snackbar
                open={noDataOpen}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    severity="warning"
                    variant="filled"
                    action={
                        <IconButton
                            size="small"
                            color="inherit"
                            onClick={() => setNoDataOpen(false)}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    }
                    sx={{ width: "100%", fontSize: "14px" }}
                >
                    Ertelenmiş vergi hesabı verisi bulunamadı.
                </Alert>
            </Snackbar>
        </Card>
    );
};

export default ErtelenmisVergiHesabiDetayTable;
