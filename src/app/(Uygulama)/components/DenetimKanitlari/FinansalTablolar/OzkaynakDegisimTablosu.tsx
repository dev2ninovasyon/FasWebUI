"use client";

import React, { useEffect, useState } from "react";
import {
  Grid,
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
import { getOzkaynakTablosu } from "@/api/FinansalTablolar/FinansalToblolar";

interface Veri {
  id: number;
  dikeyKalemId: number;
  yatayKalemId: number;
  dikeyKalemAdi: string;
  yatayKalemAdi: string;
  formul: number;
  tutar: number;
  kalemOzkaynakId: number;
  formulOzkaynakNavigationId: number;
}

const OzkaynakDegisimTablosu: React.FC = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const bgColor = theme.palette.background.default;

  const [title, setTitle] = useState("");

  const [dikeyData, setDikeyData] = React.useState<Veri[]>([]);
  const [yatayData, setYatayData] = React.useState<Veri[]>([]);
  const [ozkaynakData, setOzkaynakData] = React.useState<Veri[]>([]);

  const [renkliKalemIds, setRenkliKalemIds] = React.useState<number[]>([]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const fetchData = async () => {
    try {
      const ozkaynakTablosu = await getOzkaynakTablosu(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      const ozkaynakData: Veri[] = [];
      const renkli: number[] = [];

      ozkaynakTablosu.forEach((veri: Veri) => {
        const newRow = {
          id: veri.id,
          dikeyKalemId: veri.dikeyKalemId,
          yatayKalemId: veri.yatayKalemId,
          dikeyKalemAdi: veri.dikeyKalemAdi,
          yatayKalemAdi: veri.yatayKalemAdi,
          formul: veri.formul,
          tutar: veri.tutar,
          kalemOzkaynakId: veri.kalemOzkaynakId,
          formulOzkaynakNavigationId: veri.formulOzkaynakNavigationId,
        };

        if (veri.dikeyKalemAdi.includes("Tablosu")) {
          if (
            veri.dikeyKalemAdi.includes("Münferit") ||
            veri.dikeyKalemAdi.includes("Konsolide")
          ) {
            setTitle(veri.dikeyKalemAdi);
          }
          return;
        }

        if (veri.dikeyKalemAdi.includes("[abstract]")) {
          renkli.push(veri.dikeyKalemId);
          renkli.push(veri.dikeyKalemId - 1);
        }
        if (veri.dikeyKalemAdi.includes("Dönem Sonu Bakiyeler")) {
          renkli.push(veri.dikeyKalemId);
          renkli.push(veri.dikeyKalemId - 1);
        }

        if (veri.yatayKalemAdi && veri.dikeyKalemId) {
          ozkaynakData.push(newRow);
        }
      });

      const distinctDikeyKalemObj = Array.from(
        new Map(ozkaynakData.map((veri) => [veri.dikeyKalemId, veri])).values()
      );

      const distinctYatayKalemObj = Array.from(
        new Map(ozkaynakData.map((veri) => [veri.yatayKalemId, veri])).values()
      );

      setDikeyData(distinctDikeyKalemObj);
      setYatayData(distinctYatayKalemObj);
      setOzkaynakData(ozkaynakData);
      setRenkliKalemIds(renkli);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid container>
      <Grid item xs={12} lg={12}>
        <TableContainer
          sx={{
            maxHeight: "684px",
            overflow: "auto",
          }}
        >
          <Table aria-label="financial table">
            <TableHead
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: `${bgColor}`,
              }}
            >
              <TableRow>
                <TableCell
                  sx={{
                    maxHeight: 205,
                    width: 300,
                    maxWidth: 300,
                    verticalAlign: "bottom",
                  }}
                >
                  <Typography variant="body1" align="left">
                    {title}
                  </Typography>
                </TableCell>
                {yatayData.map((kalem, index) => (
                  <TableCell
                    key={kalem.id}
                    sx={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      maxHeight: 205,
                      width: 100,
                      maxWidth: 100,
                      //overflow: "auto",
                    }}
                  >
                    <Typography variant="body1" align="left">
                      {kalem.yatayKalemAdi}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dikeyData.map((dikeyKalem, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  sx={{
                    height:
                      dikeyKalem.dikeyKalemAdi == "ÖNCEKİ DÖNEM" ||
                      dikeyKalem.dikeyKalemAdi == "CARİ DÖNEM" ||
                      dikeyKalem.dikeyKalemAdi.includes("[abstract]")
                        ? 40
                        : 80,
                    maxHeight:
                      dikeyKalem.dikeyKalemAdi == "ÖNCEKİ DÖNEM" ||
                      dikeyKalem.dikeyKalemAdi == "CARİ DÖNEM" ||
                      dikeyKalem.dikeyKalemAdi.includes("[abstract]")
                        ? 40
                        : 80,
                    backgroundColor:
                      dikeyKalem.dikeyKalemAdi == "ÖNCEKİ DÖNEM"
                        ? "#2E8B57"
                        : dikeyKalem.dikeyKalemAdi == "CARİ DÖNEM"
                        ? customizer.activeMode == "dark"
                          ? theme.palette.primary.dark
                          : theme.palette.primary.main
                        : renkliKalemIds.includes(dikeyKalem.dikeyKalemId)
                        ? "#253662" // Mavi
                        : "#cccccc", // Gri
                  }}
                >
                  <TableCell
                    sx={{
                      color:
                        dikeyKalem.dikeyKalemAdi == "ÖNCEKİ DÖNEM" ||
                        dikeyKalem.dikeyKalemAdi == "CARİ DÖNEM" ||
                        renkliKalemIds.includes(dikeyKalem.dikeyKalemId)
                          ? theme.palette.common.white
                          : theme.palette.common.black,
                      border: `1px solid ${bgColor}`,
                      borderRadius: 0,
                    }}
                  >
                    <Typography variant="body1">
                      {dikeyKalem.dikeyKalemAdi}
                    </Typography>
                  </TableCell>
                  {yatayData.map((yatayKalem, colIndex) => {
                    const cellData = ozkaynakData.find(
                      (item) =>
                        item.dikeyKalemId === dikeyKalem.dikeyKalemId &&
                        item.yatayKalemId === yatayKalem.yatayKalemId
                    );
                    return (
                      <TableCell
                        key={colIndex}
                        sx={{
                          border: `1px solid ${bgColor}`,
                          borderRadius: 0,
                          color:
                            dikeyKalem.dikeyKalemAdi == "ÖNCEKİ DÖNEM" ||
                            dikeyKalem.dikeyKalemAdi == "CARİ DÖNEM" ||
                            renkliKalemIds.includes(dikeyKalem.dikeyKalemId)
                              ? theme.palette.common.white
                              : theme.palette.common.black,
                        }}
                        align="right"
                      >
                        {dikeyKalem.dikeyKalemAdi == "ÖNCEKİ DÖNEM" ||
                        dikeyKalem.dikeyKalemAdi == "CARİ DÖNEM" ||
                        dikeyKalem.dikeyKalemAdi.includes("[abstract]")
                          ? null
                          : cellData
                          ? formatNumber(cellData.tutar)
                          : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default OzkaynakDegisimTablosu;
