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
    getDegerlemeveDegerDusukluguKontrolleri,
} from "@/api/CalismaKagitlari/DegerlemeveDegerDusukluguKontrolleri";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
}

const DegerlemeveDegerDusukluguKontrolleri: React.FC<Props> = ({
    parentName,
    childName,
    dipnotNo,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading } = useLoading();
    const [data, setData] = useState<any[]>([]);

    const fetchData = async () => {
        if (!user.denetlenenId || !user.yil || !dipnotNo) return;
        setLoading(true);
        try {
            const response = await getDegerlemeveDegerDusukluguKontrolleri(
                user.denetlenenId,
                user.yil,
                dipnotNo
            );
            setData(response.donusumMizanBobi || []);
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

    const columns = [
        { data: "detayKodu", title: "Hesap No", readOnly: true },
        { data: "hesapAdi", title: "Hesap Adı", readOnly: true },
        { data: "fisBorc", title: "Borç", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "fisAlacak", title: "Alacak", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "fisBakiye", title: "Bakiye", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    const processedData = data.map(item => ({
        ...item,
        fisBakiye: item.fisBorc - item.fisAlacak
    }));

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}>
                Değerleme ve Değer Düşüklüğü Kontrolleri
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
                    }
                }}
            >
                <HotTable
                    data={processedData}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={false}
                    stretchH="all"
                    width="100%"
                    height={processedData.length > 15 ? "calc(100vh - 300px)" : "auto"}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                />
                {processedData.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body1" color="textSecondary">Veri bulunmamaktadır.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default DegerlemeveDegerDusukluguKontrolleri;
