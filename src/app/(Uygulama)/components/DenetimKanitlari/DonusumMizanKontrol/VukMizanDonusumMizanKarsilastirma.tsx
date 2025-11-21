import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Collapse,
  IconButton,
  Button,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import theme from "@/utils/theme";
import { getDonusumMizanKarsilastirma } from "@/api/Donusum/Donusum";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface DonusumMizanKarsilastirmaItem {
  [x: string]: unknown;
  denetciId: number;
  denetlenenId: number;
  formulId?: number | null;
  kalemId: number;
  kalemAdi: String;
  kalemKodu: number;
  tabloAdi: "finansaldurum" | "karzarar" | string;
  vukBakiye: number;
  donusumBakiye: number;
  fark: number;
  yil: number;
  tur: String;
  sira: String;
  id: number;
}

export interface DonusumMizanKarsilastirmaColumn {
  field: keyof DonusumMizanKarsilastirmaItem; // item içindeki alanlardan biri
  header: string;
  align?: "left" | "right" | "center";
}

export const donusumMizanKarsilastirmaColumns: DonusumMizanKarsilastirmaColumn[] =
  [
    { field: "kalemAdi", header: "Kalem Adı", align: "left" },
    { field: "vukBakiye", header: "VUK Mizan Bakiye", align: "right" },
    { field: "donusumBakiye", header: "Dönüşüm Mizan Bakiye", align: "right" },
    { field: "fark", header: "Fark", align: "right" },
  ];
// Alt tablo componenti
const Row: React.FC<{
  item: DonusumMizanKarsilastirmaItem;
  childrenItems?: DonusumMizanKarsilastirmaItem[];
  level?: number;
}> = ({ item, childrenItems, level = 0 }) => {
  const [open, setOpen] = useState(true);

  const formatNumber = (num: number) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const paddingLeft = 1 + level * 2; // Her seviye için 2rem ekle

  return (
    <>
      <TableRow
        sx={{
          backgroundColor: "#fcf8f8ff",
          "&:hover": {
            backgroundColor: "#d0d0d0",
            cursor: childrenItems?.length ? "pointer" : "default",
          },
        }}
        onClick={() => childrenItems?.length && setOpen(!open)}
      >
        <TableCell sx={{ border: "1px solid #ccc", pl: `${paddingLeft}rem` }}>
          {childrenItems && childrenItems.length > 0 && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
          {item.kalemAdi}
        </TableCell>
        <TableCell
          align="right"
          sx={{ border: "1px solid #ccc", width: "25%" }}
        >
          {formatNumber(item.vukBakiye)}
        </TableCell>
        <TableCell
          align="right"
          sx={{ border: "1px solid #ccc", width: "25%" }}
        >
          {formatNumber(item.donusumBakiye)}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            border: "1px solid #ccc",
            width: "25%",
            color: item.fark > 0 ? "green" : item.fark < 0 ? "red" : "inherit",
            fontWeight: 600,
          }}
        >
          {formatNumber(item.fark)}
        </TableCell>
      </TableRow>

      {childrenItems && childrenItems.length > 0 && (
        <TableRow>
          <TableCell colSpan={4} sx={{ p: 0, border: "none" }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 0 }}>
                <Table size="small">
                  <TableBody>
                    {childrenItems.map((child) => (
                      <Row
                        key={child.id}
                        item={child}
                        childrenItems={
                          child.childrenItems as
                            | DonusumMizanKarsilastirmaItem[]
                            | undefined
                        }
                        level={level + 1}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// Ana tablo component
const VukMizanDonusumMizanKarsilastirma: React.FC = () => {
  const [veriler, setVeriler] = useState<DonusumMizanKarsilastirmaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVeriler = async () => {
      try {
        const res = await getDonusumMizanKarsilastirma();
        setVeriler(res);
      } catch {
        setError("Veri alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchVeriler();
  }, []);

  const exportToExcel = () => {
    if (!veriler || veriler.length === 0) return;
    const exportGroupedData = veriler.reduce((acc: any, item: any) => {
      if (!acc[item.tabloAdi]) acc[item.tabloAdi] = [];
      acc[item.tabloAdi].push(item);
      return acc;
    }, {});

    Object.keys(exportGroupedData).forEach((tabloAdi) => {
      const groupRows = exportGroupedData[tabloAdi];
      const worksheet = XLSX.utils.json_to_sheet(groupRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, tabloAdi);
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, `${tabloAdi}.xlsx`);
    });
  };

  if (loading) return <Typography>Yükleniyor...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Ana ve child verileri filtreleme
  const normalHesaplar = veriler.filter(
    (item) =>
      item.vukBakiye !== 0 || item.donusumBakiye !== 0 || item.fark !== 0
  );

  // Verileri tablo adına göre grupla
  const groupedData = normalHesaplar.reduce<
    Record<string, DonusumMizanKarsilastirmaItem[]>
  >((acc, item) => {
    if (!acc[item.tabloAdi]) acc[item.tabloAdi] = [];
    acc[item.tabloAdi].push(item);
    return acc;
  }, {});

  return (
    <div style={{ padding: "1rem" }}>
      <Typography variant="h5" gutterBottom>
        Dönüşüm Mizan Karşılaştırma Tablosu
      </Typography>

      {Object.keys(groupedData).map((tabloAdi) => {
        const group = groupedData[tabloAdi];
        const mainRow = {
          ...group[0],
          kalemAdi: tabloAdi,
          vukBakiye: group.reduce((sum, item) => sum + item.vukBakiye, 0),
          donusumBakiye: group.reduce(
            (sum, item) => sum + item.donusumBakiye,
            0
          ),
          fark: group.reduce((sum, item) => sum + item.fark, 0),
        };
        const childrenRows = group.slice(0);

        return (
          <div key={tabloAdi} style={{ marginBottom: "2rem" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ textTransform: "capitalize" }}
            >
              {tabloAdi} Tablosu
            </Typography>

            <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
              <Table sx={{ borderCollapse: "collapse" }}>
                <TableHead>
                  <TableRow>
                    {donusumMizanKarsilastirmaColumns.map((col, index) => (
                      <TableCell
                        key={col.field}
                        align={col.align ?? "left"}
                        sx={{
                          backgroundColor: "#5947faff",
                          color: "#faf5f5ff",
                          fontWeight: 600,
                          border: "1px solid #ccc",
                          py: 1,
                        }}
                      >
                        {index === 0
                          ? ""
                          : index === 1
                          ? "VUK Mizan Bakiye"
                          : index === 2
                          ? "Dönüşüm Mizan Bakiye"
                          : "Fark"}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  <Row item={mainRow} childrenItems={childrenRows} />
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );
      })}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          sx={{
            mt: 1,
            backgroundColor: "white",
            color: "black",
            border: "1px solid black",
            "&:hover": {
              backgroundColor: "lightgrey",
              border: "1px solid black",
            },
          }}
          onClick={exportToExcel}
        >
          Excel'e Aktar
        </Button>
      </Box>
    </div>
  );
};

export default VukMizanDonusumMizanKarsilastirma;
