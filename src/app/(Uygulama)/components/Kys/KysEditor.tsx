"use client";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useCallback, useEffect, useState, FC } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import {
    getKysBelgelerEditorText,
    saveKysBelgelerEditorText,
} from "@/api/Kys/KysBelgelerEditorApi";
import { IconDeviceFloppy } from "@tabler/icons-react";
import LexicalEditor from "../Editor/LexicalEditor";

interface KysEditorProps {
    formKodu: string;
    alanAdi?: string;
    defaultContent?: string;
    readOnly?: boolean;
}

const KysEditor: FC<KysEditorProps> = ({ formKodu, alanAdi, defaultContent, readOnly = false }) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);

    const [editorData, setEditorData] = useState("");
    const [sonGuncelleme, setSonGuncelleme] = useState<string | null>(null);
    const [kayitMesaji, setKayitMesaji] = useState<string | null>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const el = (e.target as HTMLElement).closest('.opt') as HTMLElement | null;
            if (!el) return;

            const q = el.dataset.q;
            if (!q) return;

            document
                .querySelectorAll(`.opt[data-q="${q}"]`)
                .forEach(x => (x.textContent = '☐'));

            el.textContent = '☑';
        };

        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const fetchData = async () => {
        try {
            const result = await getKysBelgelerEditorText(formKodu,
                user.denetlenenId || 0,
                user.yil || 0
            );

            if (Array.isArray(result) && result.length > 0) {
                setEditorData(result[0].metin || defaultContent || "");
                setSonGuncelleme(result[0].guncellemeTarihi || null);
            } else if (result && result.metin) {
                setEditorData(result.metin);
                setSonGuncelleme(result.guncellemeTarihi || null);
            } else {
                setEditorData(defaultContent || "");
                setSonGuncelleme(null);
            }
        } catch (error) {
            console.log("Veri getirme hatası:", error);
        }
    };

    const handleSave = async () => {
        try {
            const data = {
                formKodu: formKodu,
                denetlenenId: user.denetlenenId || 0,
                yil: user.yil || 0,
                metin: editorData,
            };

            await saveKysBelgelerEditorText(data);

            const now = new Date();
            setSonGuncelleme(now.toISOString());

            setKayitMesaji(
                `Kaydedildi`
            );
            setTimeout(() => setKayitMesaji(null), 3000);

        } catch (error) {
            console.log("Kaydetme hatası:", error);
            setKayitMesaji("Hata oluştu!");
        }
    };

    const handleChange = useCallback((html: string) => {
        setEditorData(html);
    }, []);

    useEffect(() => {
        fetchData();
    }, [formKodu]);

    return (
        <Box sx={{ width: "100%", margin: "auto" }}>
            <LexicalEditor
                initialValue={editorData}
                onChange={handleChange}
                mode={customizer.activeMode === "dark" ? "dark" : "light"}
                placeholder="İçeriğinizi buraya yazın..."
            />

            {!readOnly && (
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                    {sonGuncelleme && (
                        <Typography variant="body2" color="text.secondary">
                            Son Kaydedilme: {new Date(sonGuncelleme).toLocaleString("tr-TR")}
                        </Typography>
                    )}
                    {kayitMesaji && (
                        <Typography variant="body2" color={kayitMesaji.includes("Hata") ? "error" : "success.main"}>
                            {kayitMesaji}
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<IconDeviceFloppy />}
                        onClick={handleSave}
                    >
                        Kaydet
                    </Button>
                </Stack>
            )}
        </Box>
    );
};

export default KysEditor;

