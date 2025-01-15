import React from "react";
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Grid container>
      <Grid item xs={12} lg={12} sx={{ mb: { xs: 2, lg: 0 } }}>
        <Paper
          elevation={2}
          sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: "primary.light",
          }}
        >
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
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
                    <Typography variant="h6">Aktif</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  >
                    <Typography variant="h6">Pasif</Typography>
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
                      bgcolor={
                        formatNumber(aktifPasifFark) == "0,00"
                          ? "success.light"
                          : "error.light"
                      }
                      sx={{
                        p: 2,
                        border: "none",
                        borderRadius: 0,
                      }}
                    >
                      {formatNumber(aktifPasifFark) == "0,00" ? (
                        <Typography variant="body2" align="left">
                          Aktif Pasif Farkı (Aktif Toplamı Pasif Toplamına Eşit)
                        </Typography>
                      ) : (
                        <Typography variant="body2" align="left">
                          Aktif Pasif Farkı (Aktif Toplamı Pasif Toplamına Eşit
                          Değil)
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      border: "none",
                      bgcolor:
                        formatNumber(aktifPasifFark) == "0,00"
                          ? "success.light"
                          : "error.light",
                    }}
                  >
                    {formatNumber(aktifPasifFark)}
                  </TableCell>
                </TableRow>
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
                <TableRow>
                  <TableCell align="left" sx={{ border: "none" }}>
                    Aktif Pasif Farkı - 6 Grubu Farkı
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}></TableCell>
                  <TableCell align="right" sx={{ border: "none" }}></TableCell>
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
