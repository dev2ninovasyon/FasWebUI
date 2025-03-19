import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";
import { getGorevAtamalariByKullaniciId } from "@/api/Sozlesme/DenetimKadrosuAtama";

interface Props {
  personelId: number;
}

const KullaniciSozlesmeSaatleriTable: React.FC<Props> = ({ personelId }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [rows, setRows] = useState([]);

  const fetchData = async () => {
    try {
      const kullaniciSozlesmeSaatleriVerileri =
        await getGorevAtamalariByKullaniciId(
          user.token || "",
          personelId || user.id || 0
        );

      const newRows = kullaniciSozlesmeSaatleriVerileri.map(
        (kullaniciSozlesmeSaatleri: any) => ({
          firmaAdi: kullaniciSozlesmeSaatleri.firmaAdi,
          unvanAdi: kullaniciSozlesmeSaatleri.unvanAdi,
          asilYedek: kullaniciSozlesmeSaatleri.asilYedek,
          yil: kullaniciSozlesmeSaatleri.yil,
          calismaSaati: kullaniciSozlesmeSaatleri.calismaSaati,
        })
      );
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [personelId]);

  return (
    <BlankCard>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6">Firma Adı</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Ünvan
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Asil / Yedek
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Yıl
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Sözleşme Saati
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: any, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="h6">{row.firmaAdi}</Typography>
                </TableCell>
                <TableCell scope="row">
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.unvanAdi}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.asilYedek}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.yil}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.calismaSaati}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </BlankCard>
  );
};

export default KullaniciSozlesmeSaatleriTable;
