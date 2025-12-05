"use client";

import { Box, Button, Grid, Typography, Paper, FormControl, Select, MenuItem } from "@mui/material";
import { useState } from "react";
import CustomFormLabel from "../../Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "../../Forms/ThemeElements/CustomTextField";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

interface DenetimSozlesmesiStepProps {
    data?: any;
    sirket?: any;
    onDataChange: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function DenetimSozlesmesiStep({
    data,
    sirket,
    onDataChange,
    onNext,
    onBack,
}: DenetimSozlesmesiStepProps) {
    const [sozlesmeTipi, setSozlesmeTipi] = useState(data?.sozlesmeTipi || "");
    const [baslangicTarihi, setBaslangicTarihi] = useState(data?.baslangicTarihi || "");
    const [bitisTarihi, setBitisTarihi] = useState(data?.bitisTarihi || "");
    const [kapsam, setKapsam] = useState(data?.kapsam || "");

    const handleNext = () => {
        if (!sozlesmeTipi || !baslangicTarihi) {
            alert("Lütfen zorunlu alanları doldurun");
            return;
        }

        onDataChange({
            sozlesmeTipi,
            baslangicTarihi,
            bitisTarihi,
            kapsam,
        });
        onNext();
    };

    return (
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2, md: 4 }, border: 1, borderColor: "divider" }}>
            <Typography variant="h5" gutterBottom>
                Denetim Sözleşmesi
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                {sirket?.sirketAdi || "Şirket"} için denetim sözleşmesi bilgilerini girin.
            </Typography>

            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12}>
                    <CustomFormLabel htmlFor="sozlesmeTipi">
                        Sözleşme Tipi *
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="sozlesmeTipi"
                            value={sozlesmeTipi}
                            onChange={(e) => setSozlesmeTipi(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                Sözleşme tipi seçin
                            </MenuItem>
                            <MenuItem value="Bağımsız Denetim">Bağımsız Denetim</MenuItem>
                            <MenuItem value="İç Denetim">İç Denetim</MenuItem>
                            <MenuItem value="Vergi Denetimi">Vergi Denetimi</MenuItem>
                            <MenuItem value="Uygunluk Denetimi">Uygunluk Denetimi</MenuItem>
                            <MenuItem value="Operasyonel Denetim">Operasyonel Denetim</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <CustomFormLabel htmlFor="baslangicTarihi">
                        Başlangıç Tarihi *
                    </CustomFormLabel>
                    <CustomTextField
                        id="baslangicTarihi"
                        type="date"
                        fullWidth
                        value={baslangicTarihi}
                        onChange={(e: any) => setBaslangicTarihi(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <CustomFormLabel htmlFor="bitisTarihi">
                        Bitiş Tarihi
                    </CustomFormLabel>
                    <CustomTextField
                        id="bitisTarihi"
                        type="date"
                        fullWidth
                        value={bitisTarihi}
                        onChange={(e: any) => setBitisTarihi(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <CustomFormLabel htmlFor="kapsam">
                        Denetim Kapsamı
                    </CustomFormLabel>
                    <CustomTextField
                        id="kapsam"
                        fullWidth
                        multiline
                        rows={4}
                        value={kapsam}
                        onChange={(e: any) => setKapsam(e.target.value)}
                        placeholder="Denetim kapsamını detaylı olarak belirtin..."
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                        <strong>Not:</strong> Detaylı sözleşme şartları ve ek dökümanlar kurulum sonrası eklenebilir.
                    </Typography>
                </Grid>
            </Grid>

            <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: "space-between", mt: { xs: 2, sm: 3, md: 4 } }}>
                <Button
                    variant="outlined"
                    onClick={onBack}
                    startIcon={<IconArrowLeft />}
                    sx={{ width: { xs: '100%', sm: 'auto' }, order: { xs: 2, sm: 1 } }}
                >
                    Geri
                </Button>
                <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<IconArrowRight />}
                    sx={{ width: { xs: '100%', sm: 'auto' }, order: { xs: 1, sm: 2 } }}
                >
                    İleri
                </Button>
            </Box>
        </Paper>
    );
}
