'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
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
  IconHome,
} from '@tabler/icons-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error('[ErrorBoundary]', error);
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
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
      sx={{ bgcolor: 'background.default' }}
    >
      <Paper
        variant="outlined"
        sx={{ maxWidth: 560, width: '100%', p: 4, borderRadius: 2 }}
      >
        {/* İkon + Başlık */}
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <IconAlertTriangle size={28} color="#e53e3e" />
          <Typography variant="h5" fontWeight={700} color="error.main">
            Bir hata oluştu
          </Typography>
        </Stack>

        {/* Kısa açıklama */}
        <Typography variant="body2" color="text.secondary" mb={3}>
          {error.message
            ? error.message.length > 200
              ? error.message.slice(0, 200) + '…'
              : error.message
            : 'Beklenmeyen bir hata oluştu. Sayfayı yenileyerek tekrar deneyin.'}
        </Typography>

        {/* Digest (varsa) */}
        {error.digest && (
          <Typography variant="caption" color="text.disabled" display="block" mb={2}>
            Hata kodu: {error.digest}
          </Typography>
        )}

        {/* Butonlar */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconRefresh size={16} />}
            onClick={reset}
            disableElevation
          >
            Tekrar Dene
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<IconHome size={16} />}
            component={Link}
            href="/Anasayfa"
          >
            Anasayfaya Dön
          </Button>
        </Stack>

        {/* Detay toggle */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setDetailOpen((p) => !p)}
        >
          <Typography variant="caption" color="text.secondary">
            Teknik Detay
          </Typography>
          <IconButton size="small" tabIndex={-1}>
            {detailOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </IconButton>
          <Tooltip title={copied ? 'Kopyalandı!' : 'Kopyala'} placement="top">
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
              maxHeight: 260,
              overflowY: 'auto',
            }}
          >
            {errorDetails || '(hata detayı yok)'}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}
