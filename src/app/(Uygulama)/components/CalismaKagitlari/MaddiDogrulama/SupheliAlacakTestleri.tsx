"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
import "@/utils/languages/handsontable.tr-TR";

import { Box, Typography, Button, Snackbar, Alert, CircularProgress, useTheme } from "@mui/material";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getSupheliAlacakTestleri,
    updateSupheliAlacakTestleri,
    addSupheliAlacakTestleri,
    varsayilanaDon,
    SupheliAlacakTestleriData,
} from "@/api/CalismaKagitlari/SupheliAlacakTestleri";

// Handsontable modüllerini kaydet
registerAllModules();

interface Props {
    dipnotNo: string;
    modelAdi: string;
    isClickedVarsayilanaDon: boolean;
    setIsClickedVarsayilanaDon: (deger: boolean) => void;
}

const SupheliAlacakTestleri: React.FC<Props> = ({
    dipnotNo,
    isClickedVarsayilanaDon,
    setIsClickedVarsayilanaDon
}) => {
    const theme = useTheme();
    const hotRef = useRef<any>(null);
    const [veriler, setVeriler] = useState<SupheliAlacakTestleriData[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: AppState) => state.userReducer);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    const fetchData = useCallback(async () => {
        if (user.token && user.denetciId && user.yil && user.denetlenenId && dipnotNo) {
            setLoading(true);
            try {
                const result = await getSupheliAlacakTestleri(user.token, user.denetciId, user.yil, user.denetlenenId, dipnotNo);
                setVeriler(result || []);
            } catch (error) {
                showSnackbar("Veriler yüklenirken hata oluştu.", "error");
            } finally {
                setLoading(false);
            }
        }
    }, [user.token, user.denetciId, user.yil, user.denetlenenId, dipnotNo]);

    useEffect(() => {
        const handleVarsayilanaDon = async () => {
            if (isClickedVarsayilanaDon && user.token) {
                try {
                    setLoading(true);
                    const success = await varsayilanaDon(
                        user.token,
                        user.denetciId || 0,
                        user.yil || 0,
                        user.denetlenenId || 0,
                        dipnotNo
                    );
                    if (success) {
                        showSnackbar("Veriler başarıyla sıfırlandı.", "success");
                        await fetchData();
                    }
                } catch (error) {
                    showSnackbar("Sıfırlama işlemi sırasında hata oluştu.", "error");
                } finally {
                    setIsClickedVarsayilanaDon(false);
                    setLoading(false);
                }
            }
        };

        handleVarsayilanaDon();
    }, [isClickedVarsayilanaDon, user, dipnotNo, fetchData, setIsClickedVarsayilanaDon]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSaveRow = async () => {
        const hotInstance = hotRef.current?.hotInstance;
        const selected = hotInstance.getSelected();

        if (!selected) {
            showSnackbar("Lütfen kaydetmek istediğiniz satırı seçin.", "error");
            return;
        }

        const rowIndex = selected[0][0];
        const rowData = hotInstance.getSourceDataAtRow(rowIndex);

        try {
            let success;
            if (!rowData.id || rowData.id === 0) {
                success = await addSupheliAlacakTestleri(user.token!, {
                    ...rowData,
                    dipnotNo,
                    baslik: veriler[0]?.baslik || "Şüpheli Alacak Testleri"
                });
            } else {
                success = await updateSupheliAlacakTestleri(user.token!, rowData.id, rowData);
            }

            if (success) {
                showSnackbar("Başarıyla kaydedildi.", "success");
                fetchData();
            }
        } catch (error) {
            showSnackbar("Kaydetme hatası!", "error");
        }
    };

    const handleAfterChange = (changes: any, source: string) => {
        if (source === 'loadData' || !changes) return;
        const hotInstance = hotRef.current?.hotInstance;

        for (const [row, prop, oldValue, newValue] of changes) {
            if (oldValue === newValue) continue;

            const rowData = hotInstance.getSourceDataAtRow(row);

            if (prop === 'oncekiDonemBakiye' || prop === 'cariDonemBakiye') {
                const onceki = Number(prop === 'oncekiDonemBakiye' ? newValue : rowData.oncekiDonemBakiye) || 0;
                const cari = Number(prop === 'cariDonemBakiye' ? newValue : rowData.cariDonemBakiye) || 0;
                hotInstance.setDataAtRowProp(row, 'degisimTl', Math.abs(onceki - cari), 'internal');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Şüpheli Alacak Testleri</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<IconDeviceFloppy size={16} />}
                    onClick={handleSaveRow}
                    sx={{ px: 2, borderRadius: "6px", fontSize: '0.8125rem' }}
                >
                    Seçili Satırı Kaydet
                </Button>
            </Box>

            <Box sx={{
                width: '100%',
                border: '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                "& .handsontable th": {
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                },
            }}>
                <HotTable
                    ref={hotRef}
                    data={veriler}
                    language="tr-TR"
                    colHeaders={[
                        "Hesap No",
                        "Hesap Adı",
                        "Önceki Dönem Bakiye",
                        "Cari Dönem Bakiye",
                        "Değişim (TL)",
                        "Avukat Mektubu"
                    ]}
                    columns={[
                        { data: 'hesapNo', type: 'text' },
                        { data: 'hesapAdi', type: 'text' },
                        { data: 'oncekiDonemBakiye', type: 'numeric', numericFormat: { pattern: '0,0.00', culture: 'tr-TR' } },
                        { data: 'cariDonemBakiye', type: 'numeric', numericFormat: { pattern: '0,0.00', culture: 'tr-TR' } },
                        { data: 'degisimTl', type: 'numeric', numericFormat: { pattern: '0,0.00', culture: 'tr-TR' }, readOnly: true },
                        { data: 'avukatMektubu', type: 'text' }
                    ]}
                    stretchH="all"
                    height="auto"
                    autoWrapRow={true}
                    autoWrapCol={true}
                    dropdownMenu={true}
                    filters={true}
                    contextMenu={{
                        items: {
                            "row_above": { name: "Üste Satır Ekle" },
                            "row_below": { name: "Alta Satır Ekle" },
                            "separator": Handsontable.plugins.ContextMenu.SEPARATOR,
                            "remove_row": { name: "Seçili Satırı Sil" },
                            "undo": { name: "Geri Al" },
                            "redo": { name: "İleri Al" }
                        }
                    }}
                    afterCreateRow={(index, amount) => {
                        const hotInstance = hotRef.current?.hotInstance;
                        for (let i = 0; i < amount; i++) {
                            hotInstance.setDataAtRowProp(index + i, 'id', 0);
                            hotInstance.setDataAtRowProp(index + i, 'oncekiDonemBakiye', 0);
                            hotInstance.setDataAtRowProp(index + i, 'cariDonemBakiye', 0);
                            hotInstance.setDataAtRowProp(index + i, 'degisimTl', 0);
                        }
                    }}
                    afterChange={handleAfterChange}
                    licenseKey="non-commercial-and-evaluation"
                />
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SupheliAlacakTestleri;