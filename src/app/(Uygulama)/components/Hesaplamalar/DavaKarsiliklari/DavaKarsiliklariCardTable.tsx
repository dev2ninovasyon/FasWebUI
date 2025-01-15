import React from "react";
import {
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

interface Props {
  davaKarsiliklariVerileri: any;
}

const DavaKarsiliklariCardTable: React.FC<Props> = ({
  davaKarsiliklariVerileri,
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
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  ></TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  >
                    <Typography variant="h6">
                      Hesaplanan Toplam Ayrılacak Dava Karşılıkları
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  >
                    <Typography variant="h6">
                      Hesaplanan Toplam Koşullu Dava Borçları
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  >
                    <Typography variant="h6">
                      Hesaplanan Toplam Koşullu Dava Alacakları
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: "primary.light", borderBottom: 0 }}
                  >
                    <Typography variant="h6">
                      Uzman Görüşü Gerektirenler
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell align="left" sx={{ border: "none" }}>
                    <Typography variant="h6">Sayısı</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {
                      davaKarsiliklariVerileri.hesaplananToplamAyrilacakDavaKarsiliklariSayisi
                    }
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {
                      davaKarsiliklariVerileri.hesaplananToplamKosulluDavaBorclariSayisi
                    }
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {
                      davaKarsiliklariVerileri.hesaplananToplamKosulluDavaAlacaklariSayisi
                    }
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {davaKarsiliklariVerileri.uzmanGorusuGerektirenlerSayisi}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left" sx={{ border: "none" }}>
                    <Typography variant="h6">Tutarı</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(
                      davaKarsiliklariVerileri.hesaplananToplamAyrilacakDavaKarsiliklariTutari
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(
                      davaKarsiliklariVerileri.hesaplananToplamKosulluDavaBorclariTutari
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(
                      davaKarsiliklariVerileri.hesaplananToplamKosulluDavaAlacaklariTutari
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ border: "none" }}>
                    {formatNumber(
                      davaKarsiliklariVerileri.uzmanGorusuGerektirenlerTutari
                    )}
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

export default DavaKarsiliklariCardTable;
