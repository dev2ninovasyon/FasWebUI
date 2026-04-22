'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconRefresh,
} from '@tabler/icons-react';

export default function UygulamaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    console.error('[UygulamaErrorBoundary]', error);
  }, [error]);

  const errorDetails = [
    error.message && `Hata: ${error.message}`,
    error.digest && `Özet: ${error.digest}`,
    error.stack && `\n${error.stack}`,
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(errorDetails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: { xs: 2, md: 4 },
        maxWidth: 720,
        mx: 'auto',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: '50%',
          bgcolor: 'error.light',
          color: 'error.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
        }}
      >
        <IconAlertTriangle size={32} />
      </Box>

      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
        Bir Şeyler Ters Gitti
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
        {isDev
          ? error.message || 'Beklenmeyen bir hata oluştu.'
          : 'İşleminiz gerçekleştirilirken teknik bir aksaklık oluştu. Lütfen sayfayı yenilemeyi deneyin veya sorun devam ederse destek ekibimize başvurun.'}
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: isDev ? 4 : 0 }}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          startIcon={<IconRefresh size={18} />}
          onClick={reset}
          sx={{ borderRadius: 2, px: 4, py: 1 }}
        >
          Tekrar Dene
        </Button>
      </Stack>

      {/* Teknik detay sadece local/dev ortamında gösterilir */}
      {isDev && (
        <Box sx={{ width: '100%', textAlign: 'left', mt: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ cursor: 'pointer', userSelect: 'none', width: 'fit-content', mb: 1 }}
            onClick={() => setDetailOpen((p) => !p)}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              TEKNİK DETAY (SADECE LOCAL)
            </Typography>
            <IconButton size="small">
              {detailOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            </IconButton>
            <Tooltip title={copied ? 'Kopyalandı!' : 'Hata Detayını Kopyala'} placement="top">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
              >
                <IconCopy size={14} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Collapse in={detailOpen}>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'grey.900',
                color: 'success.light',
                borderRadius: 2,
                fontSize: '0.75rem',
                lineHeight: 1.6,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 400,
                overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'grey.800',
              }}
            >
              {errorDetails || '(hata detayı yok)'}
            </Box>
          </Collapse>
        </Box>
      )}

      {!isDev && error.digest && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 2 }}>
          Hata Kodu: {error.digest}
        </Typography>
      )}
    </Box>
  );
}
