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
import { getKarsilastirmaliAnaliz } from "@/api/Analizler/Analizler";
import KarsilastirmaliAnalizChart from "./KarsilastirmaliAnalizChart";

interface Veri {
  id: number;
  tabloAdi: string;
  kalemId: number | null;
  kalemParentId: number | null;
  parentId: number | null;
  adi: string;
  kebirKodu: number | null;
  tutarCariDonem: number;
  tutarOncekiDonem: number;
  mutlak: number;
  yuzde: number;
  reel: number;
}

interface Props {
  showGraph: boolean;
  hesaplaTiklandimi: boolean;
}

const KarsilastirmaliAnaliz: React.FC<Props> = ({
  showGraph,
  hesaplaTiklandimi,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();
  const bgColor = theme.palette.background.default;

  const [title, setTitle] = useState("");
  const [title2, setTitle2] = useState("");

  const [kalemData, setKalemData] = React.useState<Veri[]>([]);
  const [hesapData, setHesapData] = React.useState<Veri[]>([]);

  const [kalemData2, setKalemData2] = React.useState<Veri[]>([]);
  const [hesapData2, setHesapData2] = React.useState<Veri[]>([]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const fetchData = async () => {
    try {
      const karsilastirmaliAnalizTablosu = await getKarsilastirmaliAnaliz(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      setTitle(karsilastirmaliAnalizTablosu[0]?.adi);
      let control = true;
      const kalemList: Veri[] = [];
      const hesapList: Veri[] = [];

      const kalemList2: Veri[] = [];
      const hesapList2: Veri[] = [];

      karsilastirmaliAnalizTablosu.forEach((veri: Veri) => {
        const newRow = {
          id: veri.id,
          tabloAdi: veri.tabloAdi,
          kalemId: veri.kalemId !== undefined ? veri.kalemId : null,
          kalemParentId:
            veri.kalemParentId !== undefined ? veri.kalemParentId : null,
          parentId: veri.parentId !== undefined ? veri.parentId : null,
          adi: veri.adi,
          kebirKodu: veri.kebirKodu !== undefined ? veri.kebirKodu : null,
          tutarCariDonem: veri.tutarCariDonem,
          tutarOncekiDonem: veri.tutarOncekiDonem,
          mutlak: veri.mutlak,
          yuzde: veri.yuzde,
          reel: veri.reel,
        };
        if (newRow.tabloAdi == "finansaldurum") {
          if (newRow.kalemId !== null) {
            kalemList.push(newRow);
          }
          if (newRow.parentId !== null) {
            hesapList.push(newRow);
          }
        } else if (newRow.tabloAdi == "karzarar") {
          if (newRow.kalemId !== null) {
            if (control) {
              setTitle2(newRow.adi);
              control = false;
            }
            kalemList2.push(newRow);
          }
          if (newRow.parentId !== null) {
            hesapList2.push(newRow);
          }
        }
      });

      setKalemData(kalemList);
      setHesapData(hesapList);
      setKalemData2(kalemList2);
      setHesapData2(hesapList2);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setKalemData([]);
      setHesapData([]);
      setKalemData2([]);
      setHesapData2([]);
      setTitle("");
      setTitle2("");
    } else {
      fetchData();
    }
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
  ) => {
    return rows
      .filter((row) => row.kalemParentId === kalemId)
      .map((row) => {
        let backgroundColor = "#cccccc"; // Default: gri
        let color = theme.palette.common.black; // Default: siyah
        let fontType = "body1";
        let control = false;
        // Define row color based on having children or grandchildren
        if (hasChildren(rows, row.kalemId || 0)) {
          if (hasGrandchildren(rows, row.kalemId || 0)) {
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
        if (row.adi.startsWith("Toplam")) {
          backgroundColor = "#253662"; // Default: mavi
          color = theme.palette.common.white; // Default: beyaz
          fontType = "h6";
        }

        if (
          row.adi.startsWith("Dönem Net Karı (Zararı) (+/-)") ||
          row.adi.startsWith("Dönem Karı (Zararı) (+/-)") ||
          row.adi.startsWith("Brüt Kar (Zarar) (+/-)") ||
          row.adi.startsWith("Esas Faaliyet Karı (Zararı) (+/-)")
        ) {
          backgroundColor = "#253662"; // Default: mavi
          color = theme.palette.common.white; // Default: beyaz
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
                  variant={fontType == "body1" ? "body1" : "h6"}
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
                  {formatNumber(row.mutlak)}
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
                  %{formatNumber(row.yuzde)}
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
                  %{formatNumber(row.reel)}
                </Typography>
              </TableCell>
            </TableRow>
            {/* Eğer kontrol sağlanıyorsa farklı çıktı üret */}
            {control &&
              row.tabloAdi == "finansaldurum" &&
              hesapData
                .filter((hesap) => hesap.parentId === row.kalemId)
                .map((hesap) => (
                  <TableRow key={hesap.id}>
                    <TableCell
                      style={{
                        paddingLeft: (level + 1) * 32 + 10,
                        backgroundColor: "#2E8B57", // Default: Yeşil
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
                        backgroundColor: "#2E8B57", // Default: Yeşil
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
                        backgroundColor: "#2E8B57", // Default: Yeşil
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
                        backgroundColor: "#2E8B57", // Default: Yeşil
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        {formatNumber(hesap.mutlak)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57", // Default: Yeşil
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        %{formatNumber(hesap.yuzde)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57", // Default: Yeşil
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        %{formatNumber(hesap.reel)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            {control &&
              row.tabloAdi == "karzarar" &&
              hesapData2
                .filter((hesap) => hesap.parentId === row.kalemId)
                .map((hesap) => (
                  <TableRow key={hesap.id}>
                    <TableCell
                      style={{
                        paddingLeft: (level + 1) * 32 + 10,
                        backgroundColor: "#2E8B57", // Default: Yeşil
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
                        backgroundColor: "#2E8B57", // Default: Yeşil
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
                        backgroundColor: "#2E8B57", // Default: Yeşil
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
                        backgroundColor: "#2E8B57", // Default: Yeşil
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        {formatNumber(hesap.mutlak)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57", // Default: Yeşil
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        %{formatNumber(hesap.yuzde)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: "#2E8B57", // Default: Yeşil
                        color: theme.palette.common.white,
                        fontStyle: "italic",
                        border: `1px solid ${bgColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant={"body2"} align="right">
                        %{formatNumber(hesap.reel)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            {/* Recursively render child rows */}
            {renderRows(rows, row.kalemId || 0, level + 1)}
          </React.Fragment>
        );
      });
  };

  return (
    <Grid container>
      {showGraph ? (
        <Grid item xs={12} lg={12} mt={3}>
          <KarsilastirmaliAnalizChart
            kalemData={kalemData}
            tabloAdi={kalemData[0].tabloAdi}
            title={title}
          />
        </Grid>
      ) : (
        <Grid item xs={12} lg={12} mt={1}>
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
                      {user.yil ? user.yil - 1 : 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      {user.yil}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Mutlak
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Yüzde
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Reel
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Start rendering from the top-level (parentId: null) */}
                {renderRows(kalemData, kalemData[0]?.kalemId || null)}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
      {showGraph ? (
        <Grid item xs={12} lg={12} mt={5}>
          <KarsilastirmaliAnalizChart
            kalemData={kalemData2}
            tabloAdi={kalemData2[0].tabloAdi}
            title={title2}
          />
        </Grid>
      ) : (
        <Grid item xs={12} lg={12} mt={5}>
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
                      {title2}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      {user.yil ? user.yil - 1 : 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      {user.yil}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Mutlak
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Yüzde
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" align="center">
                      Reel
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Start rendering from the top-level (parentId: null) */}
                {renderRows(kalemData2, kalemData2[0]?.kalemId || null)}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  );
};

export default KarsilastirmaliAnaliz;
