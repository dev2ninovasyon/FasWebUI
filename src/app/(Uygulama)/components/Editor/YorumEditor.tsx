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

interface Veri {
  id: number;
  metin: string;
}

interface YorumEditorProps {
  controller: string;
}

const YorumEditor: React.FC<YorumEditorProps> = ({ controller }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [editorData, setEditorData] = useState("");
  const [kayitMesaji, setKayitMesaji] = useState<string | null>(null);

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

  const handleUpdate = async () => {
    /* const updatedData = { id: veriler[0].id, metin: editorData };
    try {
      const result = await updateCalismaKagidiVerisi(
        controller,
        user.token || "",
        veriler[0]?.id,
        updatedData
      );

      if (!result) {
        console.error("Çalışma Kağıdı Verisi düzenleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }*/
  };

  const handleChange = useCallback((event: any, editor: any) => {
    setEditorData(editor.getData());
  }, []);

  const fetchData = async () => {
    /* try {
      const data = await getCalismaKagidiVerileriByDenetciDenetlenenYil(
        controller,
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      if (data?.length > 0) {
        setVeriler(data);
        setEditorData(data[0].metin);
      } else {
        console.warn("No data found");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }*/
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!editorData) return;

    const timeout = setTimeout(() => {
      handleUpdate();
      setKayitMesaji(
        `Kaydedildi - Son kaydedilme: ${new Date().toLocaleTimeString()}`
      );
    }, 3000);

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
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor:
              customizer.activeMode === "dark" ? "#0e121a" : "#cccccc",
            color:
              customizer.activeMode === "dark"
                ? theme.palette.common.white
                : theme.palette.common.black,
            padding: 2,
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
                wordBreak: "break-word",
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
