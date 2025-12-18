import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { getDonusumKayitlari, DonusumKayitlariKontrolSatirDto, DonusumBobiFisDto, DonusumKayitlariResponse } from "@/api/CalismaKagitlari/DonusumKayitlariKontrol";

interface DonusumKayitlariProps {
    controller: string;
    dipnotNo: string;
}

const fmt = (n: any) =>
    Number(n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DonusumKayitlariKontrol: React.FC<DonusumKayitlariProps> = ({
    controller,
    dipnotNo,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const [veriler, setVeriler] = useState<DonusumKayitlariResponse[]>([]);
    const [anaHesaplar, setAnaHesaplar] = useState<DonusumKayitlariKontrolSatirDto[]>([]);
    const [donusumFisleri, setDonusumFisleri] = useState<DonusumBobiFisDto[]>([]);
    const [loading, setLoading] = useState(false);

    // Colors
    // Header blue from image: approx #2196F3 or similar light blue
    const HEADER_BLUE = "#42A5F5";
    const HEADER_TEXT = "#FFFFFF";
    const SUB_HEADER_BG = theme.palette.mode === 'dark' ? theme.palette.grey[800] : "#CFD8DC"; // Light gray for column headers
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const TEXT_COLOR = theme.palette.mode === 'dark' ? "#FFFFFF" : "#000000";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getDonusumKayitlari(
                    controller,
                    user.token || "",
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    dipnotNo
                );
                if (res) {
                    setAnaHesaplar(res.kayitlar);
                    setDonusumFisleri(res.donusumFisler);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [controller, dipnotNo, user.token, user.denetciId, user.denetlenenId, user.yil]);

    const renderAnaHesaplarTable = () => {

        return (
            <Box mb={4}>
                <Box sx={{ backgroundColor: HEADER_BLUE, px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color={HEADER_TEXT}>
                        Ana Hesaplar
                    </Typography>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0'}` }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: SUB_HEADER_BG }}>
                                <TableCell sx={{ fontWeight: 700, color: TEXT_COLOR }}>Hesap No</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "right", color: TEXT_COLOR }}>VUK Bakiye</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "right", color: TEXT_COLOR }}>Dönüşüm Bakiye</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "right", color: TEXT_COLOR }}>Fark</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {anaHesaplar.map((row, idx) => (
                                <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                    <TableCell sx={{ color: TEXT_COLOR }}>{row.kebirKodu}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.vukBakiye)}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.donusumBakiye)}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.fark)}</TableCell>
                                </TableRow>
                            ))}
                            {anaHesaplar.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ color: TEXT_COLOR }}>Veri bulunamadı</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        )
    };

    const renderDonusumFisleriTable = () => (
        <Box mb={4}>
            <Box sx={{ backgroundColor: HEADER_BLUE, px: 2, py: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} color={HEADER_TEXT}>
                    Dönüşüm Fişleri
                </Typography>
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0'}` }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: SUB_HEADER_BG }}>
                            <TableCell sx={{ fontWeight: 700, color: TEXT_COLOR }}>Hesap No</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: TEXT_COLOR }}>Yevmiye No</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: TEXT_COLOR }}>Hesap Adı</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: "right", color: TEXT_COLOR }}>Borç</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: "right", color: TEXT_COLOR }}>Alacak</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: TEXT_COLOR }}>Açıklama</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {donusumFisleri.map((row, idx) => (
                            <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                <TableCell sx={{ color: TEXT_COLOR }}>{row.hesapKodu}</TableCell>
                                <TableCell sx={{ color: TEXT_COLOR }}>{row.yevmiyeNo}</TableCell>
                                <TableCell sx={{ color: TEXT_COLOR }}>{row.hesapAdi}</TableCell>
                                <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.borc)}</TableCell>
                                <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.alacak)}</TableCell>
                                <TableCell sx={{ color: TEXT_COLOR }}>{row.aciklama}</TableCell>
                            </TableRow>
                        ))}
                        {donusumFisleri.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ color: TEXT_COLOR }}>Veri bulunamadı</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box px={3} pt={3} pb={5} sx={{ width: "100%", margin: "0 auto" }}>
                    {renderAnaHesaplarTable()}
                    {renderDonusumFisleriTable()}
                </Box>
            </Grid>
        </Grid>
    );
};

export default DonusumKayitlariKontrol;
