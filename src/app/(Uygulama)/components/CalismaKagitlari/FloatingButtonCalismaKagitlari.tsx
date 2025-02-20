import React, { useState } from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface FloatingButtonProps {
  warn?: boolean;
  handleClick: () => void;
}

export const FloatingButtonCalismaKagitlari: React.FC<FloatingButtonProps> = ({
  warn,
  handleClick,
}) => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 8,
        right: 24,
        zIndex: 1000,
        cursor: "pointer",
        pointerEvents: warn ? "visible" : "all",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={warn ? () => {} : () => handleClick()}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "float 2s linear infinite",
          "@keyframes float": {
            "0%": { transform: "rotateY(90deg)" },
            "50%": { transform: "translateY(-2px)" },
            "100%": { transform: "rotateY(90deg)" },
          },
        }}
      >
        <Typography
          align="center"
          variant="h6"
          color={theme.palette.common.black}
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
          mr: 3,
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
          }}
        ></iframe>
      </Box>
      <Paper
        elevation={4}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isHovered ? "space-between" : "center",
          flexDirection: "row",
          width: isHovered ? (warn ? 348 : 320) : 56,
          height: 72,
          borderTopRightRadius: "28px",
          borderTopLeftRadius: isHovered ? "0px" : "28px",
          borderBottomRightRadius: "28px",
          borderBottomLeftRadius: isHovered ? "0px" : "28px",
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
          padding: isHovered ? "0 16px" : "0",
          ml: isHovered ? 5 : 1,
          zIndex: 1000,
        }}
      >
        {isHovered &&
          (warn ? (
            <Typography variant="body1" fontWeight="bold" ml={3} noWrap>
              Cevapları sizin için daha önce oluşturdum
            </Typography>
          ) : (
            <Typography variant="body1" fontWeight="bold" ml={3} noWrap>
              Sizin için cevaplamamı ister misiniz?
            </Typography>
          ))}
      </Paper>
    </Box>
  );
};
