"use client";
import React from "react";
import { Box, Tooltip, useTheme } from "@mui/material";
import { Smile, SmilePlus, Meh, Frown, FrownOpen } from "lucide-react";
import type { FeedbackSentiment, ColorVariant } from "@/api/Feedback/feedback.types";
import { SENTIMENT_OPTIONS } from "@/api/Feedback/feedback.types";
import AppIcon from "./AppIcon";
import { LucideIcon } from "lucide-react";

const SENTIMENT_ICONS: Record<FeedbackSentiment, LucideIcon> = {
  5: SmilePlus,
  4: Smile,
  3: Meh,
  2: Frown,
  1: FrownOpen,
};

interface FeedbackSentimentSelectorProps {
  value: FeedbackSentiment | null;
  onChange: (value: FeedbackSentiment) => void;
  disabled?: boolean;
}

const FeedbackSentimentSelector: React.FC<FeedbackSentimentSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const theme = useTheme();

  const colorMap: Record<ColorVariant, string> = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    neutral: theme.palette.text.secondary,
  };

  const bgMap: Record<ColorVariant, string> = {
    primary: theme.palette.primary.light,
    secondary: theme.palette.secondary.light,
    success: `${theme.palette.success.main}18`,
    warning: `${theme.palette.warning.main}18`,
    error: `${theme.palette.error.main}18`,
    info: `${theme.palette.info.main}18`,
    neutral: theme.palette.action.hover,
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
      {SENTIMENT_OPTIONS.map((opt) => {
        const Icon = SENTIMENT_ICONS[opt.value];
        const isSelected = value === opt.value;
        const color = colorMap[opt.colorVariant];
        const bg = bgMap[opt.colorVariant];

        return (
          <Tooltip key={opt.value} title={opt.label} arrow>
            <Box
              component="button"
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 1,
                borderRadius: 2,
                border: `2px solid`,
                borderColor: isSelected ? color : "transparent",
                backgroundColor: isSelected ? bg : "transparent",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.18s ease",
                "&:hover": !disabled
                  ? { borderColor: color, backgroundColor: bg, transform: "translateY(-2px)" }
                  : undefined,
                outline: "none",
              }}
            >
              <AppIcon
                icon={Icon}
                colorVariant={opt.colorVariant}
                size={28}
                active={isSelected}
                duotone={isSelected}
                strokeWidth={isSelected ? 2.2 : 1.6}
              />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default FeedbackSentimentSelector;
