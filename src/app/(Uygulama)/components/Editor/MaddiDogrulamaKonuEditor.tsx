import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Box, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
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

interface Veri {
  id: number;
  metin: string;
  standartMi: boolean;
}

interface MaddiDogrulamaKonuEditorProps {
  konu?: string;

  handleSetSelectedKonu: (a: string) => void;
}

const MaddiDogrulamaKonuEditor: React.FC<MaddiDogrulamaKonuEditorProps> = ({
  konu,
  handleSetSelectedKonu,
}) => {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const [veriler, setVeriler] = useState<Veri[]>([]);
  const customizer = useSelector((state: AppState) => state.customizer);
  const user = useSelector((state: AppState) => state.userReducer);
  const [selectedId, setSelectedId] = useState(0);
  const [editorData, setEditorData] = useState(konu); // Track editor data

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

  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    console.log("Editor data changed:", data);
    setEditorData(data); // Update editor data state
    handleSetSelectedKonu(data); // Save the updated content to the database
  };

  // This function will update the database when the content changes

  // Trigger the update when editor data changes
  useEffect(() => {
    if (editorData) {
      handleSetSelectedKonu(editorData);
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
    <Box
      sx={
        lgDown
          ? {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }
          : {}
      }
    >
      <Box sx={{ width: "100%", margin: "auto" }}>
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={editorData}
          onChange={handleChange} // Update content when changed
        />
      </Box>
    </Box>
  );
};

export default MaddiDogrulamaKonuEditor;
