import React, { useEffect, useState } from "react";
import { Box, Divider, Paper, Typography, useTheme } from "@mui/material";
import { enhanceText } from "@/utils/gemini";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface FloatingButtonProps {
  control?: boolean;
  text?: string; // <- web adresi buraya geliyor
  isHovered?: boolean;
  setIsHovered: (b: boolean) => void;
  handleClick: () => void;
}

const predefinedPrompts = [
  {
    label: "Şirket Bilgilerini Getir",
    instruction:
      "Verilen web sayfasını analiz et ve yalnızca şirket bilgilerini madde madde listele. " +
      "Sadece listeyi döndür; açıklama ekleme. Aşağıdaki alanları sırayla ve varsa doldur: " +
      "Firma Adı; Web; Telefon; E-posta; Adres; Vergi Dairesi; Vergi No; Ticaret Sicil No. " +
      "KAYNAK: Kullanıcının verdiği URL. Eğer bilgi yoksa alanı atla.",
  },
];

const messages = {
  welcome: "Firma bilgilerini doldurmanıza yardımcı olabilirim",
  empty: "Web adresi girin, sonra size yardımcı olabilirim",
  working: "Bilgiler üzerinde çalışıyorum...",
  done: "İşte Firma bilgileri!",
};

export const FloatingButtonMusteriIslemleri: React.FC<FloatingButtonProps> = ({
  control,
  text,
  isHovered,
  setIsHovered,
  handleClick,
}) => {
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);

  const [message, setMessage] = useState(messages.welcome);
  const [loaded, setLoaded] = useState(false);
  const [aiText, setAiText] = useState("");

  const [control2, setControl2] = useState(false);

  const handlePromptClick = async (instruction: string) => {
    if (!text || !isValidUrl(text)) {
      setControl2(false);
      setMessage(messages.empty);
      setAiText("");
      return;
    }

    try {
      setControl2(true);
      setMessage(messages.working);
      setAiText("");

      const enhanced = await enhanceText(normalizeUrl(text), instruction);
      const safeOut = (enhanced || "").trim();

      if (!safeOut) {
        setControl2(false);
        setMessage(messages.empty);
        setAiText("");
      } else {
        setMessage(messages.done);
        setAiText(safeOut);
      }
    } catch (error) {
      console.error("Gemini fetch error:", error);
      setControl2(false);
      setMessage(messages.empty);
      setAiText("");
    }
  };

  const normalizeUrl = (val?: string) => {
    if (!val) return "";
    return val.startsWith("http://") || val.startsWith("https://")
      ? val
      : `https://${val}`;
  };

  const isValidUrl = (val?: string) => {
    if (!val) return false;
    try {
      const u = new URL(normalizeUrl(val));
      return !!u.hostname && u.hostname.includes(".");
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!control2) {
      setAiText("");
      setMessage((text?.length || 0) > 3 ? messages.welcome : messages.empty);
    }
  }, [control2, text]);

  useEffect(() => {
    if ((text?.length || 0) < 3) {
      setControl2(false);
      setAiText("");
      setMessage((text?.length || 0) > 3 ? messages.welcome : messages.empty);
    }
    if (!control2) {
      setMessage((text?.length || 0) > 3 ? messages.welcome : messages.empty);
    }
  }, [text, control2]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 12,
        right: 24,
        zIndex: 1000,
        cursor: "pointer",
        pointerEvents: control ? "visible" : "all",
        opacity: loaded ? 1 : 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={control ? () => {} : () => handleClick()}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "float 2s linear infinite",
          "@keyframes float": {
            "50%": { transform: "translateY(-2px)" },
          },
          width: 72,
        }}
      >
        <Typography
          align="center"
          variant="h6"
          color={
            customizer.activeMode == "dark"
              ? theme.palette.common.white
              : theme.palette.common.black
          }
          marginBottom={0.5}
        >
          Fas AI
        </Typography>
      </Box>

      <Box
        sx={{
          position: "fixed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          backgroundColor: "white",
          borderRadius: "100%",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://widget.galichat.com/chat/6691wb9cakfml2mjro2x19"
          scrolling="no"
          style={{
            pointerEvents: "none",
            border: "0px",
            width: 63,
            height: 63,
            transition: "all 0.3s ease-in-out",
          }}
          onLoad={() => {
            const timer = setTimeout(() => setLoaded(true), 1000);
            return () => clearTimeout(timer);
          }}
        ></iframe>
      </Box>

      <Paper
        elevation={4}
        sx={{
          display: "flex",
          alignItems: "start",
          justifyContent: isHovered ? "start" : "center",
          flexDirection: "column",
          width: isHovered ? 412 : 56,
          height: isHovered
            ? control && control2 && (text?.length || 0) > 3
              ? 424
              : 72
            : 72,
          borderRadius: "28px",
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
          padding: isHovered ? "0 16px" : "0",
          ml: isHovered ? 0 : 1,
          zIndex: 1000,
        }}
      >
        {isHovered && (
          <>
            <Typography
              variant="body1"
              fontWeight="bold"
              noWrap
              height={26}
              marginY={3}
              marginLeft={7.2}
              onClick={() =>
                handlePromptClick(predefinedPrompts[0].instruction)
              }
            >
              {control || (text?.length || 0) > 3
                ? message
                : "Firma bilgilerini doldurmanıza yardımcı olabilirim"}
            </Typography>

            {control && control2 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                  marginTop: 1,
                  marginBottom: 2,
                  width: "100%",
                }}
              >
                <Divider sx={{ width: "100%" }} />
                <CustomTextField
                  id="AiText"
                  multiline
                  rows={13}
                  variant="outlined"
                  fullWidth
                  value={aiText}
                  onChange={(e: any) => setAiText(e.target.value)}
                />
              </Box>
            ) : (
              <></>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};
