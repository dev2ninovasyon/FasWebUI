import { Box, useMediaQuery } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import LexicalEditor from "../../Editor/LexicalEditor";

interface Veri {
  id: number;
  baslik: string;
  text: string;
}

interface RaporGorusEditorProps {
  id: number;
  text?: string;
  gorusVeriler: Veri[];
  setGorusVeriler: (x: Veri[]) => void;
}

const RaporGorusEditor: React.FC<RaporGorusEditorProps> = ({
  id,
  text,
  gorusVeriler,
  setGorusVeriler,
}) => {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const [editorData, setEditorData] = useState(text);

  const handleChange = useCallback((html: string) => {
    setEditorData(html);
  }, []);

  useEffect(() => {
    if (editorData !== undefined) {
      setGorusVeriler(
        gorusVeriler.map((veri) =>
          veri.id == id ? { ...veri, text: editorData } : veri
        )
      );
    }
  }, [editorData]);

  useEffect(() => {
    if (text !== undefined) {
      setEditorData(text);
    }
  }, [text]);

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
        <LexicalEditor
          initialValue={editorData}
          onChange={handleChange}
          mode={customizer.activeMode === "dark" ? "dark" : "light"}
          placeholder="İçeriğinizi buraya yazın veya yapıştırın!"
        />
      </Box>
    </Box>
  );
};

export default RaporGorusEditor;
