"use client";

import React from "react";
import {
  Box,
  Typography,
  Divider,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

interface LogFormatterProps {
  logs: any;
}

const LogFormatter: React.FC<LogFormatterProps> = ({ logs }) => {
  if (!logs) return <Typography color="text.secondary">Log bulunamadı.</Typography>;

  let logData: any = logs;
  if (typeof logs === "string") {
    try {
      // JSON içindeki JSON olma ihtimaline karşı bir kontrol
      const parsed = JSON.parse(logs);
      logData = parsed;
    } catch (e) {
      // JSON değilse ham string olarak devam et
    }
  }

  const renderMessageLines = (message: string) => {
    if (!message) return null;

    const lines = message.split(/\r?\n/);

    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <Box key={index} sx={{ height: 8 }} />;

      // Ayırıcı çizgileri Divider'a dönüştür
      if (trimmedLine.match(/^-+$/)) {
        return <Divider key={index} sx={{ my: 2 }} />;
      }

      // Detay satırlarını (pipe ile ayrılmış) tablo/liste formatına dönüştür
      if (trimmedLine.includes("|")) {
        const parts = trimmedLine.split("|");
        const titleMatch = parts[0].match(/^(.*?):(.*)$/);
        
        let header = "";
        let firstValue = "";
        
        if (titleMatch) {
            header = titleMatch[1].trim();
            firstValue = titleMatch[2].trim();
        }

        const data: { label: string; value: string }[] = [];
        if (header) {
            data.push({ label: header, value: firstValue });
        }

        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim();
          if (!part) continue;
          
          if (part.includes("=")) {
            const [label, value] = part.split("=");
            data.push({ label: label.trim(), value: value ? value.trim() : "" });
          } else if (part.includes(":")) {
            const [label, value] = part.split(":");
            data.push({ label: label.trim(), value: value ? value.trim() : "" });
          } else {
            data.push({ label: "", value: part });
          }
        }

        return (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 1.5,
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 1.5,
              }}
            >
              {data.map((item, i) => (
                <Box key={i} sx={{ overflow: "hidden" }}>
                  {item.label && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", fontWeight: 600, mb: 0.2 }}
                    >
                      {item.label}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        );
      }

      // [Uyarı], [Hata] gibi ifadeleri belirginleştir
      if (trimmedLine.startsWith("[") && trimmedLine.includes("]")) {
        const tagEndIndex = trimmedLine.indexOf("]");
        const tag = trimmedLine.substring(1, tagEndIndex);
        const rest = trimmedLine.substring(tagEndIndex + 1).trim();

        let color: "warning" | "error" | "info" | "success" = "info";
        if (tag.toLocaleLowerCase("tr-TR").includes("uyarı")) color = "warning";
        if (tag.toLocaleLowerCase("tr-TR").includes("hata")) color = "error";
        if (tag.toLocaleLowerCase("tr-TR").includes("başarı")) color = "success";

        return (
          <Box key={index} sx={{ mb: 1, mt: index > 0 ? 2 : 0 }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Chip
                label={tag}
                size="small"
                color={color}
                variant="filled"
                sx={{ fontWeight: "bold", mt: 0.3 }}
              />
              <Typography variant="body1" fontWeight={500}>
                {rest}
              </Typography>
            </Stack>
          </Box>
        );
      }

      return (
        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
          {trimmedLine}
        </Typography>
      );
    });
  };

  const renderContent = () => {
    // Eğer logData success/message objesi ise
    if (logData && typeof logData === "object" && "message" in logData) {
      return (
        <Box>
          {renderMessageLines(logData.message)}
          {logData.success === false && !logData.message && (
            <Typography color="error">Hata: İşlem başarısız oldu.</Typography>
          )}
        </Box>
      );
    }

    // Defter logları genelde bu formatta geliyor: [Sunucu İşlem Logları]\n{...}
    if (typeof logs === "string") {
        if (logs.startsWith("[Sunucu İşlem Logları]")) {
            const jsonPart = logs.replace("[Sunucu İşlem Logları]", "").trim();
            try {
                const parsed = JSON.parse(jsonPart);
                return renderContentHelper(parsed);
            } catch (e) {
                return renderMessageLines(logs);
            }
        }
        return renderMessageLines(logs);
    }

    return renderContentHelper(logData);
  };

  const renderContentHelper = (data: any) => {
    if (data && typeof data === "object" && "message" in data) {
         return renderMessageLines(data.message);
    }
    return <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>;
  }

  return (
    <Box sx={{ py: 1 }}>
      {renderContent()}
    </Box>
  );
};

export default LogFormatter;
