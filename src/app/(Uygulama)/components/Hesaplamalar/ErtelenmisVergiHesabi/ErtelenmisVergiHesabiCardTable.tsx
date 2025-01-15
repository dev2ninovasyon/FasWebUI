import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Grid,
  Typography,
} from "@mui/material";

interface CardTableProps {
  geciciNetToplam: number;
  ertelenenNetToplam: number;
  geciciPozitif: number;
  ertelenenPozitif: number;
  geciciNegatif: number;
  ertelenenNegatif: number;
}

const ErtelenmisVergiHesabiCardTable: React.FC<CardTableProps> = ({
  geciciNetToplam,
  ertelenenNetToplam,
  geciciPozitif,
  ertelenenPozitif,
  geciciNegatif,
  ertelenenNegatif,
}) => {
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
              <TableBody>
                <TableRow>
                  <TableCell align="left" sx={{ border: "none", width: "35%" }}>
                    <Typography variant="body1">Net</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ border: "none", width: "32.5%" }}
                  >
                    <Typography variant="body1">
                      {formatNumber(geciciNetToplam)}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ border: "none", width: "32.5%" }}
                  >
                    <Typography variant="body1">
                      {formatNumber(ertelenenNetToplam)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left" sx={{ border: "none", width: "35%" }}>
                    <Typography variant="body1">Net Vergi Varlığı</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ border: "none", width: "32.5%" }}
                  >
                    <Typography variant="body1">
                      {formatNumber(geciciPozitif)}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ border: "none", width: "32.5%" }}
                  >
                    <Typography variant="body1">
                      {formatNumber(ertelenenPozitif)}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left" sx={{ border: "none", width: "35%" }}>
                    <Typography variant="body1">
                      Net Vergi Yükükmlülüğü
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ border: "none", width: "32.5%" }}
                  >
                    <Typography variant="body1">
                      {formatNumber(geciciNegatif)}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ border: "none", width: "32.5%" }}
                  >
                    <Typography variant="body1">
                      {formatNumber(ertelenenNegatif)}
                    </Typography>
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

export default ErtelenmisVergiHesabiCardTable;
