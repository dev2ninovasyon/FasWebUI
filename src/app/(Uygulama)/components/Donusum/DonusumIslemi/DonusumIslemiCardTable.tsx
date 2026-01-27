import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from "@mui/material";

interface CardTableProps {
  aktifBorcTutari: number;
  aktifAlacakTutari: number;
  pasifBorcTutari: number;
  pasifAlacakTutari: number;
  altiliBorcTutari: number;
  altiliAlacakTutari: number;
}

const DonusumIslemiCardTable: React.FC<CardTableProps> = ({
  aktifBorcTutari,
  aktifAlacakTutari,
  pasifBorcTutari,
  pasifAlacakTutari,
  altiliBorcTutari,
  altiliAlacakTutari,
}) => {
  const aktifFark = Math.abs(aktifBorcTutari - aktifAlacakTutari);
  const pasifFark = Math.abs(pasifBorcTutari - pasifAlacakTutari);
  const altiliFark = Math.abs(altiliBorcTutari - altiliAlacakTutari);
  const aktifPasifFark = Math.abs(aktifFark - pasifFark);
  const aktifPasifFarkAltiliFark = Math.abs(aktifPasifFark - altiliFark);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  // ğŸ”¹ Sayısal toleransla kontrol et (0,00â€™a yuvarlanacak kadar küçük mü?)
  const isAktifPasifBalanced = useMemo(
    () => Math.abs(aktifPasifFark) < 0.005,
    [aktifPasifFark]
  );

  const aktifPasifBgColor = isAktifPasifBalanced ? "success.light" : "error.light";
  const aktifPasifText = isAktifPasifBalanced
    ? "Aktif Pasif Farkı (Aktif Toplamı Pasif Toplamına Eşit)"
    : "Aktif Pasif Farkı (Aktif Toplamı Pasif Toplamına Eşit Değil)";

  return (
    <Grid container>
      <Grid
        sx={{ mb: { xs: 2, lg: 0 } }}
        size={{
          xs: 12,
          lg: 12
        }}>
        <Paper
          elevation={2}
          sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: "primary.light",
          }}
        >
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  >
                    <Typography variant="h6">Grup</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  >
                    <Typography variant="h6">Borç</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  >
                    <Typography variant="h6">Alacak</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  >
                    <Typography variant="h6">Fark</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* 1-2 Grubu */}
                <TableRow>
                  <TableCell align="left" sx={{ border: "none" }}>
                    1-2 Grubu (Aktif)
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(aktifBorcTutari)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(aktifAlacakTutari)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(aktifFark)}
                  </TableCell>
                </TableRow>

                {/* 3-4-5 Grubu */}
                <TableRow>
                  <TableCell align="left" sx={{ border: "none" }}>
                    3-4-5 Grubu (Pasif)
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(pasifBorcTutari)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(pasifAlacakTutari)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(pasifFark)}
                  </TableCell>
                </TableRow>

                {/* Aktif-Pasif Farkı Bilgi Satırı */}
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="left"
                    sx={{
                      p: 0,
                      border: "none",
                    }}
                  >
                    <Box
                      bgcolor={aktifPasifBgColor}
                      sx={{
                        p: 2,
                        border: "none",
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant="body2" align="left">
                        {aktifPasifText}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      border: "none",
                      bgcolor: aktifPasifBgColor,
                    }}
                  >
                    {formatNumber(aktifPasifFark)}
                  </TableCell>
                </TableRow>

                {/* 6 Grubu */}
                <TableRow>
                  <TableCell align="left" sx={{ border: "none" }}>
                    6 Grubu
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(altiliBorcTutari)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(altiliAlacakTutari)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(altiliFark)}
                  </TableCell>
                </TableRow>

                {/* Aktif Pasif - 6 Grubu Farkı */}
                <TableRow>
                  <TableCell align="left" sx={{ border: "none" }}>
                    Aktif Pasif Farkı - 6 Grubu Farkı
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }} />
                  <TableCell align="right" sx={{ border: "none" }} />
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(aktifPasifFarkAltiliFark)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DonusumIslemiCardTable;
