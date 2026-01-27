"use client";

import React, { useEffect, useState, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import "@/utils/languages/handsontable.tr-TR";
import { Box, Typography, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getEnvanterKontrolleri,
    EnvanterKontrolleriWrapperDto,
    EnvanterMizanDto,
    StokKartListeDto,
    ListeFaturaDto,
} from "@/api/CalismaKagitlari/EnvanterKontrolleri";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const EnvanterKontrolleri: React.FC<Props> = ({
    parentName,
    childName,
    dipnotNo,
    isReport,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading } = useLoading();
    const [data, setData] = useState<EnvanterKontrolleriWrapperDto>({
        envanterMizanList: [],
        stokKartListeList: [],
        listeFaturaList: [],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getEnvanterKontrolleri(
                user.denetlenenId || 0,
                user.yil || 0,
                dipnotNo
            );
            if (response && response.debugMessage) {
                console.log("[EnvanterKontrolleri] Active Code Version:", response.debugMessage);
            }
            if (response && typeof response === "object" && !Array.isArray(response)) {
                setData(response);
            } else if (Array.isArray(response)) {
                setData({
                    envanterMizanList: response,
                    stokKartListeList: [],
                    listeFaturaList: [],
                });
            } else {
                console.error("Beklenmeyen veri formatı:", response);
                enqueueSnackbar("Sunucudan geçersiz veri formatı alındı", { variant: "error" });
            }
        } catch (error) {
            console.error("Veri çekme hatası:", error);
            enqueueSnackbar("Veriler yüklenirken bir hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetlenenId, user.yil, dipnotNo]);

    const columns1 = [
        { data: "stokKodu", title: "Stok Kodu", readOnly: true },
        { data: "stokAdi", title: "Stok Adı", readOnly: true },
        { data: "bakiyeMiktar", title: "Bakiye Miktar", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "kalanTutar", title: "Kalan Tutar", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "birimMaliyet", title: "Birim Maliyet", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "fark", title: "Fark", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    const columns2 = [
        { data: "stokKodu", title: "Stok Kodu", readOnly: true },
        { data: "stokAdi", title: "Stok Adı", readOnly: true },
        { data: "bakiyeMiktar", title: "Bakiye Miktar", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "kalanTutar", title: "Kalan Tutar", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "stokKartiBirimMaliyet", title: "Stok Kartı Birim Maliyet", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "listedekiBirimMaliyet", title: "Listedeki Birim Maliyet", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "fark", title: "Fark", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    const columns3 = [
        { data: "stokKodu", title: "Stok Kodu", readOnly: true },
        { data: "stokAdi", title: "Stok Adı", readOnly: true },
        { data: "listedekiBirimMaliyet", title: "Listedeki Birim Maliyet", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "faturaTarihi", title: "Fatura Tarihi", type: "date", dateFormat: "DD.MM.YYYY", correctFormat: true, readOnly: true },
        { data: "faturaNo", title: "Fatura No", readOnly: true },
        { data: "faturaBirimTutari", title: "Fatura Birim Tutarı", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "fark", title: "Fark", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    const renderTable = (tableData: any[], columns: any[], title: string) => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: theme.palette.primary.main }}>
                {title}
            </Typography>
            <Box
                sx={{
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.divider}`,
                    "& .handsontable th": {
                        backgroundColor: theme.palette.primary.main,
                        color: "white",
                    },
                    "& .bold-row": {
                        fontWeight: "bold",
                        backgroundColor: theme.palette.action.hover,
                    }
                }}
            >
                <HotTable
                    data={tableData}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={false}
                    stretchH="all"
                    width="100%"
                    height={tableData.length > 10 ? "400px" : "auto"}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    readOnly={isReport}
                    contextMenu={isReport ? false : true}
                    cells={(row, col) => {
                        const cellProperties: any = {};
                        const rowData = tableData[row];
                        if (rowData?.isBold) {
                            cellProperties.className = (cellProperties.className || "") + " bold-row";
                        }
                        return cellProperties;
                    }}
                />
                {tableData.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center", backgroundColor: theme.palette.background.paper }}>
                        <Typography variant="body1" color="textSecondary">Veri bulunmamaktadır.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );

    return (
        <Box>
            {renderTable(data.envanterMizanList, columns1, "Envanter ve Mizan Kontrolü")}
            {renderTable(data.stokKartListeList, columns2, "Stok Kartı ve Liste Fiyatı Kontrolü")}
            {renderTable(data.listeFaturaList, columns3, "Liste Fiyatı ve Fatura Kontrolü")}
        </Box>
    );
};

export default EnvanterKontrolleri;
