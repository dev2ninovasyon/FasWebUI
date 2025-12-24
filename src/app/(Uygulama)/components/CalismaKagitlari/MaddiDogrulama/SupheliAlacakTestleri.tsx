"use client";

import React, { useEffect, useState, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";

import "@/utils/languages/handsontable.tr-TR";

import { Box, Typography, Button, Snackbar, Alert, CircularProgress } from "@mui/material";
import { IconDeviceFloppy, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getSupheliAlacakTestleri,
    updateSupheliAlacakTestleri,
    addSupheliAlacakTestleri,
    deleteSupheliAlacakTestleri,
    varsayilanaDonSupheliAlacakTestleri,
    SupheliAlacakTestleriData,
} from "@/api/CalismaKagitlari/SupheliAlacakTestleri";

// Handsontable modüllerini kaydet
registerAllModules();

interface Props {
    dipnotNo: string;
    modelAdi: string;
}

const SupheliAlacakTestleri: React.FC<Props> = ({ dipnotNo, modelAdi }) => {
    const hotRef = useRef<any>(null);
    const [veriler, setVeriler] = useState<SupheliAlacakTestleriData[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: AppState) => state.userReducer);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    const fetchData = async () => {
        if (user.token && user.denetciId && user.yil && user.denetlenenId) {
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
    };

    useEffect(() => { fetchData(); }, [user, dipnotNo]);

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    // Handsontable Değişiklik Yönetimi
    const handleAfterChange = async (changes: any, source: string) => {
        if (source === 'loadData' || !changes) return;

        const hotInstance = hotRef.current?.hotInstance;

        for (const [row, prop, oldValue, newValue] of changes) {
            if (oldValue === newValue) continue;

            const rowData = hotInstance.getSourceDataAtRow(row);

            // Otomatik Değişim TL Hesaplama (Client-side görsel destek)
            if (prop === 'oncekiDonemBakiye' || prop === 'cariDonemBakiye') {
                const onceki = prop === 'oncekiDonemBakiye' ? newValue : rowData.oncekiDonemBakiye;
                const cari = prop === 'cariDonemBakiye' ? newValue : rowData.cariDonemBakiye;
                const fark = Math.abs((Number(onceki) || 0) - (Number(cari) || 0));
                hotInstance.setDataAtRowProp(row, 'degisimTl', fark, 'internal');
            }
        }
    };

    const handleSaveRow = async () => {
        const hotInstance = hotRef.current?.hotInstance;
        const selectedRange = hotInstance.getSelected();

        if (!selectedRange) {
            showSnackbar("Lütfen kaydetmek istediğiniz satırı seçin.", "error");
            return;
        }

        const rowIndex = selectedRange[0][0];
        const rowData = hotInstance.getSourceDataAtRow(rowIndex);

        try {
            let success;
            if (rowData.id === 0) {
                success = await addSupheliAlacakTestleri(user.token!, { ...rowData, dipnotNo, baslik: veriler[0]?.baslik || "Şüpheli Alacak Testleri" });
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

    const handleAddRow = () => {
        const hotInstance = hotRef.current?.hotInstance;
        hotInstance.alter('insert_row_below', hotInstance.countRows());
        const lastRowIndex = hotInstance.countRows() - 1;

        // Yeni satıra default değerleri ata
        hotInstance.setSourceDataAtCell(lastRowIndex, 'id', 0);
        hotInstance.setSourceDataAtCell(lastRowIndex, 'oncekiDonemBakiye', 0);
        hotInstance.setSourceDataAtCell(lastRowIndex, 'cariDonemBakiye', 0);
        hotInstance.setSourceDataAtCell(lastRowIndex, 'degisimTl', 0);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {veriler[0]?.baslik || "Şüpheli Alacak Testleri"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="contained" color="primary" startIcon={<IconPlus size={18} />} onClick={handleAddRow}>
                        Yeni Satır
                    </Button>
                    <Button variant="contained" color="success" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSaveRow}>
                        Seçili Satırı Kaydet
                    </Button>
                    <Button variant="contained" color="warning" startIcon={<IconRefresh size={18} />} onClick={() => fetchData()}>
                        Yenile
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            ) : (
                <Box sx={{ width: '100%', overflow: 'hidden', border: '1px solid #ddd' }}>
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
                        contextMenu={['remove_row', 'undo', 'redo']}
                        afterChange={handleAfterChange}
                        licenseKey="non-commercial-and-evaluation" // Geliştirme için
                    />
                </Box>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default SupheliAlacakTestleri;