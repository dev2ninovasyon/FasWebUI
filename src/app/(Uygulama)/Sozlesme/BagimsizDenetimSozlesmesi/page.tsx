"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import dynamic from "next/dynamic";
import BagimsizDenetimSozlesmesiLayout from "./BagimsizDenetimSozlesmesiLayout";
import {
  Fab,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { useEffect, useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getCalismaKagidiVerileriByDenetciDenetlenenYil } from "@/api/CalismaKagitlari/CalismaKagitlari";
import { IconExclamationMark } from "@tabler/icons-react";
import { getGorevAtamalariByDenetlenenIdYil } from "@/api/Sozlesme/DenetimKadrosuAtama";

const CustomEditorWVeri = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditorWVeri"),
  { ssr: false }
);

interface Veri {
  id: number;
  metin: string;
}

const controller = "DenetimSozlesmesi";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [sozlesmeTarihi, setSozlesmeTarihi] = useState<string>("");

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [rows, setRows] = useState([]);

  const fetchData = async () => {
    try {
      const sozlesmeVerileri =
        await getCalismaKagidiVerileriByDenetciDenetlenenYil(
          controller,
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );

      if (sozlesmeVerileri?.length > 0) {
        setSozlesmeTarihi(
          sozlesmeVerileri[0].sozlesmeTarihi?.split("T")[0] || ""
        );

        const newVeri = sozlesmeVerileri.map((veri: any) => ({
          id: veri.id,
          metin: veri.metin,
        }));
        setVeriler(newVeri);
      } else {
        console.warn("No data found");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData2 = async () => {
    try {
      const denetimKadrosuVerileri = await getGorevAtamalariByDenetlenenIdYil(
        user.token || "",
        user.denetlenenId || 0,
        user.yil || 0
      );
      const newRows = denetimKadrosuVerileri.map((veri: any) => ({
        kullaniciAdi: veri.kullaniciAdi,
        unvanAdi: veri.unvanAdi,
        asilYedek: veri.asilYedek,
        calismaSaati: veri.calismaSaati,
        saatBasiUcreti: veri.saatBasiUcreti,
        denetimUcreti: veri.denetimUcreti,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchData2();
  }, []);

  return (
    <BagimsizDenetimSozlesmesiLayout>
      <PageContainer
        title="Bağımsız Denetim Sözleşmesi"
        description="this is Bağımsız Denetim Sözleşmesi"
      >
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={12}
            lg={12}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <CustomFormLabel
              htmlFor="sozlesmeTarihi"
              sx={{
                mt: 0,
                mb: { xs: "-10px", sm: 0 },
                mr: 2,
                whiteSpace: "nowrap",
              }}
            >
              <Typography variant="subtitle1">Sözleşme Tarihi:</Typography>
            </CustomFormLabel>
            <CustomTextField
              id="sozlesmeTarihi"
              type="date"
              value={sozlesmeTarihi}
              onChange={(e: any) => setSozlesmeTarihi(e.target.value)}
            />
            <Tooltip title="Sözleşme Tarihi Girmeyi Unutmayınız">
              <Fab color="warning" size="small" sx={{ marginLeft: 2 }}>
                <IconExclamationMark width={18.25} height={18.25} />
              </Fab>
            </Tooltip>
          </Grid>
          {sozlesmeTarihi.length > 0 && (
            <Grid item xs={12} sm={12} lg={12}>
              <CustomEditorWVeri
                controller={controller}
                veri={veriler[0]}
                sozlesmeTarihi={sozlesmeTarihi}
              />
            </Grid>
          )}
          {rows.filter((row: any) => row.asilYedek == "Asil").length > 0 && (
            <Grid item xs={12} sm={12} lg={12}>
              <Typography variant="h5" textAlign="center" mb={2}>
                Bağımsız Denetim Ekibi
              </Typography>
              <Paper
                elevation={2}
                sx={{
                  p: 1,
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: "primary.light",
                  width: "95%",
                  margin: "auto",
                }}
              >
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Adı Soyadı</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Ünvan</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Çalışma Saati</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Saat Başı Ücreti</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Denetim Ücreti</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows
                        .filter((row: any) => row.asilYedek == "Asil")
                        .map((row: any, index) => (
                          <TableRow key={index}>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.kullaniciAdi}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.unvanAdi}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.calismaSaati}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.saatBasiUcreti}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.denetimUcreti}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          )}
          {rows.filter((row: any) => row.asilYedek == "Yedek").length > 0 && (
            <Grid item xs={12} sm={12} lg={12}>
              <Typography variant="h5" textAlign="center" mb={2}>
                Yedek Bağımsız Denetçiler
              </Typography>
              <Paper
                elevation={2}
                sx={{
                  p: 1,
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: "primary.light",
                  width: "95%",
                  margin: "auto",
                }}
              >
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Adı Soyadı</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Ünvan</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Çalışma Saati</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Saat Başı Ücreti</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "15%",
                            backgroundColor: "primary.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Denetim Ücreti</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows
                        .filter((row: any) => row.asilYedek == "Yedek")
                        .map((row: any, index) => (
                          <TableRow key={index}>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.kullaniciAdi}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.unvanAdi}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.calismaSaati}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.saatBasiUcreti}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "none" }}>
                              {row.denetimUcreti}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          )}
          {sozlesmeTarihi.length > 0 && (
            <Grid item xs={12} sm={12} lg={12}>
              <CustomEditorWVeri
                controller={controller}
                veri={veriler[1]}
                sozlesmeTarihi={sozlesmeTarihi}
              />
            </Grid>
          )}
        </Grid>
      </PageContainer>
    </BagimsizDenetimSozlesmesiLayout>
  );
};

export default Page;
