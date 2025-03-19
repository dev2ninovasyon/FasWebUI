import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import {
  getCalismaKagidiVerileriByDenetciDenetlenenKullaniciYil,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import "ckeditor5/ckeditor5.css";
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
import "ckeditor5/ckeditor5.css";

interface Veri {
  id: number;
  metin: string;
}

interface CustomEditorProps {
  controller: string;

  personelId?: number;
}

const CustomEditor: React.FC<CustomEditorProps> = ({
  controller,
  personelId,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [editorData, setEditorData] = useState("");
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

  const handleUpdate = async () => {
    const updatedData = { id: veriler[0].id, metin: editorData };
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
    }
  };

  const handleChange = useCallback((event: any, editor: any) => {
    setEditorData(editor.getData());
  }, []);

  const fetchData = async () => {
    try {
      if (controller == "YillikTaahhutname") {
        const data =
          await getCalismaKagidiVerileriByDenetciDenetlenenKullaniciYil(
            controller,
            user.token || "",
            user.denetciId || 0,
            user.denetlenenId || 0,
            personelId || user.id || 0,
            user.yil || 0
          );

        if (data?.length > 0) {
          setVeriler(data);
          setEditorData(data[0].metin);
        } else {
          console.warn("No data found");
        }
      } else {
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
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [personelId]);

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
    <Box
      sx={
        lgDown
          ? { display: "flex", justifyContent: "center", width: "100%" }
          : {}
      }
    >
      <Box sx={{ width: "95%", margin: "auto" }}>
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={editorData}
          onChange={handleChange}
        />
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
    </Box>
  );
};

export default CustomEditor;
