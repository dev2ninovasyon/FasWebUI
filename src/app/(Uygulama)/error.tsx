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
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 720, mx: 'auto' }}>
      <Alert
        severity="error"
        icon={<IconAlertTriangle size={20} />}
        sx={{ mb: 2, alignItems: 'flex-start' }}
        action={
          <Button
            color="error"
            size="small"
            variant="outlined"
            startIcon={<IconRefresh size={14} />}
            onClick={reset}
            sx={{ mt: 0.25, whiteSpace: 'nowrap' }}
          >
            Tekrar Dene
          </Button>
        }
      >
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Sayfa yüklenirken bir hata oluştu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message
            ? error.message.length > 300
              ? error.message.slice(0, 300) + '…'
              : error.message
            : 'Beklenmeyen bir hata oluştu.'}
        </Typography>

        {error.digest && (
          <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
            Hata kodu: {error.digest}
          </Typography>
        )}
      </Alert>

      {/* Teknik detay */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ cursor: 'pointer', userSelect: 'none', width: 'fit-content' }}
        onClick={() => setDetailOpen((p) => !p)}
      >
        <Typography variant="caption" color="text.secondary">
          Teknik Detay
        </Typography>
        <IconButton size="small" tabIndex={-1}>
          {detailOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </IconButton>
        <Tooltip title={copied ? 'Kopyalandı!' : 'Panoya Kopyala'} placement="top">
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
            mt: 1,
            p: 1.5,
            bgcolor: 'grey.100',
            borderRadius: 1,
            fontSize: '0.7rem',
            lineHeight: 1.6,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            color: 'text.secondary',
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {errorDetails || '(hata detayı yok)'}
        </Box>
      </Collapse>
    </Box>
  );
}
