"use client";

import React, { useEffect, useState } from "react";
import {
  Collapse,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getFinansalDurumTablosu,
  getNakitAkisTablosu,
} from "@/api/FinansalTablolar/FinansalToblolar";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NakitAkisCardTable from "./NakitAkisTablosuCardTable";

interface DonusumMizan {
  detayKodu: string;
  hesapAdi: string;
  vukBorc: number;
  vukAlacak: number;
  fisBorc: number;
  fisAlacak: number;
  raporBorc: number;
  raporAlacak: number;
  borcBakiye: number;
  alacakBakiye: number;
}

interface Veri {
  id: number;
  parentId?: number | null;
  kalemAdi: string;
  dipnot: string;
  formul: string;
  tutarYil1: number;
  tutarYil2: number;
  tutarYil3: number;
  hesaplar?: DonusumMizan[] | null;
}

const NakitAkisTablosu: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();
  const bgColor = theme.palette.background.default;

  const [title, setTitle] = useState("");

  const [natData, setNatData] = React.useState<Veri[]>([]);
  const [fdtData, setFdtData] = React.useState<Veri[]>([]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const [openRows, setOpenRows] = React.useState<{ [key: number]: boolean }>(
    {}
  );

  const toggleRow = (id: number) => {
    setOpenRows((prevOpenRows) => ({
      ...prevOpenRows,
      [id]: !prevOpenRows[id],
    }));
  };

  const fetchData = async () => {
    try {
      const nakitAkisTablosu = await getNakitAkisTablosu(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      setTitle(nakitAkisTablosu[0]?.kalemAdi);

      const newRowsNat = nakitAkisTablosu.slice(1).map((veri: Veri) => ({
        id: veri.id,
        parentId:
          veri.parentId !== undefined
            ? veri.parentId === nakitAkisTablosu[0]?.id
              ? null
              : veri.parentId
            : null,
        kalemAdi: veri.kalemAdi,
        dipnot: veri.dipnot,
        formul: veri.formul,
        tutarYil1: veri.tutarYil1,
        tutarYil2: veri.tutarYil2,
        tutarYil3: veri.tutarYil3,
        hesaplar: veri.hesaplar !== undefined ? veri.hesaplar : null,
      }));

      setNatData(newRowsNat);

      const finansalDurumTablosu = await getFinansalDurumTablosu(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      const newRowsFdt = finansalDurumTablosu.slice(1).map((veri: Veri) => ({
        id: veri.id,
        parentId:
          veri.parentId !== undefined
            ? veri.parentId === finansalDurumTablosu[0]?.id
              ? null
              : veri.parentId
            : null,
        kalemAdi: veri.kalemAdi,
        dipnot: veri.dipnot,
        formul: veri.formul,
        tutarYil1: veri.tutarYil1,
        tutarYil2: veri.tutarYil2,
        tutarYil3: veri.tutarYil3,
        hesaplar: veri.hesaplar !== undefined ? veri.hesaplar : null,
      }));

      setFdtData(newRowsFdt);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasChildren = (rows: Veri[], id: number) => {
    return rows.some((row) => row.parentId === id);
  };

  const hasGrandchildren = (rows: Veri[], id: number) => {
    return rows.some((row) => hasChildren(rows, row.id) && row.parentId === id);
  };

  const renderRows = (
    rows: Veri[],
    parentId: number | null,
    level: number = 0
  ) => {
    return rows
      .filter((row) => row.parentId === parentId)
      .map((row) => {
        let backgroundColor = "#cccccc"; // Default: gri
        let color = theme.palette.common.black; // Default: siyah
        let fontType = "body1";
        let control = false;
        // Define row color based on having children or grandchildren
        if (hasChildren(rows, row.id)) {
          if (hasGrandchildren(rows, row.id)) {
            backgroundColor = "#253662"; // Has grandchildren: mavi
            color = theme.palette.common.white; // Default: beyaz
            fontType = "h6";
          } else {
            backgroundColor = "#D35400"; // Has children but no grandchildren: turuncu
            color = theme.palette.common.white; // Default: beyaz
          }
        } else {
          control = true;
        }
        if (row.kalemAdi.startsWith("Toplam")) {
          backgroundColor = "#253662"; // Default: mavi
          color = theme.palette.common.white; // Default: beyaz
          fontType = "h6";
          control = false;
        }

        return (
          <React.Fragment key={row.id}>
            <TableRow
              onClick={() =>
                control &&
                user.rol?.includes("FinansalTabloKontrol") &&
                toggleRow(row.id)
              }
              sx={{
                cursor:
                  control && user.rol?.includes("FinansalTabloKontrol")
                    ? "pointer"
                    : "default",

                ...(openRows[row.id] && {
                  position: "sticky",
                  top: 50,
                  zIndex: 2,
                  backgroundColor: backgroundColor,
                }),
              }}
            >
              <TableCell
                style={{
                  paddingLeft: level * 32 + 10,
                  backgroundColor: backgroundColor,
                  color: color,
                  border: `1px solid ${bgColor}`,
                  borderRadius: 0,
                }}
              >
                <Typography
                  variant={fontType == "body1" ? "body1" : "h6"}
                  align="left"
                  display={"flex"}
                  alignItems={"center"}
                >
                  {control && user.rol?.includes("FinansalTabloKontrol") && (
                    <ExpandMoreIcon
                      sx={{
                        transform: openRows[row.id]
                          ? "rotate(360deg)"
                          : "rotate(270deg)",
                      }}
                    />
                  )}

                  {row.kalemAdi}
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  backgroundColor: backgroundColor,
                  color: color,
                  border: `1px solid ${bgColor}`,
                  borderRadius: 0,
                }}
              >
                <Typography variant={"body1"} align="left">
                  {row.dipnot}
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  backgroundColor: backgroundColor,
                  color: color,
                  border: `1px solid ${bgColor}`,
                  borderRadius: 0,
                }}
              >
                <Typography variant="body1" align="right">
                  {formatNumber(row.tutarYil1)}
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  backgroundColor: backgroundColor,
                  color: color,
                  border: `1px solid ${bgColor}`,
                  borderRadius: 0,
                }}
              >
                <Typography variant="body1" align="right">
                  {formatNumber(row.tutarYil2)}
                </Typography>
              </TableCell>
            </TableRow>
            {control && (
              <TableRow>
                <TableCell colSpan={4} sx={{ padding: 0, border: 0 }}>
                  <Collapse
                    in={openRows[row.id] || false}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Grid container>
                      <Grid item xs={12} lg={12} sx={{ mx: 3, my: 2 }}>
                        <Paper
                          elevation={2}
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: "#2E8B57",
                          }}
                        >
                          <Typography
                            variant="body1"
                            align="left"
                            color={theme.palette.common.white}
                            sx={{
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {row.formul}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={12} lg={12} sx={{ mx: 3, mb: 2 }}>
                        <Table aria-label="collapse table">
                          <TableHead
                            sx={{
                              position: "sticky",
                              top: 100,
                              zIndex: 1,
                              backgroundColor: `${bgColor}`,
                            }}
                          >
                            <TableRow>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  Kodu
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  Adı
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  V.B.
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  V.A.
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  F.B.
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  F.A
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  R.B.
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  R.A.
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  B.B.
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: "#2E8B57" }}>
                                <Typography variant="h6" align="center">
                                  A.B.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.hesaplar?.map(
                              (donusumMizan: DonusumMizan, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Typography variant="body1" align="center">
                                      {donusumMizan.detayKodu}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body1" align="center">
                                      {donusumMizan.hesapAdi}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body1" align="right">
                                      {formatNumber(donusumMizan.vukBorc)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body1" align="right">
                                      {formatNumber(donusumMizan.vukAlacak)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body1" align="right">
                                      {formatNumber(donusumMizan.fisBorc)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body1" align="right">
                                      {formatNumber(donusumMizan.fisAlacak)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body1" align="right">
                                      {formatNumber(donusumMizan.raporBorc)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body1" align="right">
                                      {formatNumber(donusumMizan.raporAlacak)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body1" align="right">
                                      {formatNumber(donusumMizan.borcBakiye)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body1" align="right">
                                      {formatNumber(donusumMizan.alacakBakiye)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </Grid>
                    </Grid>
                  </Collapse>
                </TableCell>
              </TableRow>
            )}
            {/* Recursively render child rows */}
            {renderRows(rows, row.id, level + 1)}
          </React.Fragment>
        );
      });
  };

  return (
    <Grid container>
      <Grid item xs={12} lg={12}>
        <NakitAkisCardTable natData={natData} fdtData={fdtData} />
      </Grid>

      <Grid item xs={12} lg={12}>
        <TableContainer
          sx={{
            maxHeight: "684px",
            overflow: "auto",
          }}
        >
          <Table aria-label="simple table">
            <TableHead
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                backgroundColor: `${bgColor}`,
              }}
            >
              <TableRow>
                <TableCell sx={{ px: "10px" }}>
                  <Typography variant="h6" align="left">
                    {title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" align="center">
                    Dipnot
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" align="center">
                    Cari Dönem
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" align="center">
                    Önceki Dönem
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Start rendering from the top-level (parentId: null) */}
              {renderRows(natData, null)}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default NakitAkisTablosu;
