import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { getYorum, saveYorum } from "@/api/Yorumlar/Yorumlar";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import LexicalEditor from "./LexicalEditor";

interface YorumEditorProps {
  denetlenenId: number;
  yil: number;
  belgeAdi: string;
  isReport?: boolean;
}

const YorumEditor: React.FC<YorumEditorProps> = ({ denetlenenId, yil, belgeAdi, isReport }) => {
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
      console.log("Bir hata oluştu:", error);
      setKayitMesaji("Hata oluştu!");
    }
  };

  const handleChange = useCallback((html: string) => {
    setEditorData(html);
  }, []);

  const fetchData = async () => {
    try {
      const result = await getYorum(user.token || "", denetlenenId, yil, belgeAdi);
      if (result && result.icerik) {
        setEditorData(result.icerik);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [denetlenenId, yil, belgeAdi]);

  useEffect(() => {
    if (isReport) return;
    const timeout = setTimeout(() => {
      if (editorData)
        handleUpdate(editorData);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [editorData, isReport]);

  return (
    <Grid
      container
      sx={{
        width: "95%",
        margin: "0 auto",
        justifyContent: "center",
      }}
    >
      <Grid
        size={{
          xs: 12,
          lg: 12
        }}>
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
            overflow: "visible",
            padding: 0,
          }}
        >
          {!isReport && (
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
          )}
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
                {isReport ? (
                  <Box
                    sx={{
                      width: "100%",
                      p: 2,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      backgroundColor: customizer.activeMode === "dark" ? "rgba(255,255,255,0.05)" : "#f9f9f9"
                    }}
                    dangerouslySetInnerHTML={{ __html: editorData || "Yorum bulunmamaktadır." }}
                  />
                ) : (
                  <LexicalEditor
                    initialValue={editorData}
                    onChange={handleChange}
                    mode={customizer.activeMode === "dark" ? "dark" : "light"}
                    placeholder="İçeriğinizi buraya yazın veya yapıştırın!"
                  />
                )}
              </Box>
              {!isReport && kayitMesaji && (
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

