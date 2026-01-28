import { Box, useMediaQuery } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import LexicalEditor from "../../Editor/LexicalEditor";

interface Veri {
  id: number;
  text: string;
  dipnotKodu: number;
  baslikmi: boolean;
}

interface RaporDipnotEditorProps {
  id: number;
  text?: string;
  dipnotKoduVeriler: Veri[];
  setDipnotKoduVeriler: (x: Veri[]) => void;
}

const RaporDipnotEditor: React.FC<RaporDipnotEditorProps> = ({
  id,
  text,
  dipnotKoduVeriler,
  setDipnotKoduVeriler,
}) => {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const [editorData, setEditorData] = useState(text);

  const handleChange = useCallback((html: string) => {
    setEditorData(html);
  }, []);

  useEffect(() => {
    if (editorData !== undefined) {
      setDipnotKoduVeriler(
        dipnotKoduVeriler.map((veri) =>
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

export default RaporDipnotEditor;
