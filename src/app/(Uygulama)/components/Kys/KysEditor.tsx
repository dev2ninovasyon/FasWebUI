"use client";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Box, Typography, useMediaQuery, Button, Stack } from "@mui/material";
import { useCallback, useEffect, useState, FC } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import {
    getKysBelgelerEditorText,
    saveKysBelgelerEditorText,
} from "@/api/Kys/KysBelgelerEditorApi";
import { IconDeviceFloppy } from "@tabler/icons-react";

import {
    ClassicEditor,
    AccessibilityHelp,
    Alignment,
    Autoformat,
    AutoImage,
    AutoLink,
    Autosave,
    BlockQuote,
    Bold,
    CloudServices,
    Code,
    CodeBlock,
    Essentials,
    FindAndReplace,
    Font,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    GeneralHtmlSupport,
    Heading,
    HorizontalLine,
    HtmlComment,
    HtmlEmbed,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Italic,
    Link,
    LinkImage,
    List,
    ListProperties,
    PageBreak,
    Paragraph,
    PasteFromOffice,
    RemoveFormat,
    SelectAll,
    ShowBlocks,
    SimpleUploadAdapter,
    SourceEditing,
    SpecialCharacters,
    SpecialCharactersEssentials,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextPartLanguage,
    TextTransformation,
    Underline,
    Undo,
} from "ckeditor5";
import translations from "ckeditor5/translations/tr.js";
import "ckeditor5/ckeditor5.css";

// Import styles from Editor directory
import "@/app/(Uygulama)/components/Editor/custom.css";
// light.css logic handled below via dynamic import or just standard import if possible.
// CustomEditor uses dynamic import for theme switching. I will replicate that logic but pointing to correct path.

interface KysEditorProps {
    formKodu: string;
    alanAdi?: string;
    defaultContent?: string;
    readOnly?: boolean;
}

