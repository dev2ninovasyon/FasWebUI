"use client";
import React from "react";
import { Box, useTheme } from "@mui/material";
import { LucideIcon } from "lucide-react";
import type { ColorVariant } from "@/api/Feedback/feedback.types";

interface AppIconProps {
  icon: LucideIcon;
  colorVariant?: ColorVariant;
  size?: "small" | "medium" | "large" | number;
  active?: boolean;
  disabled?: boolean;
  duotone?: boolean;
  strokeWidth?: number;
}

const SIZE_MAP: Record<"small" | "medium" | "large", number> = {
  small: 16,
  medium: 20,
  large: 24,
};

const AppIcon: React.FC<AppIconProps> = ({
  icon: Icon,
  colorVariant = "neutral",
  size = "medium",
  active = false,
  disabled = false,
  duotone = false,
  strokeWidth = 1.8,
}) => {
  const theme = useTheme();

  const resolvedSize =
    typeof size === "number" ? size : SIZE_MAP[size];

  const colorMap: Record<ColorVariant, string> = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    neutral: theme.palette.text.secondary,
  };

  const lightColorMap: Record<ColorVariant, string> = {
    primary: theme.palette.primary.light,
    secondary: theme.palette.secondary.light,
    success: theme.palette.success.light,
    warning: theme.palette.warning.light,
    error: theme.palette.error.light,
    info: theme.palette.info.light,
    neutral: theme.palette.action.hover,
  };

  const mainColor = colorMap[colorVariant];
  const lightColor = lightColorMap[colorVariant];

  if (duotone) {
    return (
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          width: resolvedSize,
          height: resolvedSize,
          opacity: disabled ? 0.38 : 1,
          transform: active ? "scale(1.15)" : "scale(1)",
          transition: "transform 0.15s ease, opacity 0.15s ease",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            color: lightColor,
            opacity: 0.6,
          }}
        >
          <Icon size={resolvedSize} strokeWidth={strokeWidth} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            color: mainColor,
          }}
        >
          <Icon size={resolvedSize} strokeWidth={strokeWidth} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        color: active ? colorMap[colorVariant] : mainColor,
        opacity: disabled ? 0.38 : 1,
        transform: active ? "scale(1.15)" : "scale(1)",
        transition: "transform 0.15s ease, color 0.15s ease, opacity 0.15s ease",
        "&:hover": !disabled
          ? {
              color: active ? mainColor : theme.palette.mode === "dark"
                ? `color-mix(in srgb, ${mainColor} 85%, white)`
                : `color-mix(in srgb, ${mainColor} 85%, black)`,
            }
          : undefined,
      }}
    >
      <Icon size={resolvedSize} strokeWidth={strokeWidth} />
    </Box>
  );
};

export default AppIcon;
