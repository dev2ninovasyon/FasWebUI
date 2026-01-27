"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { KysRiskMatrisi, getAllKysRiskMatrisi } from "@/api/Kys/KysRiskMatrisi";
import { riskMatrixSections, documentMapping } from "@/api/Kys/KysRiskMatrixConstants";
import { getKysBelgeler as getKysBelgelerType1 } from "@/api/Kys/KysBelgelerApi";
import { getKysBelgelerEditorText as getKysBelgelerType2 } from "@/api/Kys/KysBelgelerEditorApi";
import { getKysBelgeler as getKysBelgelerType3 } from "@/api/Kys/KysBelgelerUcSutunApi";
import { getKysBelge as getKysBelgeType4 } from "@/api/Kys/KysBelge";
import { PDFViewer } from "@react-pdf/renderer";
import KysRiskMatrixPdfDocument from "./Export/KysRiskMatrixPdfDocument";
import { exportRiskMatrixToWord } from "./Export/KysRiskMatrixWordExport";

const KysRiskMatrixExport: React.FC = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [loading, setLoading] = useState(true);
    const [matrices, setMatrices] = useState<KysRiskMatrisi[]>([]);
    const [relatedDocsData, setRelatedDocsData] = useState<Record<string, any>>({});
    const [pdfOpen, setPdfOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user.token || !user.denetlenenId || !user.yil) return;
            setLoading(true);

            // Fetch all risk matrices
            const matrixData = await getAllKysRiskMatrisi(
                user.token,
                user.denetciId,
                user.denetlenenId,
                user.yil
            );
            setMatrices(matrixData);

            // Fetch all related documents content
            const docsData: Record<string, any> = {};
            const allDocKeys = Array.from(new Set(riskMatrixSections.flatMap(s => s.documents)));

            await Promise.all(allDocKeys.map(async (docKey) => {
                const doc = documentMapping[docKey];
                if (!doc) return;

                try {
                    const token = user.token as string;
                    const denetlenenId = user.denetlenenId as number;
                    const yil = user.yil as number;
                    const denetciId = user.denetciId as number;

                    let data = null;
                    if (doc.type === 1) {
                        data = await getKysBelgelerType1(token, doc.formKodu, denetlenenId, yil);
                    } else if (doc.type === 2) {
                        data = await getKysBelgelerType2(token, doc.formKodu, denetlenenId, yil);
                    } else if (doc.type === 3) {
                        data = await getKysBelgelerType3(token, doc.formKodu, denetlenenId, yil);
                    } else if (doc.type === 4) {
                        data = await getKysBelgeType4(token, doc.formKodu, denetciId, denetlenenId, yil);
                    }
                    if (data) {
                        docsData[doc.formKodu] = data;
                    }
                } catch (e) {
                    console.error(`Error fetching doc ${doc.formKodu}:`, e);
                }
            }));

            setRelatedDocsData(docsData);
            setLoading(false);
        };
        fetchData();
    }, [user.token, user.denetciId, user.denetlenenId, user.yil]);

    const handleWordExport = async () => {
        await exportRiskMatrixToWord(matrices, relatedDocsData, "Denetlenen Kurum", user.yil || 0);
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (matrices.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body1">Henüz kaydedilmiş bir risk matrisi bulunamadı.</Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={0} sx={{ p: 4, border: "1px solid #e0e0e0" }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: "#1976d2" }}>
                Risk Matrislerini Dışa Aktar (PDF & Word)
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
                Aşağıdaki butonları kullanarak tüm bölümlere ait risk matrislerini tek bir dosyada birleştirebilirsiniz.
                Bu işlem kaydedilmiş olan veriler üzerinden gerçekleştirilir.
            </Typography>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => setPdfOpen(true)}
                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                    PDF Olarak Görüntüle
                </Button>

                <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleWordExport}
                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                    Word Olarak İndir
                </Button>
            </Box>

            <Divider sx={{ my: 5 }} />

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Önizleme (Birleştirilecek Bölümler):
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
                {matrices.map((m, i) => (
                    <Typography component="li" key={i} sx={{ mb: 1 }}>
                        {m.baslik}
                    </Typography>
                ))}
            </Box>

            {/* PDF Preview Dialog */}
            <Dialog
                open={pdfOpen}
                onClose={() => setPdfOpen(false)}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Risk Matrisi PDF Önizleme
                    <Button onClick={() => setPdfOpen(false)}>Kapat</Button>
                </DialogTitle>
                <DialogContent sx={{ height: '80vh', p: 0 }}>
                    <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                        <KysRiskMatrixPdfDocument
                            data={matrices}
                            relatedDocs={relatedDocsData}
                            companyName="Denetlenen Kurum"
                            year={user.yil || 0}
                        />
                    </PDFViewer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPdfOpen(false)} color="primary">Kapat</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default KysRiskMatrixExport;
