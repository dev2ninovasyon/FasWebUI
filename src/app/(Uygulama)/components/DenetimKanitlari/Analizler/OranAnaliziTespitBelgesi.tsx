"use client";

import React, { useEffect, useState } from "react";
import {
  CardHeader,
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
import { getDikeyAnaliz } from "@/api/Analizler/Analizler";
import DikeyAnalizChart from "./DikeyAnalizChart";
import BelgeKontrolCard from "../../CalismaKagitlari/Cards/BelgeKontrolCard";

interface Veri {
  id: number;
  tabloAdi: string;
  kalemId: number | null;
  kalemParentId: number | null;
  parentId: number | null;
  adi: string;
  kebirKodu: number | null;
  tutarCariDonem: number;
  oranGenelCariDonem: number;
  oranGrupCariDonem: number;
  tutarOncekiDonem: number;
  oranGenelOncekiDonem: number;
  oranGrupOncekiDonem: number;
}

interface Props {
  showGraph: boolean;
  hesaplaTiklandimi: boolean;
}

const OranAnaliziTespitBelgesi: React.FC<Props> = ({
  showGraph,
  hesaplaTiklandimi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();
  const bgColor = theme.palette.background.default;

  const [title, setTitle] = useState("");
  const [kalemData, setKalemData] = useState<Veri[]>([]);
  const [hesapData, setHesapData] = useState<Veri[]>([]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num ?? 0);
  };

  const controller = "OranAnaliziTespitBelgesi";
  
  const fetchData = async () => {
    try {
      const dikeyAnalizTablosu = await getDikeyAnaliz(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      // Sadece kar/zarar (gelir tablosu) kayıtları
      const gelirVerileri = dikeyAnalizTablosu.filter(
        (veri: Veri) => veri.tabloAdi === "karzarar"
      );

      if (gelirVerileri.length > 0) {
        setTitle(gelirVerileri[0].adi);
      } else {
        setTitle("");
      }

      const kalemList: Veri[] = [];
      const hesapList: Veri[] = [];

      gelirVerileri.forEach((veri: Veri) => {
        const newRow: Veri = {
          id: veri.id,
          tabloAdi: veri.tabloAdi,
          kalemId: veri.kalemId ?? null,
          kalemParentId: veri.kalemParentId ?? null,
          parentId: veri.parentId ?? null,
          adi: veri.adi,
          kebirKodu: veri.kebirKodu ?? null,
          tutarCariDonem: veri.tutarCariDonem,
          oranGenelCariDonem: veri.oranGenelCariDonem,
          oranGrupCariDonem: veri.oranGrupCariDonem,
          tutarOncekiDonem: veri.tutarOncekiDonem,
          oranGenelOncekiDonem: veri.oranGenelOncekiDonem,
          oranGrupOncekiDonem: veri.oranGrupOncekiDonem,
        };

        if (newRow.kalemId !== null) {
          kalemList.push(newRow);
        }
        if (newRow.parentId !== null) {
          hesapList.push(newRow);
        }
      });

      setKalemData(kalemList);
      setHesapData(hesapList);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (hesaplaTiklandimi) {
      // reset
      setKalemData([]);
      setHesapData([]);
      setTitle("");
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hesaplaTiklandimi]);

  const hasChildren = (rows: Veri[], kalemId: number) => {
    return rows.some((row) => row.kalemParentId === kalemId);
  };

  const hasGrandchildren = (rows: Veri[], kalemId: number) => {
    return rows.some(
      (row) =>
        hasChildren(rows, row.kalemId || 0) && row.kalemParentId === kalemId
    );
  };

  const renderRows = (
    rows: Veri[],
    kalemId: number | null,
    level: number = 0
  ): React.ReactNode => {
    return rows
      .filter((row) => row.kalemParentId === kalemId)
      .map((row) => {
        let backgroundColor = "#cccccc"; // Default: gri
        let color = theme.palette.common.black; // Default: siyah
        let fontType: "body1" | "h6" = "body1";
        let control = false;

        // Çocuk / torun durumuna göre renklendirme
        if (hasChildren(rows, row.kalemId || 0)) {
          if (hasGrandchildren(rows, row.kalemId || 0)) {
            backgroundColor = "#253662"; // torunu var: mavi
            color = theme.palette.common.white;
            fontType = "h6";
          } else {
            backgroundColor = "#D35400"; // çocuğu var ama torunu yok: turuncu
            color = theme.palette.common.white;
          }
        } else {
          control = true; // yaprak
        }

        if (row.adi.startsWith("Toplam")) {
          backgroundColor = "#253662";
          color = theme.palette.common.white;
          fontType = "h6";
        }

        if (
          row.adi.startsWith("Dönem Net Karı (Zararı) (+/-)") ||
          row.adi.startsWith("Dönem Karı (Zararı) (+/-)") ||
          row.adi.startsWith("Brüt Kar (Zarar) (+/-)") ||
          row.adi.startsWith("Esas Faaliyet Karı (Zararı) (+/-)")
        ) {
          backgroundColor = "#253662";
          color = theme.palette.common.white;
        }

        return (
          <React.Fragment key={row.id}>
            <TableRow>
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
                  variant={fontType}
                  align="left"
                  display={"flex"}
                  alignItems={"center"}
                >
                  {row.adi}
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
                <Typography variant={"body1"} align="right">
                  {formatNumber(row.tutarOncekiDonem)}
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
                  %{formatNumber(row.oranGenelOncekiDonem)}
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
                  %{formatNumber(row.oranGrupOncekiDonem)}
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
                  {formatNumber(row.tutarCariDonem)}
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
                  %{formatNumber(row.oranGenelCariDonem)}
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
                  %{formatNumber(row.oranGrupCariDonem)}
                </Typography>
              </TableCell>
            </TableRow>

            {/* Hesap kırılımı (kebir) */}
            {control &&
              row.tabloAdi === "karzarar" &&
              hesapData
                .filter((hesap) => hesap.parentId === row.kalemId)
                .map((hesap) => (
                  <TableRow key={hesap.id}>
                    <TableCell
                      style={{
                        paddingLeft: (level + 1) * 32 + 10,
                        backgroundColor: "#2E8B57",
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography
                        variant={"body2"}
                        align="left"
                        display={"flex"}
                        alignItems={"center"}
                      >
                        {`${hesap.kebirKodu} - ${hesap.adi}`}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57",
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        {formatNumber(hesap.tutarOncekiDonem)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57",
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        %{formatNumber(hesap.oranGenelOncekiDonem)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57",
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        %{formatNumber(hesap.oranGrupOncekiDonem)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57",
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        {formatNumber(hesap.tutarCariDonem)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57",
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        %{formatNumber(hesap.oranGenelCariDonem)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57",
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        %{formatNumber(hesap.oranGrupCariDonem)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}

            {/* Alt kalemler */}
            {renderRows(rows, row.kalemId || 0, level + 1)}
          </React.Fragment>
        );
      });
  };

    const roluVarMi =
    user?.rol?.includes("KaliteKontrolSorumluDenetci") ||
    user?.rol?.includes("SorumluDenetci") ||
    user?.rol?.includes("Denetci") ||
    user?.rol?.includes("DenetciYardimcisi");
  return (
    <Grid container>
      {showGraph ? (
        <Grid
          mt={3}
          size={{
            xs: 12,
            lg: 12
          }}>
          {kalemData.length > 0 && (
            <DikeyAnalizChart
              kalemData={kalemData}
              tabloAdi={kalemData[0].tabloAdi}
              title={title}
            />
          )}
        </Grid>
      ) : (
        <Grid
          mt={1}
          size={{
            xs: 12,
            lg: 12
          }}>
          <TableContainer
            sx={{
              maxHeight: "684px",
              overflow: "auto",
            }}
          >
            <Table aria-label="gelir tablosu dikey analiz">
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backgroundColor: bgColor,
                }}
              >
                <TableRow>
                  <TableCell sx={{ px: "10px" }}>
                    <Typography variant="h6" align="left">
                      {title || "Gelir Değerlendirme Belgesi"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      {user.yil ? user.yil - 1 : 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Genel % ({user.yil ? user.yil - 1 : 0})
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Grup % ({user.yil ? user.yil - 1 : 0})
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      {user.yil}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Genel % ({user.yil || 0})
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Grup % ({user.yil || 0})
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderRows(kalemData, null)}</TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
      {!showGraph && roluVarMi && (
       <Grid mt={4} size={12}>
         <Grid
           container
           sx={{
             width: "95%",
             margin: "0 auto",
             justifyContent: "space-between",
           }}
         >
           <Grid
             mt={3}
             size={{
               xs: 12,
               md: 3.9,
               lg: 3.9
             }}>
             <CardHeader
               title={<Typography variant="h5">Hazırlayan:</Typography>}
               sx={{ p: 0, mb: 1 }}
             />
             <BelgeKontrolCard
               controller={controller}
               fetch={fetchData}
               hazirlayan="Denetçi - Yardımcı Denetçi"
             />
           </Grid>
           <Grid
             mt={3}
             size={{
               xs: 12,
               md: 3.9,
               lg: 3.9
             }}>
             <CardHeader
               title={<Typography variant="h5">Onaylayan:</Typography>}
               sx={{ p: 0, mb: 1 }}
             />
             <BelgeKontrolCard
               controller={controller}
               fetch={fetchData}
               onaylayan="Sorumlu Denetçi"
             />
           </Grid>
           <Grid
             mt={3}
             size={{
               xs: 12,
               md: 3.9,
               lg: 3.9
             }}>
             <CardHeader
               title={<Typography variant="h5">Belge Kontrol:</Typography>}
               sx={{ p: 0, mb: 1 }}
             />
             <BelgeKontrolCard
               controller={controller}
               fetch={fetchData}
               kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
             />
           </Grid>
         </Grid>
       </Grid>
       )}
    </Grid>
  );
};

export default OranAnaliziTespitBelgesi;