const KysEditor: FC<KysEditorProps> = ({ formKodu, alanAdi, defaultContent, readOnly = false }) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

    const [editorData, setEditorData] = useState("");
    const [sonGuncelleme, setSonGuncelleme] = useState<string | null>(null);
    const [kayitMesaji, setKayitMesaji] = useState<string | null>(null);

    useEffect(() => {
        const loadStyles = async () => {
            if (customizer.activeMode === "dark") {
                await import("@/app/(Uygulama)/components/Editor/custom.css");
            } else {
                await import("@/app/(Uygulama)/components/Editor/light.css");
            }
        };
        loadStyles();
    }, [customizer.activeMode]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const el = (e.target as HTMLElement).closest('.opt') as HTMLElement | null;
            if (!el) return;

            const q = el.dataset.q;
            if (!q) return;

            document
                .querySelectorAll(`.opt[data-q="${q}"]`)
                .forEach(x => (x.textContent = 'â˜'));

            el.textContent = 'â˜‘';
        };

        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const fetchData = async () => {
        try {
            const result = await getKysBelgelerEditorText(
                user.token || "",
                formKodu,
                user.denetlenenId || 0,
                user.yil || 0
            );

            // Backend might return a list or single object. Adapting to both.
            if (Array.isArray(result) && result.length > 0) {
                setEditorData(result[0].metin || defaultContent || "");
                setSonGuncelleme(result[0].guncellemeTarihi || null);
            } else if (result && result.metin) {
                setEditorData(result.metin);
                setSonGuncelleme(result.guncellemeTarihi || null);
            } else {
                setEditorData(defaultContent || ""); // No data so load default
                setSonGuncelleme(null);
            }
        } catch (error) {
            console.error("Veri getirme hatası:", error);
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

            const result = await saveKysBelgelerEditorText(user.token || "", data);

            // Eğer backend başarılı kayıttan sonra yeni objeyi veya tarihi dönerse onu kullanabiliriz
            // Şimdilik anlık zamanı gösterelim, bir sonraki refresh'te DB'den gelir
            const now = new Date();
            setSonGuncelleme(now.toISOString()); // Veya result.guncellemeTarihi

            setKayitMesaji(
                `Kaydedildi`
            );
            setTimeout(() => setKayitMesaji(null), 3000);

        } catch (error) {
            console.error("Kaydetme hatası:", error);
            setKayitMesaji("Hata oluştu!");
        }
    };

    // Auto-save logic (optional, keeping manual save for now but user asked for "editable structure", usually auto-save is nice but explicit save is clearer for forms)
    // CustomEditor had auto-save on change + timeout. I'll add a manual Save Button as well for clarity or stick to CustomEditor's auto-save.
    // User asked for "veritabaından controlller service ve repo olarak ekleyelim".
    // Let's add a manual save button to be safe and explicit.

    const handleChange = useCallback((event: any, editor: any) => {
        setEditorData(editor.getData());
    }, []);

    useEffect(() => {
        fetchData();
    }, [formKodu]);

    const editorConfig = {
        toolbar: {
            items: [
                "undo",
                "redo",
                "|",
                "sourceEditing",
                "findAndReplace",
                "showBlocks",
                "selectAll",
                "textPartLanguage",
                "|",
                "heading",
                "|",
                "fontSize",
                "fontFamily",
                "fontColor",
                "fontBackgroundColor",
                "|",
                "bold",
                "italic",
                "underline",
                "removeFormat",
                "|",
                "alignment",
                "|",
                "specialCharacters",
                "horizontalLine",
                "pageBreak",
                "link",
                "insertImage",
                "insertTable",
                "blockQuote",
                "codeBlock",
                "htmlEmbed",
                "|",
                "bulletedList",
                "numberedList",
                "|",
                "accessibilityHelp",
            ],
            shouldNotGroupWhenFull: false,
        },
        plugins: [
            AccessibilityHelp,
            Alignment,
            Autoformat,
            AutoImage,
            AutoLink,
            Autosave,
            BlockQuote,
            Bold,
            CloudServices,
            Code,
            CodeBlock,
            Essentials,
            FindAndReplace,
            Font,
            FontBackgroundColor,
            FontColor,
            FontFamily,
            FontSize,
            GeneralHtmlSupport,
            Heading,
            HorizontalLine,
            HtmlComment,
            HtmlEmbed,
            ImageBlock,
            ImageCaption,
            ImageInline,
            ImageInsert,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageTextAlternative,
            ImageToolbar,
            ImageUpload,
            Italic,
            Link,
            LinkImage,
            List,
            ListProperties,
            PageBreak,
            Paragraph,
            PasteFromOffice,
            RemoveFormat,
            SelectAll,
            ShowBlocks,
            SimpleUploadAdapter,
            SourceEditing,
            SpecialCharacters,
            SpecialCharactersEssentials,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TextPartLanguage,
            TextTransformation,
            Underline,
            Undo,
        ],
        image: {
            toolbar: [
                "toggleImageCaption",
                "imageTextAlternative",
                "|",
                "imageStyle:inline",
                "imageStyle:block",
                "|",
                "imageStyle:side",
                "|",
                "resizeImage"
            ],
        },
        table: {
            contentToolbar: [
                "tableColumn",
                "tableRow",
                "mergeTableCells",
                "tableProperties",
                "tableCellProperties",
                "toggleTableCaption"
            ],
        },
        heading: {
            options: [
                { model: "paragraph" as const, view: "p", title: "Paragraph", class: "ck-heading_paragraph" },
                { model: "heading1" as const, view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
                { model: "heading2" as const, view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
                { model: "heading3" as const, view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
            ],
        },
        language: "tr",
        placeholder: "İçeriğinizi buraya yazın...",
        translations: [translations],
        htmlSupport: {
            allow: [
                {
                    name: /.*/,
                    attributes: true,
                    classes: true,
                    styles: true
                }
            ]
        } as any
    };

    return (
        <Box sx={{ width: "100%", margin: "auto" }}>

            <CKEditor
                editor={ClassicEditor}
                config={{
                    ...editorConfig,
                    ...(readOnly ? { toolbar: { items: [] } } : {})
                }}
                data={editorData}
                onChange={handleChange}
                disabled={readOnly}
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
