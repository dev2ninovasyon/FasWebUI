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
    getMaliyetKontrolleri,
    MaliyetKontrolleriResponseDto,
} from "@/api/CalismaKagitlari/MaliyetKontrolleri";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
}

const MaliyetKontrolleri: React.FC<Props> = ({
    parentName,
    childName,
    dipnotNo,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading } = useLoading();
    const [data, setData] = useState<MaliyetKontrolleriResponseDto[]>([]);
    const hotTableComponent = useRef<any>(null);

    const fetchData = async () => {
        if (!user.denetlenenId || !user.yil || !dipnotNo) {
            console.warn("Parametreler eksik, istek atılmıyor:", {
                denetlenenId: user.denetlenenId,
                yil: user.yil,
                dipnotNo
            });
            return;
        }
        setLoading(true);
        try {
            const response = await getMaliyetKontrolleri(
                user.denetlenenId,
                user.yil,
                dipnotNo
            );
            if (Array.isArray(response)) {
                console.log("Veri geldi, satır sayısı:", response.length);
                setData(response);
            } else {
                console.error("Beklenmeyen veri formatı:", response);
                enqueueSnackbar("Sunucudan geçersiz veri formatı alındı", { variant: "error" });
                setData([]);
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

    const columns = [
        { data: "hesapNo", title: "Hesap No", readOnly: true },
        { data: "hesapAciklamasi", title: "Hesap Açıklaması", readOnly: true },
        { data: "oncekiDonemBakiye", title: "Önceki Dönem Bakiye", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "cariDonemBakiye", title: "Cari Dönem Bakiye", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "degisimTL", title: "Değişim TL", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "degisimYuzde", title: "Değişim Yüzde", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    return (
        <Box>
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
                    },
                    "& .header-row": {
                        fontWeight: "bold",
                        backgroundColor: theme.palette.grey[200],
                        color: theme.palette.text.primary,
                    }
                }}
            >
                <HotTable
                    ref={hotTableComponent}
                    data={data}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={false}
                    stretchH="all"
                    width="100%"
                    height={Array.isArray(data) && data.length > 15 ? "calc(100vh - 300px)" : "auto"}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    cells={(row, col) => {
                        const cellProperties: any = {};
                        const rowData = data[row];
                        if (rowData?.isBold) {
                            cellProperties.className = (cellProperties.className || "") + " bold-row";
                        }
                        if (rowData?.isHeader) {
                            cellProperties.className = (cellProperties.className || "") + " header-row";
                        }
                        return cellProperties;
                    }}
                />

                {(!Array.isArray(data) || data.length === 0) && (
                    <Box
                        sx={{
                            p: 4,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: theme.palette.background.paper
                        }}
                    >
                        <Typography variant="body1" color="textSecondary">
                            Veri bulunmamaktadır.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default MaliyetKontrolleri;
