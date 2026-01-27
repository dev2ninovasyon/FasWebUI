"use client";

import React, { useEffect, useState, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import "@/utils/languages/handsontable.tr-TR";
import { Box, Typography, useTheme, Divider } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getKidemTazminatiCalismasi,
    KidemTazminatiHesaplamaSonuclari,
} from "@/api/CalismaKagitlari/KidemTazminatiCalismasi";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const KidemTazminatiCalismasi: React.FC<Props> = ({
    parentName,
    childName,
    dipnotNo,
    isReport,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading } = useLoading();
    const [dataBobi, setDataBobi] = useState<KidemTazminatiHesaplamaSonuclari[]>([]);
    const [dataOncekiBobi, setDataOncekiBobi] = useState<KidemTazminatiHesaplamaSonuclari[]>([]);

    const fetchData = async () => {
        if (!user.denetlenenId || !user.yil || !dipnotNo) return;
        setLoading(true);
        try {
            const response = await getKidemTazminatiCalismasi(
                user.denetciId || 0,
                user.denetlenenId,
                user.yil,
                dipnotNo
            );
            setDataBobi(response.kidemVerileriBobi || []);
            setDataOncekiBobi(response.kidemVerileriOncekiYilBobi || []);
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
        { data: "tcKimlikNo", title: "TC Kimlik No", readOnly: true },
        { data: "adiSoyadi", title: "Adı Soyadı", readOnly: true },
        { data: "kidemTazminati", title: "Kıdem Tazminatı", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "ihbarTazminati", title: "İhbar Tazminatı", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "toplamTutar", title: "Toplam Tutar", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: isReport ? 2 : 4 }}>
            <Box>
                {!isReport && (
                    <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}>
                        Cari Dönem Kıdem Tazminatı Çalışması ({user.yil || ""})
                    </Typography>
                )}
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
                        data={dataBobi}
                        columns={columns}
                        colHeaders={true}
                        rowHeaders={false}
                        stretchH="all"
                        width="100%"
                        height="auto"
                        autoWrapRow={true}
                        autoWrapCol={true}
                        language="tr-TR"
                        licenseKey="non-commercial-and-evaluation"
                        className={customizer.activeMode === "dark" ? "htDark" : ""}
                        readOnly={isReport}
                        contextMenu={isReport ? false : true}
                        dropdownMenu={!isReport}
                        manualColumnResize={!isReport}
                        filters={!isReport}
                        columnSorting={!isReport}
                    />
                    {dataBobi.length === 0 && (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <Typography variant="body1" color="textSecondary">Veri bulunmamaktadır.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            <Divider />

            <Box>
                {!isReport && (
                    <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}>
                        Önceki Dönem Kıdem Tazminatı Çalışması ({(user.yil || 0) - 1})
                    </Typography>
                )}
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
                        data={dataOncekiBobi}
                        columns={columns}
                        colHeaders={true}
                        rowHeaders={false}
                        stretchH="all"
                        width="100%"
                        height="auto"
                        autoWrapRow={true}
                        autoWrapCol={true}
                        language="tr-TR"
                        licenseKey="non-commercial-and-evaluation"
                        className={customizer.activeMode === "dark" ? "htDark" : ""}
                        readOnly={isReport}
                        contextMenu={isReport ? false : true}
                        dropdownMenu={!isReport}
                        manualColumnResize={!isReport}
                        filters={!isReport}
                        columnSorting={!isReport}
                    />
                    {dataOncekiBobi.length === 0 && (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <Typography variant="body1" color="textSecondary">Veri bulunmamaktadır.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default KidemTazminatiCalismasi;
