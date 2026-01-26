"use client";

import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import "@/utils/languages/handsontable.tr-TR";
import { Box, Typography, useTheme, Button } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getStoklarNetGerceklesebilirDeger,
    stoklarNetGerceklesebilirDegerOlustur,
    stokNetGerceklesebilirDegerUpdate,
    MdStokNetGerceklesebilirDeger,
} from "@/api/CalismaKagitlari/StoklarNetGerceklesebilirDeger";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";
import { IconRefresh } from "@tabler/icons-react";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
}

const StoklarNetGerceklesebilirDeger = forwardRef<any, Props>(({
    parentName,
    childName,
}, ref) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading } = useLoading();
    const [data, setData] = useState<MdStokNetGerceklesebilirDeger[]>([]);
    const hotTableComponent = useRef<any>(null);

    const fetchData = async () => {
        if (!user.denetlenenId || !user.yil) return;
        setLoading(true);
        try {
            const response = await getStoklarNetGerceklesebilirDeger(
                user.denetlenenId,
                user.yil
            );
            setData(response.stokVerileri || []);
        } catch (error) {
            console.error("Veri çekme hatası:", error);
            enqueueSnackbar("Veriler yüklenirken bir hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetlenenId, user.yil]);

    const handleOlustur = async () => {
        if (!user.denetlenenId || !user.yil) return;
        setLoading(true);
        try {
            const result = await stoklarNetGerceklesebilirDegerOlustur(user.denetlenenId, user.yil);
            if (result.success) {
                enqueueSnackbar(result.message, { variant: "success" });
                fetchData();
            } else {
                enqueueSnackbar(result.message, { variant: "error" });
            }
        } catch (error) {
            console.error("Oluşturma hatası:", error);
            enqueueSnackbar("Veriler oluşturulurken bir hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleOlustur
    }));

    const handleAfterChange = async (changes: any) => {
        if (!changes) return;

        for (const [row, prop, oldValue, newValue] of changes) {
            if (oldValue === newValue) continue;

            const rowData = data[row];
            if (!rowData) continue;

            const updatedRow = { ...rowData, [prop]: newValue };

            try {
                const result = await stokNetGerceklesebilirDegerUpdate({
                    id: updatedRow.id,
                    gercegeUygunDeger: updatedRow.gercegeUygunDeger,
                    tamamlamaMaliyeti: updatedRow.tamamlamaMaliyeti,
                    satisGiderleri: updatedRow.satisGiderleri,
                });
                if (result.success) {
                    const newData = [...data];
                    newData[row] = {
                        ...updatedRow,
                        netGerceklesebilirDeger: updatedRow.gercegeUygunDeger - updatedRow.tamamlamaMaliyeti - updatedRow.satisGiderleri,
                        degerDusukluguTutar: Math.max(0, updatedRow.maliyetDegeri - (updatedRow.gercegeUygunDeger - updatedRow.tamamlamaMaliyeti - updatedRow.satisGiderleri))
                    };
                    setData(newData);
                } else {
                    enqueueSnackbar(result.message, { variant: "error" });
                }
            } catch (error) {
                console.error("Güncelleme hatası:", error);
                enqueueSnackbar("Güncelleme sırasında bir hata oluştu", { variant: "error" });
            }
        }
    };

    const columns = [
        { data: "detayKodu", title: "Hesap No", readOnly: true },
        { data: "hesapAdi", title: "Hesap Adı", readOnly: true },
        { data: "maliyetDegeri", title: "Maliyet Değeri", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "gercegeUygunDeger", title: "Gerçeğe Uygun Değer", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
        { data: "tamamlamaMaliyeti", title: "Tamamlama Maliyeti", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
        { data: "satisGiderleri", title: "Satış Giderleri", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
        { data: "netGerceklesebilirDeger", title: "Net Gerçekleşebilir Değer", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "degerDusukluguTutar", title: "Değer Düşüklüğü Tutarı", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    return (
        <Box>
            {/* Buton ve Başlık Bölümü */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}>
                    Stoklar Net Gerçekleşebilir Değer
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<IconRefresh size={18} />}
                    onClick={handleOlustur}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: "600" }}
                >
                    Verileri Getir
                </Button>
            </Box>

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
                    ref={hotTableComponent}
                    data={data}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={false}
                    stretchH="all"
                    width="100%"
                    height={data.length > 15 ? "calc(100vh - 300px)" : "auto"}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    afterChange={handleAfterChange}
                />
                {data.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body1" color="textSecondary">
                            Veri bulunmamaktadır. Sağ üstteki buton yardımıyla verileri oluşturabilirsiniz.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
});

StoklarNetGerceklesebilirDeger.displayName = "StoklarNetGerceklesebilirDeger";

export default StoklarNetGerceklesebilirDeger;