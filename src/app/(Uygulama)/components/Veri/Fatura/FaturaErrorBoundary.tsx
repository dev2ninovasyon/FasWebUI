"use client";
import React from "react";
import { Box, Typography, Button, Card, CardContent, Stack } from "@mui/material";
import { IconAlertTriangle } from "@tabler/icons-react";

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class FaturaErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <Card variant="outlined" sx={{ borderColor: "error.main", m: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <IconAlertTriangle size={20} color="error" />
              <Typography variant="h6" color="error">Fatura Yönetim Hatası</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Fatura sayfasında bir hata oluştu. Lütfen sayfayı yenileyiniz.
            </Typography>
            <details>
              <summary style={{ cursor: "pointer", fontFamily: "monospace", fontWeight: "bold", fontSize: 12 }}>Hata Detayı</summary>
              <pre style={{ marginTop: 8, overflow: "auto", maxHeight: 128, color: "red", fontSize: 11 }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Sayfayı Yenile
            </Button>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}


