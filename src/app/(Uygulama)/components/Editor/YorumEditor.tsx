import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { getYorum, saveYorum } from "@/api/Yorumlar/Yorumlar";
import {
  ClassicEditor,
  AccessibilityHelp,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  Bold,
  CloudServices,
  Code,
  CodeBlock,
  Essentials,
  GeneralHtmlSupport,
  Heading,
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
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextPartLanguage,
  TextTransformation,
  Undo,
} from "ckeditor5";
import translations from "ckeditor5/translations/tr.js";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import "ckeditor5/ckeditor5.css";
import "./custom.css";
import "./light.css";

interface YorumEditorProps {
  denetlenenId: number;
  yil: number;
  belgeAdi: string;
}

const YorumEditor: React.FC<YorumEditorProps> = ({ denetlenenId, yil, belgeAdi }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [editorData, setEditorData] = useState("");
  const [kayitMesaji, setKayitMesaji] = useState<string | null>(null);


  const handleUpdate = async (data: string) => {
    try {
      const result = await saveYorum(user.token || "", denetlenenId, yil, belgeAdi, data);
      if (result) {
        setKayitMesaji(
          `Kaydedildi - Son kaydedilme: ${new Date().toLocaleTimeString()}`
        );
      } else {
        setKayitMesaji("Kaydedilemedi!");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
      setKayitMesaji("Hata oluştu!");
    }
  };

  const handleChange = useCallback((event: any, editor: any) => {
    setEditorData(editor.getData());
  }, []);

  const fetchData = async () => {
    try {
      const result = await getYorum(user.token || "", denetlenenId, yil, belgeAdi);
      if (result && result.icerik) {
        setEditorData(result.icerik);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [denetlenenId, yil, belgeAdi]);

  useEffect(() => {
    // Initial mount'ta fetchData çalışıp editorData'yı set ettiğinde
    // bu effect'in tetiklenmesini istemeyebiliriz ama veri geldikten sonra kullanıcı değiştikçe tetiklenmeli.
    // Basit bir debounce yeterli.
    const timeout = setTimeout(() => {
      if (editorData) // Boş değilse kaydet (veya boş kaydetmeye izin verilebilir ama genelde gereksiz request)
        handleUpdate(editorData);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [editorData]);

  const editorConfig = {
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "showBlocks",
        "selectAll",
        "textPartLanguage",
        "|",
        "heading",
        "|",
        "bold",
        "italic",
        "removeFormat",
        "|",
        "pageBreak",
        "link",
        "insertTable",
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
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      Bold,
      CloudServices,
      Code,
      CodeBlock,
      Essentials,
      GeneralHtmlSupport,
      Heading,
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
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextPartLanguage,
      TextTransformation,
      Undo,
    ],
    heading: {
      options: [
        {
          model: "paragraph" as const,
          view: "p",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1" as const,
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2" as const,
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3" as const,
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4" as const,
          view: "h4",
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
        {
          model: "heading5" as const,
          view: "h5",
          title: "Heading 5",
          class: "ck-heading_heading5",
        },
        {
          model: "heading6" as const,
          view: "h6",
          title: "Heading 6",
          class: "ck-heading_heading6",
        },
      ],
    },
    language: "tr",
    placeholder: "İçeriğinizi buraya yazın veya yapıştırın!",
    translations: [translations],
  };
  return (
    <Grid
      container
      sx={{
        width: "95%",
        margin: "0 auto",
        justifyContent: "center",
      }}
    >
      <Grid item xs={12} lg={12}>
        <Card
          sx={{
            width: "100%",
            borderRadius: 3,
            boxShadow: "none",
            backgroundColor:
              customizer.activeMode === "dark" ? "#1A2027" : "#FFFFFF",
            color:
              customizer.activeMode === "dark"
                ? theme.palette.common.white
                : theme.palette.text.primary,
            border:
              customizer.activeMode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.12)"
                : "1px solid rgba(0, 0, 0, 0.08)",
            overflow: "visible", // Dropdownların görünmesi için kritik
            padding: 0,
          }}
        >
          <CardHeader
            title="Yorum & Notlar"
            titleTypographyProps={{
              variant: "h6",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
            sx={{
              padding: "16px 24px",
              borderBottom:
                customizer.activeMode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.12)"
                  : "1px solid rgba(0, 0, 0, 0.08)",
            }}
          />
          <CardContent sx={{ padding: "24px", maxHeight: "300px", overflow: "auto" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                margin: "0 auto",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              <Box sx={{ width: "100%", margin: "0 auto" }} className={customizer.activeMode === "dark" ? "ck-editor-dark" : "ck-editor-light"}>
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfig}
                  data={editorData}
                  onChange={handleChange}
                />
              </Box>
              {kayitMesaji && (
                <Typography
                  variant="body2"
                  sx={{
                    marginTop: 2,
                    color: "gray",
                    textAlign: "right",
                    width: "100%",
                  }}
                >
                  {kayitMesaji}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default YorumEditor;
