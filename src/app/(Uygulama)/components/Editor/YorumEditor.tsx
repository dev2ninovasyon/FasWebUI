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
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import {
  createCalismaKagidiVerisi,
  deleteAllCalismaKagidiVerileri,
  deleteCalismaKagidiVerisiById,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
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
  View,
} from "ckeditor5";
import translations from "ckeditor5/translations/tr.js";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import "ckeditor5/ckeditor5.css";
import debounce from "lodash/debounce";

interface Veri {
  id: number;
  metin: string;
  standartMi: boolean;
}

const YorumEditor: React.FC = ({}) => {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const user = useSelector((state: AppState) => state.userReducer);
  const [editorData, setEditorData] = useState(""); // Track editor data
  const [kayitMesaji, setKayitMesaji] = useState<string | null>(null); // State for save message

  useEffect(() => {
    const loadStyles = async () => {
      if (customizer.activeMode === "dark") {
        await import("./custom.css");
      } else {
        await import("./light.css");
      }
    };
    loadStyles();
  }, [customizer.activeMode]);

  const debouncedSave = useCallback(
    debounce((data: string): void => {
      console.log("Editor data saved:", data); // Your save logic here
      const timestamp = `Son kaydedilme: ${new Date().toLocaleTimeString()}`;
      setKayitMesaji(`Kaydedildi - ${timestamp}`);
    }, 1000), // 1 second delay before saving
    []
  );
  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    console.log("Editor data changed:", data);
    setEditorData(data); // Update editor data state

    // Show the save message with the current time
    debouncedSave(data); // Trigger debounced save function
  };

  // This function will update the database when the content changes

  // Trigger the update when editor data changes
  useEffect(() => {
    if (editorData) {
    }
  }, [editorData]); // This will trigger when the content changes

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
        justifyContent: "center", // Ortalamayı sağlamak için
      }}
    >
      <Grid item xs={12} lg={12}>
        {/* YorumEditor'ı Card içinde sarmalıyoruz */}
        <Card
          sx={{
            width: "100%",
            borderRadius: 2, // Card köşe yuvarlatma
            boxShadow: 3, // Hafif gölge ekleme
            backgroundColor:
              customizer.activeMode === "dark" ? "#0e121a" : "#f5f5f5", // Dark ve Light tema için farklı arka plan
            color: customizer.activeMode === "dark" ? "#fff" : "#000", // Tema bazlı yazı rengi
            padding: 2, // İçerik için padding
          }}
        >
          <CardHeader
            title="Yorum"
            sx={{
              fontWeight: "bold",
              padding: "16px",
              fontSize: "1.25rem",
            }}
          />
          <Divider></Divider>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                margin: "0 auto",
                wordBreak: "break-word", // İçerik taşmasını önler
                overflowWrap: "break-word",
              }}
            >
              <Box sx={{ width: "100%", margin: "0 auto" }}>
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfig}
                  data={editorData}
                  onChange={handleChange}
                />
              </Box>
              {/* Save message display */}
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
